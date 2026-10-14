import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { createNotesService, screenText } from '../server/notes-service.js';

const origin = 'https://notes.example.test';
const id = 'b9b8c6ca-66af-4c41-8c49-e4b4a202a523';
const requestId = 'dd81d122-ed04-45c9-9e1a-df5cbda4777a';
const env = { SUPABASE_URL: 'https://project.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_server_test', VISITOR_COOKIE_SECRET: 'test-secret-with-at-least-thirty-two-characters' };
const draft = { requestId, sender: 'Sam', message: 'Hope you feel better soon!', photo: null, consent: false };
const response = body => Response.json(body);
const makeRequest = (body, cookie, options = {}) => new Request(`${origin}/api/notes`, {
  method: 'POST', headers: { origin, 'content-type': 'application/json', ...(cookie && { cookie }), ...options.headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
function harness(handler = () => response({ id, duplicate: false, upload_needed: false }), overrides = {}) {
  const calls = [];
  const service = createNotesService({ env: { ...env, ...overrides }, fetchImpl: async (url, init) => {
    const call = { url, ...init };
    calls.push(call);
    if (url.endsWith('/list_approved_notes')) return response([]);
    return handler(call);
  } });
  return { calls, service, async cookie() {
    const result = await service.getNotes(new Request(`${origin}/api/notes`));
    return result.headers.get('set-cookie')?.split(';')[0];
  } };
}

test('unconfigured service fails closed instead of claiming a note saved', async () => {
  const service = createNotesService({ env: {}, fetchImpl: () => { throw Error('must not fetch'); } });
  const result = await service.postNote(makeRequest(draft));
  assert.equal(result.status, 503);
  assert.equal((await result.json()).code, 'NOT_CONFIGURED');
});

test('GET bootstraps a signed secure HttpOnly cookie and sends secret only as apikey', async () => {
  const h = harness();
  const result = await h.service.getNotes(new Request(`${origin}/api/notes`));
  assert.match(result.headers.get('set-cookie'), /^__Host-note_visitor=.*; Path=\/; HttpOnly; SameSite=Lax; Max-Age=31536000; Secure$/);
  assert.equal(result.headers.get('cache-control'), 'private, no-store, max-age=0');
  assert.equal(result.headers.get('access-control-allow-origin'), null);
  assert.equal(h.calls[0].headers.apikey, env.SUPABASE_SECRET_KEY);
  assert.equal(h.calls[0].headers.Authorization, undefined);
});

test('legacy service-role JWT is supported; anon JWT is refused', async () => {
  const key = `a.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.b`;
  const h = harness(undefined, { SUPABASE_SECRET_KEY: key });
  await h.cookie();
  assert.equal(h.calls[0].headers.Authorization, `Bearer ${key}`);
  const anon = harness(undefined, { SUPABASE_SECRET_KEY: `a.${Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url')}.b` });
  const result = await anon.service.getNotes(new Request(`${origin}/api/notes`));
  assert.equal(result.status, 503);
  assert.equal(anon.calls.length, 0);
});

test('missing or tampered cookie returns a new session, without reserving a note', async () => {
  const h = harness();
  const cookie = await h.cookie();
  for (const value of [undefined, `${cookie}tampered`]) {
    const result = await h.service.postNote(makeRequest(draft, value));
    assert.equal(result.status, 409);
    assert.equal((await result.json()).code, 'SESSION_REQUIRED');
    assert.ok(result.headers.get('set-cookie'));
  }
  assert.equal(h.calls.length, 1);
});

test('cross-origin requests and non-JSON form posts cannot submit', async () => {
  const h = harness();
  const cookie = await h.cookie();
  for (const [headers, expected] of [
    [{ origin: 'https://attacker.example' }, 403],
    [{ 'sec-fetch-site': 'cross-site' }, 403],
    [{ 'content-type': 'text/plain' }, 415],
  ]) {
    const result = await h.service.postNote(makeRequest(draft, cookie, { headers }));
    assert.equal(result.status, expected);
  }
  assert.equal(h.calls.length, 1);
});

test('screened notes remain pending and private screening/identity fields never enter receipt', async () => {
  const h = harness();
  const cookie = await h.cookie();
  const result = await h.service.postNote(makeRequest({ ...draft, message: 'go die https://bad.example' }, cookie));
  assert.equal(result.status, 201);
  assert.deepEqual(await result.json(), { id, status: 'pending', duplicate: false });
  const body = JSON.parse(h.calls[1].body);
  assert.match(body.p_visitor_hash, /^[a-f0-9]{64}$/);
  assert.notEqual(body.p_visitor_hash, cookie.split('=')[1].split('.')[0]);
  assert.deepEqual(body.p_moderation_flags, ['threat_or_harassment', 'link_or_contact']);
  assert.equal(body.p_request_id, requestId);
});

test('400 user-visible characters including spaces pass; 401 and blank messages fail', async () => {
  const h = harness();
  const cookie = await h.cookie();
  const family = '👩‍👩‍👧‍👦';
  const good = await h.service.postNote(makeRequest({ ...draft, message: family.repeat(399) + ' ' }, cookie));
  assert.equal(good.status, 201);
  for (const message of ['a'.repeat(401), ' '.repeat(20), 'hello\u0000']) {
    const result = await h.service.postNote(makeRequest({ ...draft, message }, cookie));
    assert.equal(result.status, 400);
  }
  const badName = await h.service.postNote(makeRequest({ ...draft, sender: 'a'.repeat(31) }, cookie));
  assert.equal(badName.status, 400);
});

test('streamed JSON body limit cannot be bypassed by omitting content-length', async () => {
  const h = harness();
  const cookie = await h.cookie();
  const result = await h.service.postNote(makeRequest(' '.repeat(1_600_001), cookie));
  assert.equal(result.status, 413);
  assert.equal(h.calls.length, 1);
});

test('quota and duplicate conflicts have actionable status and no second write', async () => {
  for (const [error, code, status] of [
    ['rate_limit', 'DAILY_LIMIT', 429], ['duplicate_text', 'DUPLICATE_NOTE', 409], ['request_conflict', 'REQUEST_CONFLICT', 409],
  ]) {
    const h = harness(() => response({ error, retry_after: 120 }));
    const cookie = await h.cookie();
    const result = await h.service.postNote(makeRequest(draft, cookie));
    assert.equal(result.status, status);
    assert.equal((await result.json()).code, code);
    if (status === 429) assert.equal(result.headers.get('retry-after'), '120');
    assert.equal(h.calls.length, 2);
  }
});

test('idempotent completed retries return pending receipt without disclosing a later review decision', async () => {
  const h = harness(() => response({ id, duplicate: true, upload_needed: false, status: 'rejected' }));
  const cookie = await h.cookie();
  const result = await h.service.postNote(makeRequest(draft, cookie));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { id, status: 'pending', duplicate: true });
});

test('fake images, missing consent, and oversized photo data are rejected before saving', async () => {
  const h = harness();
  const cookie = await h.cookie();
  for (const photoDraft of [
    { photo: { type: 'image/jpeg', data: Buffer.from('<svg/>').toString('base64') }, consent: true },
    { photo: { type: 'image/svg+xml', data: Buffer.from('<svg/>').toString('base64') }, consent: true },
    { photo: { type: 'image/jpeg', data: 'AAAA' }, consent: false },
    { photo: { type: 'image/jpeg', data: Buffer.alloc(1024 * 1024 + 1).toString('base64') }, consent: true },
  ]) {
    const result = await h.service.postNote(makeRequest({ ...draft, ...photoDraft }, cookie));
    assert.ok([400, 413].includes(result.status));
  }
  assert.equal(h.calls.length, 1);
});

test('photo is re-encoded without metadata and only finalized after durable upload', async () => {
  const input = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#fae4d8' } })
    .withMetadata({ exif: { IFD0: { Artist: 'private student metadata' } } }).jpeg().toBuffer();
  const events = [];
  const h = harness(call => {
    if (call.url.endsWith('/begin_note_submission')) { events.push('reserve'); return response({ id, duplicate: false, upload_needed: true }); }
    if (call.url.includes('/storage/v1/object/')) { events.push('upload'); return response({ Key: `${id}.jpg` }); }
    if (call.url.endsWith('/finalize_note_submission')) { events.push('finalize'); return response({ ok: true }); }
    throw Error('unexpected request');
  });
  const cookie = await h.cookie();
  const result = await h.service.postNote(makeRequest({ ...draft, photo: { type: 'image/jpeg', data: input.toString('base64') }, consent: true }, cookie));
  assert.equal(result.status, 201);
  assert.deepEqual(events, ['reserve', 'upload', 'finalize']);
  const upload = h.calls.find(call => call.url.includes('/storage/v1/object/'));
  const metadata = await sharp(upload.body).metadata();
  assert.equal(metadata.format, 'jpeg');
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.icc, undefined);
  assert.equal(upload.headers['x-upsert'], 'true');
});

test('failed uploads stay retryable under same id; successful retry finalizes once', async () => {
  const input = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#abcdef' } }).jpeg().toBuffer();
  let reservations = 0;
  let uploads = 0;
  let finalizations = 0;
  const h = harness(call => {
    if (call.url.endsWith('/begin_note_submission')) return response({ id, duplicate: reservations++ > 0, upload_needed: true });
    if (call.url.includes('/storage/v1/object/')) return ++uploads === 1 ? new Response('temporary failure', { status: 500 }) : response({});
    if (call.url.endsWith('/finalize_note_submission')) { finalizations++; return response({ ok: true }); }
  });
  const cookie = await h.cookie();
  const photoDraft = { ...draft, photo: { type: 'image/jpeg', data: input.toString('base64') }, consent: true };
  const failed = await h.service.postNote(makeRequest(photoDraft, cookie));
  assert.equal(failed.status, 503);
  assert.equal(finalizations, 0);
  const retry = await h.service.postNote(makeRequest(photoDraft, cookie));
  assert.equal(retry.status, 200);
  assert.deepEqual(await retry.json(), { id, status: 'pending', duplicate: true });
  assert.equal(finalizations, 1);
  const bodies = h.calls.filter(call => call.url.endsWith('/begin_note_submission')).map(call => JSON.parse(call.body));
  assert.equal(bodies[0].p_fingerprint, bodies[1].p_fingerprint);
  assert.equal(bodies[0].p_request_id, bodies[1].p_request_id);
});

test('public list allowlists fields and paginates with microsecond cursor intact', async () => {
  let lastBody;
  const service = createNotesService({ env, fetchImpl: async (url, init) => {
    lastBody = JSON.parse(init.body);
    return response(Array.from({ length: 51 }, (_, i) => ({
      id: `b9b8c6ca-66af-4c41-8c49-${String(i).padStart(12, '0')}`,
      sender: 'Sam', message: 'A note', created_at: '2026-10-14T13:00:00.123456+00:00', photo_path: i === 0 ? `${id}.jpg` : null,
      status: 'approved', moderation_flags: ['private'], visitor_hash: 'private',
    })));
  } });
  const result = await service.getNotes(new Request(`${origin}/api/notes`));
  const body = await result.json();
  assert.equal(body.notes.length, 50);
  assert.deepEqual(Object.keys(body.notes[0]).sort(), ['createdAt', 'id', 'message', 'photoUrl', 'sender']);
  assert.match(body.notes[0].photoUrl, /^\/api\/photo\?id=/);
  assert.equal(body.notes[1].photoUrl, null);
  await service.getNotes(new Request(`${origin}/api/notes?cursor=${body.nextCursor}`));
  assert.equal(lastBody.p_after, '2026-10-14T13:00:00.123456+00:00');
  assert.equal(lastBody.p_after_id, body.notes[49].id);
});

test('single-note queries validate UUIDs and use the same approved-only listing RPC', async () => {
  const h = harness();
  const bad = await h.service.getNotes(new Request(`${origin}/api/notes?id=not-an-id`));
  assert.equal(bad.status, 400);
  assert.equal(h.calls.length, 0);
  const good = await h.service.getNotes(new Request(`${origin}/api/notes?id=${id}`));
  assert.equal(good.status, 200);
  assert.equal(JSON.parse(h.calls[0].body).p_id, id);
});

test('photo access re-checks approval and never exposes a storage URL', async () => {
  for (const [rows, expected] of [[[], 404], [[{ photo_path: '../other.jpg' }], 404], [[{ photo_path: `${id}.jpg` }], 200]]) {
    const h = harness(call => call.url.endsWith('/approved_note_photo') ? response(rows) : new Response(new Uint8Array([255, 216, 255])));
    const result = await h.service.getPhoto(new Request(`${origin}/api/photo?id=${id}`));
    assert.equal(result.status, expected);
    assert.equal(result.headers.get('location'), null);
    assert.match(result.headers.get('cache-control'), /no-store/);
    if (expected === 200) {
      assert.equal(result.headers.get('content-type'), 'image/jpeg');
      assert.match(h.calls[1].url, /\/storage\/v1\/object\/authenticated\/note-photos\//);
    } else assert.equal(h.calls.length, 1);
  }
});

test('basic screening flags context for human review without claiming reliable classification', () => {
  assert.deepEqual(screenText('Sam', 'I hope you feel better soon.'), []);
  assert.ok(screenText('fück', 'Get well').includes('strong_language'));
  assert.ok(screenText('Sam', 'Check www.example.com').includes('link_or_contact'));
});

test('an expired photo reservation refused at finalization returns quota/duplicate errors, never success', async () => {
  const bytes = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#aabbcc' } }).jpeg().toBuffer();
  for (const [error, status, code] of [['rate_limit', 429, 'DAILY_LIMIT'], ['duplicate_text', 409, 'DUPLICATE_NOTE']]) {
    const h = harness(call => {
      if (call.url.endsWith('/begin_note_submission')) return response({ id, duplicate: true, upload_needed: true });
      if (call.url.includes('/storage/v1/object/')) return response({});
      if (call.url.endsWith('/finalize_note_submission')) return response({ ok: false, error, retry_after: 45 });
    });
    const cookie = await h.cookie();
    const result = await h.service.postNote(makeRequest({ ...draft, photo: { type: 'image/jpeg', data: bytes.toString('base64') }, consent: true }, cookie));
    assert.equal(result.status, status);
    assert.equal((await result.json()).code, code);
    if (status === 429) assert.equal(result.headers.get('retry-after'), '45');
  }
});
