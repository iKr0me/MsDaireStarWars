import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

// Execute the shipped migration against real PostgreSQL compiled to WASM.
// Supabase's roles/Storage tables are represented below; its live gateway,
// dashboard and multi-connection lock behavior still require a deployed check.
let db;
const migration = readFileSync(new URL('../supabase/migrations/202610140001_notes.sql', import.meta.url), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const input = (overrides = {}) => {
  const unique = randomUUID();
  return {
    visitor: hash(unique), request: randomUUID(), fingerprint: hash(`draft:${unique}`),
    textFingerprint: hash(`text:${unique}`), sender: 'Sam', message: 'Get well soon, Ms. Daire!',
    flags: '{}', photo: false, ...overrides,
  };
};
const begin = async draft => (await db.query(`select public.begin_note_submission(
  $1::text,$2::uuid,$3::text,$4::text,$5::text,$6::text,$7::text[],$8::boolean
) as result`, [draft.visitor, draft.request, draft.fingerprint, draft.textFingerprint, draft.sender, draft.message, draft.flags, draft.photo])).rows[0].result;
const finalize = async draft => (await db.query('select public.finalize_note_submission($1::text,$2::uuid,$3::text) as result', [draft.visitor, draft.request, draft.fingerprint])).rows[0].result;
const photoFor = async id => (await db.query('select * from public.approved_note_photo($1::uuid)', [id])).rows;
const publicNote = async id => (await db.query('select * from public.list_approved_notes(null,null,51,$1::uuid)', [id])).rows;
async function asRole(role, callback) {
  assert.ok(['anon', 'authenticated', 'service_role'].includes(role));
  await db.exec(`set role ${role}`);
  try { return await callback(); }
  finally { await db.exec('reset role'); }
}

before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema storage;
    create table storage.buckets (
      id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
    );
    create table storage.objects (
      id uuid primary key default gen_random_uuid(), bucket_id text not null, name text not null,
      unique (bucket_id, name)
    );
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon, authenticated, service_role;
    grant all on storage.objects to anon, authenticated, service_role;
    create policy unrelated_broad_policy on storage.objects for all to anon, authenticated
      using (true) with check (true);
  `);
  await db.exec(migration);
});
after(async () => { await db?.close(); });

test('migration executes and can be safely rerun without changing data', async () => {
  const draft = input();
  const saved = await begin(draft);
  await db.exec(migration);
  const rows = (await db.query('select * from public.notes where id=$1', [saved.id])).rows;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'pending');
  assert.equal(rows[0].photo_approved, false);
});

test('anonymous and authenticated roles cannot read/write notes or call privileged RPCs', async () => {
  const draft = input();
  for (const role of ['anon', 'authenticated']) {
    await asRole(role, async () => {
      await assert.rejects(db.query('select * from public.notes'), /permission denied/);
      await assert.rejects(db.query("insert into public.notes(sender,message) values ('Sam','Hi')"), /permission denied/);
      await assert.rejects(db.query("update public.notes set status='approved'"), /permission denied/);
      await assert.rejects(db.query('select * from note_private.submissions'), /permission denied/);
      await assert.rejects(begin(draft), /permission denied/);
      await assert.rejects(db.query('select * from public.list_approved_notes()'), /permission denied/);
      await assert.rejects(photoFor(randomUUID()), /permission denied/);
    });
  }
});

test('service role accesses notes via RPCs; screening never auto-approves text', async () => {
  const draft = input({ flags: '{strong_language,threat_or_harassment}' });
  const receipt = await asRole('service_role', async () => {
    await assert.rejects(db.query('select * from public.notes'), /permission denied/);
    await assert.rejects(db.query('select * from note_private.submissions'), /permission denied/);
    return begin(draft);
  });
  const row = (await db.query('select status,moderation_flags,moderation_status,moderation_override from public.notes where id=$1', [receipt.id])).rows[0];
  assert.equal(row.status, 'pending');
  assert.equal(row.moderation_status, 'flagged');
  assert.equal(row.moderation_override, false);
  assert.deepEqual(row.moderation_flags, ['strong_language', 'threat_or_harassment']);
  assert.deepEqual(await asRole('service_role', () => publicNote(receipt.id)), []);
  await assert.rejects(db.query("update public.notes set status='approved' where id=$1", [receipt.id]), /explicitly set moderation_override/);
  await assert.rejects(db.query("update public.notes set moderation_flags='{}',moderation_status='passed' where id=$1", [receipt.id]), /original screening flags/);
  await db.query('update public.notes set moderation_override=true where id=$1', [receipt.id]);
  await db.query("update public.notes set status='approved' where id=$1", [receipt.id]);
  const listed = await asRole('service_role', () => publicNote(receipt.id));
  assert.equal(listed.length, 1);
  assert.deepEqual(Object.keys(listed[0]).sort(), ['created_at', 'id', 'message', 'photo_path', 'sender']);
  assert.equal(listed[0].photo_path, null);
});

test('five new notes exhaust one signed-browser quota, but retries do not count twice', async () => {
  const visitor = hash(randomUUID());
  const first = input({ visitor });
  const receipt = await begin(first);
  const retried = await begin(first);
  assert.equal(retried.id, receipt.id);
  assert.equal(retried.duplicate, true);
  for (let i = 0; i < 4; i++) assert.ok((await begin(input({ visitor }))).id);
  const limited = await begin(input({ visitor }));
  assert.equal(limited.error, 'rate_limit');
  assert.ok(limited.retry_after > 0 && limited.retry_after <= 86400);
  const count = (await db.query('select count(*)::int as count from note_private.submissions where visitor_hash=$1', [visitor])).rows[0].count;
  assert.equal(count, 5);
  assert.equal((await begin(first)).id, receipt.id);
  // Separate browsers on the same school network have separate quotas.
  assert.ok((await begin(input())).id);
});

test('quota rolls forward after 24 hours, preserving old idempotency receipts', async () => {
  const visitor = hash(randomUUID());
  const first = input({ visitor });
  const receipt = await begin(first);
  for (let i = 0; i < 4; i++) await begin(input({ visitor }));
  assert.equal((await begin(input({ visitor }))).error, 'rate_limit');
  await db.query("update note_private.submissions set completed_at=now()-interval '25 hours' where visitor_hash=$1", [visitor]);
  assert.ok((await begin(input({ visitor }))).id);
  assert.equal((await begin(first)).id, receipt.id);
});

test('same request with changed content conflicts; identical text under a new key is blocked', async () => {
  const draft = input();
  const receipt = await begin(draft);
  assert.equal((await begin({ ...draft, fingerprint: hash('changed') })).error, 'request_conflict');
  assert.equal((await begin({ ...draft, request: randomUUID() })).error, 'duplicate_text');
  assert.equal((await begin(draft)).id, receipt.id);
  // Another person may legitimately send the same brief message.
  assert.ok((await begin({ ...draft, visitor: hash(randomUUID()), request: randomUUID() })).id);
});

test('a photo stays uploading until its private object exists; incomplete uploads cannot be approved', async () => {
  const draft = input({ photo: true });
  const receipt = await begin(draft);
  assert.equal(receipt.upload_needed, true);
  assert.equal((await begin(draft)).upload_needed, true);
  assert.deepEqual(await finalize(draft), { ok: false });
  await assert.rejects(db.query("update public.notes set status='approved' where id=$1", [receipt.id]), /still uploading/);
  await db.query("insert into storage.objects(bucket_id,name) values ('note-photos',$1)", [`${receipt.id}.jpg`]);
  assert.deepEqual(await finalize(draft), { ok: true });
  assert.equal((await db.query('select status from public.notes where id=$1', [receipt.id])).rows[0].status, 'pending');
  assert.equal((await begin(draft)).upload_needed, false);
  assert.deepEqual(await publicNote(receipt.id), []);
  assert.deepEqual(await photoFor(receipt.id), []);
});

test('text approval alone does not publish photos; separate approval and later rejection take effect', async () => {
  const draft = input({ photo: true });
  const receipt = await begin(draft);
  await db.query("insert into storage.objects(bucket_id,name) values ('note-photos',$1)", [`${receipt.id}.jpg`]);
  await finalize(draft);
  await db.query("update public.notes set status='approved' where id=$1", [receipt.id]);
  assert.equal((await publicNote(receipt.id))[0].photo_path, null);
  assert.deepEqual(await photoFor(receipt.id), []);
  await db.query('update public.notes set photo_approved=true where id=$1', [receipt.id]);
  assert.equal((await publicNote(receipt.id))[0].photo_path, `${receipt.id}.jpg`);
  assert.deepEqual(await asRole('service_role', () => photoFor(receipt.id)), [{ photo_path: `${receipt.id}.jpg` }]);
  await db.query("update public.notes set status='rejected' where id=$1", [receipt.id]);
  assert.deepEqual(await publicNote(receipt.id), []);
  assert.deepEqual(await photoFor(receipt.id), []);
  const rejected = (await db.query('select photo_approved,reviewed_at from public.notes where id=$1', [receipt.id])).rows[0];
  assert.equal(rejected.photo_approved, false);
  assert.ok(rejected.reviewed_at);
  // Late/replayed finalization must not undo an organizer's rejection.
  assert.deepEqual(await finalize(draft), { ok: true });
  assert.equal((await db.query('select status from public.notes where id=$1', [receipt.id])).rows[0].status, 'rejected');
});

test('private photo policy overrides unrelated permissive Storage policies', async () => {
  const filename = `${randomUUID()}.jpg`;
  await db.query("insert into storage.objects(bucket_id,name) values ('note-photos',$1),('other-app',$1)", [filename]);
  for (const role of ['anon', 'authenticated']) {
    await asRole(role, async () => {
      const rows = (await db.query('select bucket_id from storage.objects where name=$1', [filename])).rows;
      assert.deepEqual(rows, [{ bucket_id: 'other-app' }]);
      await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('note-photos',$1)", [`${randomUUID()}.jpg`]), /row-level security/);
    });
  }
  const bucket = (await db.query("select public,file_size_limit,allowed_mime_types from storage.buckets where id='note-photos'")).rows[0];
  assert.equal(bucket.public, false);
  assert.deepEqual(bucket.allowed_mime_types, ['image/jpeg']);
  assert.equal(Number(bucket.file_size_limit), 1048576);
});

test('approved keyset pagination neither repeats nor skips rows sharing a timestamp', async () => {
  const ids = [];
  for (let i = 0; i < 3; i++) ids.push((await begin(input())).id);
  for (const id of ids) await db.query("update public.notes set status='approved',created_at='2099-01-01T00:00:00.123456Z' where id=$1", [id]);
  ids.sort();
  const rows = (await db.query("select * from public.list_approved_notes('2099-01-01T00:00:00.123456Z',$1,51,null)", [ids[0]])).rows;
  assert.deepEqual(rows.map(row => row.id), ids.slice(1));
});

test('deleting a note retains its receipt, duplicate record, and completed quota charge', async () => {
  const visitor = hash(randomUUID());
  const draft = input({ visitor });
  const receipt = await begin(draft);
  for (let i = 0; i < 4; i++) await begin(input({ visitor }));
  await db.query('delete from public.notes where id=$1', [receipt.id]);
  const retry = await begin(draft);
  assert.deepEqual(retry, { id: receipt.id, duplicate: true, upload_needed: false });
  assert.equal((await db.query('select count(*)::int as count from public.notes where id=$1', [receipt.id])).rows[0].count, 0);
  assert.equal((await begin(input({ visitor }))).error, 'rate_limit');
  assert.equal((await begin({ ...draft, request: randomUUID() })).error, 'duplicate_text');
  assert.deepEqual(await finalize(draft), { ok: true });
});

test('abandoned photo reservations release capacity after 15 minutes without publishing', async () => {
  const visitor = hash(randomUUID());
  const photo = input({ visitor, photo: true });
  const receipt = await begin(photo);
  for (let i = 0; i < 4; i++) await begin(input({ visitor }));
  assert.equal((await begin(input({ visitor }))).error, 'rate_limit');
  await db.query("update note_private.submissions set reserved_until=now()-interval '1 second' where note_id=$1", [receipt.id]);
  assert.ok((await begin(input({ visitor }))).id);
  assert.equal((await begin(photo)).error, 'rate_limit');
  const row = (await db.query('select status from public.notes where id=$1', [receipt.id])).rows[0];
  assert.equal(row.status, 'uploading');
  assert.deepEqual(await publicNote(receipt.id), []);
  assert.deepEqual(await photoFor(receipt.id), []);
  const ledger = (await db.query('select completed_at from note_private.submissions where note_id=$1', [receipt.id])).rows[0];
  assert.equal(ledger.completed_at, null);
});

test('an expired upload retry atomically reacquires a slot and completes under its original receipt', async () => {
  const visitor = hash(randomUUID());
  const photo = input({ visitor, photo: true });
  const receipt = await begin(photo);
  await db.query("update note_private.submissions set reserved_until=now()-interval '1 second' where note_id=$1", [receipt.id]);
  const retry = await begin(photo);
  assert.deepEqual(retry, { id: receipt.id, duplicate: true, upload_needed: true });
  const reserve = (await db.query('select reserved_until > now() as active from note_private.submissions where note_id=$1', [receipt.id])).rows[0];
  assert.equal(reserve.active, true);
  await db.query("insert into storage.objects(bucket_id,name) values ('note-photos',$1)", [`${receipt.id}.jpg`]);
  assert.deepEqual(await finalize(photo), { ok: true });
  const ledger = (await db.query('select completed_at,reserved_until from note_private.submissions where note_id=$1', [receipt.id])).rows[0];
  assert.ok(ledger.completed_at);
  assert.equal(ledger.reserved_until, null);
  assert.equal((await begin(photo)).id, receipt.id);
});

test('late finalization rechecks capacity instead of creating a sixth completed note', async () => {
  const visitor = hash(randomUUID());
  const photo = input({ visitor, photo: true });
  const receipt = await begin(photo);
  await db.query("insert into storage.objects(bucket_id,name) values ('note-photos',$1)", [`${receipt.id}.jpg`]);
  await db.query("update note_private.submissions set reserved_until=now()-interval '1 second' where note_id=$1", [receipt.id]);
  for (let i = 0; i < 5; i++) await begin(input({ visitor }));
  assert.equal((await finalize(photo)).error, 'rate_limit');
  assert.equal((await db.query('select status from public.notes where id=$1', [receipt.id])).rows[0].status, 'uploading');
  assert.equal((await db.query('select count(*)::int as count from note_private.submissions where visitor_hash=$1 and completed_at is not null', [visitor])).rows[0].count, 5);
  // One completed note ages out; the same stored upload may now finalize once.
  await db.query("update note_private.submissions set completed_at=now()-interval '25 hours' where note_id=(select note_id from note_private.submissions where visitor_hash=$1 and completed_at is not null limit 1)", [visitor]);
  assert.deepEqual(await finalize(photo), { ok: true });
  assert.equal((await db.query('select count(*)::int as count from note_private.submissions where visitor_hash=$1 and completed_at>now()-interval \'24 hours\'', [visitor])).rows[0].count, 5);
});

test('expired upload retry/finalization cannot bypass a newer completed duplicate', async () => {
  const photo = input({ photo: true });
  const receipt = await begin(photo);
  await db.query("insert into storage.objects(bucket_id,name) values ('note-photos',$1)", [`${receipt.id}.jpg`]);
  await db.query("update note_private.submissions set reserved_until=now()-interval '1 second' where note_id=$1", [receipt.id]);
  const replacement = { ...photo, request: randomUUID(), fingerprint: hash(randomUUID()), photo: false };
  assert.ok((await begin(replacement)).id);
  assert.equal((await begin(photo)).error, 'duplicate_text');
  assert.equal((await finalize(photo)).error, 'duplicate_text');
});

test('public RPCs recheck flagged-note override even if an administrator bypasses the review trigger', async () => {
  const photo = input({ photo: true, flags: '{strong_language}' });
  const receipt = await begin(photo);
  await db.query("insert into storage.objects(bucket_id,name) values ('note-photos',$1)", [`${receipt.id}.jpg`]);
  await finalize(photo);
  await db.exec('alter table public.notes disable trigger notes_review_guard');
  try {
    await db.query("update public.notes set status='approved',photo_approved=true where id=$1", [receipt.id]);
    assert.deepEqual(await asRole('service_role', () => publicNote(receipt.id)), []);
    assert.deepEqual(await asRole('service_role', () => photoFor(receipt.id)), []);
  } finally { await db.exec('alter table public.notes enable trigger notes_review_guard'); }
});
