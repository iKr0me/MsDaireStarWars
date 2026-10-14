-- Run once in the Supabase SQL Editor for this project. No website user receives
-- database credentials: Vercel calls the explicitly granted RPCs with a secret key.
begin;

create schema if not exists note_private;
revoke all on schema note_private from public, anon, authenticated, service_role;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (length(btrim(sender)) > 0 and length(sender) <= 1000),
  message text not null check (length(btrim(message)) > 0 and length(message) <= 8000),
  status text not null default 'pending' check (status in ('uploading', 'pending', 'approved', 'rejected')),
  photo_path text unique,
  photo_approved boolean not null default false,
  moderation_flags text[] not null default '{}',
  moderation_status text not null default 'passed' check (moderation_status in ('passed', 'flagged')),
  moderation_override boolean not null default false,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint notes_photo_path check (photo_path is null or photo_path = id::text || '.jpg'),
  constraint notes_photo_approval check (not photo_approved or (photo_path is not null and status = 'approved')),
  constraint notes_screening_state check ((moderation_status = 'flagged') = (cardinality(moderation_flags) > 0))
);
comment on table public.notes is 'Review notes here: change pending to approved or rejected. Approve an optional photo separately with photo_approved after reviewing the file in private Storage.';
comment on column public.notes.moderation_flags is 'Basic automated screening hints only. Every note and optional photo still needs organizer review.';
comment on column public.notes.moderation_override is 'Required before approving flagged text. Set true only after reviewing the original flags and deciding the note is appropriate. Flags are preserved.';
comment on column public.notes.message is 'The API enforces 400 user-visible characters (graphemes), including spaces; SQL also caps raw codepoints for defense in depth.';
comment on column public.notes.photo_path is 'Private note-photos Storage object. A nonempty path does not mean the photo is approved.';
comment on column public.notes.status is 'uploading is an incomplete save: retry the original submission, or delete an abandoned row. Never approve uploading.';

create table if not exists note_private.submissions (
  visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
  request_id uuid not null,
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  text_fingerprint text not null check (text_fingerprint ~ '^[a-f0-9]{64}$'),
  -- No cascading foreign key: deleting a reviewed note must not reset quota or
  -- make a successful retry recreate it. This UUID is also a receipt tombstone.
  note_id uuid not null unique,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  reserved_until timestamptz,
  primary key (visitor_hash, request_id)
);
create index if not exists note_submissions_quota on note_private.submissions (visitor_hash, completed_at, reserved_until);
create index if not exists note_submissions_duplicates on note_private.submissions (visitor_hash, text_fingerprint, completed_at, reserved_until);
create index if not exists notes_approved_page on public.notes (created_at, id) where status = 'approved';

alter table public.notes enable row level security;
alter table note_private.submissions enable row level security;
-- No anon/authenticated policies exist. Even service_role uses RPCs, not table grants.
revoke all on public.notes from public, anon, authenticated, service_role;
revoke all on note_private.submissions from public, anon, authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('note-photos', 'note-photos', false, 1048576, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];
-- A restrictive policy also denies access if another application in this project
-- has a broader permissive Storage policy. Dashboard/service-role access remains.
drop policy if exists note_photos_deny_browser on storage.objects;
create policy note_photos_deny_browser on storage.objects as restrictive for all to anon, authenticated
  using (bucket_id <> 'note-photos') with check (bucket_id <> 'note-photos');

create or replace function note_private.guard_note_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.moderation_flags is distinct from old.moderation_flags or new.moderation_status is distinct from old.moderation_status then
    raise exception 'Keep the original screening flags. Use moderation_override after reviewing a flagged note.';
  end if;
  if new.status = 'approved' and new.moderation_status = 'flagged' and not new.moderation_override then
    raise exception 'This note was flagged. Review its moderation_flags and explicitly set moderation_override before approving it.';
  end if;
  if old.status = 'uploading' and new.status = 'approved' then
    raise exception 'This photo is still uploading. The original sender must retry before this note can be approved.';
  end if;
  if new.status = 'approved' and new.photo_path is not null and not exists (
    select 1 from storage.objects o where o.bucket_id = 'note-photos' and o.name = new.photo_path
  ) then
    raise exception 'This photo upload is incomplete. Do not approve this note until the upload finishes.';
  end if;
  if new.status <> 'approved' then new.photo_approved := false; end if;
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists notes_review_guard on public.notes;
create trigger notes_review_guard before update on public.notes for each row execute function note_private.guard_note_review();
revoke all on function note_private.guard_note_review() from public, anon, authenticated, service_role;

-- Called only inside the per-visitor advisory lock. Completed saves count for
-- 24 hours; incomplete photo attempts reserve a slot for at most 15 minutes.
create or replace function note_private.quota_wait(p_visitor_hash text, p_now timestamptz)
returns integer language sql stable set search_path = '' as $$
  select case when count(*) >= 5 then greatest(1, ceil(extract(epoch from (
    min(case when s.completed_at is not null then s.completed_at + interval '24 hours' else s.reserved_until end) - p_now
  ))))::integer else 0 end
  from note_private.submissions s where s.visitor_hash = p_visitor_hash
    and (s.completed_at > p_now - interval '24 hours' or (s.completed_at is null and s.reserved_until > p_now));
$$;
revoke all on function note_private.quota_wait(text, timestamptz) from public, anon, authenticated, service_role;

create or replace function public.begin_note_submission(
  p_visitor_hash text, p_request_id uuid, p_fingerprint text,
  p_text_fingerprint text, p_sender text, p_message text,
  p_moderation_flags text[], p_has_photo boolean
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_existing note_private.submissions%rowtype;
  v_id uuid;
  v_status text;
  v_wait integer;
  v_now timestamptz;
begin
  if p_visitor_hash !~ '^[a-f0-9]{64}$' or p_fingerprint !~ '^[a-f0-9]{64}$' or p_text_fingerprint !~ '^[a-f0-9]{64}$'
     or p_visitor_hash is null or p_request_id is null or p_fingerprint is null or p_text_fingerprint is null then
    raise exception 'Invalid submission identity';
  end if;
  -- Serializes fresh sends, expired-upload retries, and finalization across
  -- Vercel instances. Read wall time after taking the lock, not before waiting.
  perform pg_advisory_xact_lock(hashtextextended(p_visitor_hash, 0));
  v_now := clock_timestamp();
  select * into v_existing from note_private.submissions s
    where s.visitor_hash = p_visitor_hash and s.request_id = p_request_id;
  if found then
    if v_existing.fingerprint <> p_fingerprint then
      return jsonb_build_object('error', 'request_conflict');
    end if;
    select n.status into v_status from public.notes n where n.id = v_existing.note_id;
    if not found or v_existing.completed_at is not null or v_status <> 'uploading' then
      -- A deleted or reviewed note remains a receipt, never a new submission.
      return jsonb_build_object('id', v_existing.note_id, 'duplicate', true, 'upload_needed', false);
    end if;
    if v_existing.reserved_until > v_now then
      return jsonb_build_object('id', v_existing.note_id, 'duplicate', true, 'upload_needed', true);
    end if;
    -- The upload reservation expired. Reacquire a slot atomically before doing
    -- more storage work, including re-checking a newer duplicate submission.
    if exists (select 1 from note_private.submissions s where s.visitor_hash = p_visitor_hash
        and s.request_id <> p_request_id and s.text_fingerprint = p_text_fingerprint
        and (s.completed_at > v_now - interval '24 hours' or (s.completed_at is null and s.reserved_until > v_now))) then
      return jsonb_build_object('error', 'duplicate_text');
    end if;
    v_wait := note_private.quota_wait(p_visitor_hash, v_now);
    if v_wait > 0 then return jsonb_build_object('error', 'rate_limit', 'retry_after', v_wait); end if;
    update note_private.submissions set reserved_until = v_now + interval '15 minutes'
      where visitor_hash = p_visitor_hash and request_id = p_request_id;
    return jsonb_build_object('id', v_existing.note_id, 'duplicate', true, 'upload_needed', true);
  end if;
  if exists (select 1 from note_private.submissions s where s.visitor_hash = p_visitor_hash
      and s.text_fingerprint = p_text_fingerprint
      and (s.completed_at > v_now - interval '24 hours' or (s.completed_at is null and s.reserved_until > v_now))) then
    return jsonb_build_object('error', 'duplicate_text');
  end if;
  v_wait := note_private.quota_wait(p_visitor_hash, v_now);
  if v_wait > 0 then return jsonb_build_object('error', 'rate_limit', 'retry_after', v_wait); end if;
  v_id := gen_random_uuid();
  insert into public.notes (id, sender, message, status, photo_path, moderation_flags, moderation_status, created_at)
  values (v_id, p_sender, p_message, case when p_has_photo then 'uploading' else 'pending' end,
    case when p_has_photo then v_id::text || '.jpg' else null end, coalesce(p_moderation_flags, '{}'),
    case when cardinality(coalesce(p_moderation_flags, '{}')) > 0 then 'flagged' else 'passed' end, v_now);
  insert into note_private.submissions (visitor_hash, request_id, fingerprint, text_fingerprint, note_id, created_at, completed_at, reserved_until)
  values (p_visitor_hash, p_request_id, p_fingerprint, p_text_fingerprint, v_id, v_now,
    case when p_has_photo then null else v_now end, case when p_has_photo then v_now + interval '15 minutes' else null end);
  return jsonb_build_object('id', v_id, 'duplicate', false, 'upload_needed', p_has_photo);
end;
$$;

create or replace function public.finalize_note_submission(p_visitor_hash text, p_request_id uuid, p_fingerprint text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_submission note_private.submissions%rowtype;
  v_note public.notes%rowtype;
  v_now timestamptz;
  v_wait integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_visitor_hash, 0));
  v_now := clock_timestamp();
  select * into v_submission from note_private.submissions s
    where s.visitor_hash = p_visitor_hash and s.request_id = p_request_id;
  if not found or p_fingerprint is null or v_submission.fingerprint <> p_fingerprint then return jsonb_build_object('ok', false); end if;
  select * into v_note from public.notes n where n.id = v_submission.note_id for update;
  if not found or v_submission.completed_at is not null or v_note.status <> 'uploading' then
    -- Retrying a deleted/completed note cannot recreate it or undo a review.
    return jsonb_build_object('ok', true);
  end if;
  if not exists (select 1 from storage.objects o where o.bucket_id = 'note-photos' and o.name = v_note.photo_path) then
    return jsonb_build_object('ok', false);
  end if;
  if v_submission.reserved_until is null or v_submission.reserved_until <= v_now then
    -- A late storage response must not become a sixth note after another send
    -- took its expired slot. Re-check capacity and duplicates under this lock.
    if exists (select 1 from note_private.submissions s where s.visitor_hash = p_visitor_hash
        and s.request_id <> p_request_id and s.text_fingerprint = v_submission.text_fingerprint
        and (s.completed_at > v_now - interval '24 hours' or (s.completed_at is null and s.reserved_until > v_now))) then
      return jsonb_build_object('ok', false, 'error', 'duplicate_text');
    end if;
    v_wait := note_private.quota_wait(p_visitor_hash, v_now);
    if v_wait > 0 then return jsonb_build_object('ok', false, 'error', 'rate_limit', 'retry_after', v_wait); end if;
  end if;
  update note_private.submissions set completed_at = v_now, reserved_until = null
    where visitor_hash = p_visitor_hash and request_id = p_request_id;
  update public.notes set status = 'pending' where id = v_note.id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.list_approved_notes(
  p_after timestamptz default null, p_after_id uuid default null,
  p_limit integer default 51, p_id uuid default null
) returns table (id uuid, sender text, message text, photo_path text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select n.id, n.sender, n.message, case when n.photo_approved then n.photo_path else null end, n.created_at
  from public.notes n
  where n.status = 'approved' and (n.moderation_status = 'passed' or n.moderation_override) and (p_id is null or n.id = p_id)
    and (p_after is null or (n.created_at, n.id) > (p_after, p_after_id))
  order by n.created_at, n.id
  limit greatest(1, least(coalesce(p_limit, 51), 51));
$$;

create or replace function public.approved_note_photo(p_id uuid)
returns table (photo_path text) language sql stable security definer set search_path = '' as $$
  select n.photo_path from public.notes n
  where n.id = p_id and n.status = 'approved' and (n.moderation_status = 'passed' or n.moderation_override) and n.photo_approved and n.photo_path is not null;
$$;

revoke all on function public.begin_note_submission(text, uuid, text, text, text, text, text[], boolean) from public, anon, authenticated;
revoke all on function public.finalize_note_submission(text, uuid, text) from public, anon, authenticated;
revoke all on function public.list_approved_notes(timestamptz, uuid, integer, uuid) from public, anon, authenticated;
revoke all on function public.approved_note_photo(uuid) from public, anon, authenticated;
grant execute on function public.begin_note_submission(text, uuid, text, text, text, text, text[], boolean) to service_role;
grant execute on function public.finalize_note_submission(text, uuid, text) to service_role;
grant execute on function public.list_approved_notes(timestamptz, uuid, integer, uuid) to service_role;
grant execute on function public.approved_note_photo(uuid) to service_role;

notify pgrst, 'reload schema';
commit;
