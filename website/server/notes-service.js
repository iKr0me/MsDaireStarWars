import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import sharp from 'sharp';
import { characterCount } from '../src/submission.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY = 1_600_000;
const MAX_PHOTO = 1024 * 1024;
const PAGE_SIZE = 50;
const BUCKET = 'note-photos';
const sha256 = value => createHash('sha256').update(value).digest('hex');

class NoteError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const fail = (status, code, message) => { throw new NoteError(status, code, message); };
const commonHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  Vary: 'Cookie',
};
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { ...commonHeaders, ...headers } });

function config(env) {
  const url = env.SUPABASE_URL?.replace(/\/$/, '');
  const key = env.SUPABASE_SECRET_KEY;
  const cookieSecret = env.VISITOR_COOKIE_SECRET;
  if (!url || !key || !cookieSecret || cookieSecret.length < 32) {
    fail(503, 'NOT_CONFIGURED', 'Notes are not connected yet. Please try again later.');
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.pathname !== '/' || parsed.search || parsed.hash || parsed.username || parsed.password) throw Error();
  } catch { fail(503, 'NOT_CONFIGURED', 'Notes are not connected yet. Please try again later.'); }
  // New secret keys belong only in apikey; they are not JWT bearer tokens.
  const headers = { apikey: key };
  if (!key.startsWith('sb_secret_')) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
      if (payload.role !== 'service_role') throw Error();
    } catch { fail(503, 'NOT_CONFIGURED', 'Notes are not connected yet. Please try again later.'); }
    headers.Authorization = `Bearer ${key}`;
  }
  return { url, headers, cookieSecret };
}

function visitor(request, secret) {
  const secure = new URL(request.url).protocol === 'https:';
  const name = secure ? '__Host-note_visitor' : 'note_visitor';
  const cookie = request.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`))?.slice(name.length + 1);
  const sign = id => createHmac('sha256', secret).update(`visitor:${id}`).digest('base64url');
  const parts = cookie?.split('.') || [];
  let id;
  if (parts.length === 2 && UUID.test(parts[0])) {
    const expected = Buffer.from(sign(parts[0]));
    const actual = Buffer.from(parts[1]);
    if (actual.length === expected.length && timingSafeEqual(actual, expected)) id = parts[0];
  }
  const valid = Boolean(id);
  id ||= randomUUID();
  return {
    valid,
    hash: createHmac('sha256', secret).update(`database:${id}`).digest('hex'),
    cookie: valid ? null : `${name}=${id}.${sign(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure ? '; Secure' : ''}`,
  };
}

function checkOrigin(request) {
  const origin = request.headers.get('origin');
  if (origin !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') {
    fail(403, 'ORIGIN_NOT_ALLOWED', 'Please send your note from this website.');
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    fail(415, 'INVALID_CONTENT_TYPE', 'Please send your note using the form.');
  }
}

async function readBody(request) {
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY)) fail(413, 'TOO_LARGE', 'This note or photo is too large.');
  if (!request.body) fail(400, 'INVALID_REQUEST', 'Please enter a note.');
  const reader = request.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY) { await reader.cancel(); fail(413, 'TOO_LARGE', 'This note or photo is too large.'); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { fail(400, 'INVALID_REQUEST', 'The note could not be read. Please try again.'); }
}

export function screenText(sender, message) {
  const value = `${sender} ${message}`.normalize('NFKC').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  const tokens = value.replace(/[034@!$]/g, ch => ({ 0: 'o', 3: 'e', 4: 'a', '@': 'a', '!': 'i', '$': 's' })[ch]);
  const flags = [];
  if (/\b(?:fuck\w*|shit\w*|bitch\w*|asshole\w*|cunt\w*|motherfuck\w*)\b/.test(tokens)) flags.push('strong_language');
  if (/\b(?:kill|hurt|harm)\s+(?:you|yourself|her|him|them)\b|\b(?:hope|wish)\s+you\s+(?:die|dead)|\b(?:go\s+die|kys)\b/.test(tokens)) flags.push('threat_or_harassment');
  if (/\b(?:nude|nudes|porn|sexual|sex|rape)\b/.test(tokens)) flags.push('sexual_content');
  if (/https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|org|net|io|co|me|xyz|gg|edu)\b|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(value)) flags.push('link_or_contact');
  return flags;
}

async function validateDraft(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || typeof input.requestId !== 'string' || !UUID.test(input.requestId)) {
    fail(400, 'INVALID_REQUEST', 'Please refresh the form and try again.');
  }
  if (typeof input.sender !== 'string' || typeof input.message !== 'string') fail(400, 'INVALID_DRAFT', 'Enter your name and a message.');
  const sender = input.sender.normalize('NFC').trim();
  const message = input.message.normalize('NFC');
  if (!sender || characterCount(input.sender.normalize('NFC')) > 30 || sender.length > 1000) fail(400, 'INVALID_NAME', 'Enter a name of 1–30 characters.');
  if (!message.trim() || characterCount(message) > 400 || message.length > 8000) fail(400, 'INVALID_MESSAGE', 'Enter a message of 1–400 characters, including spaces.');
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(`${sender}${message}`)) fail(400, 'INVALID_DRAFT', 'Please remove unsupported control characters.');
  let photo = null;
  let sourceDigest = null;
  if (input.photo != null) {
    if (!input.consent || input.consent !== true) fail(400, 'PHOTO_CONSENT_REQUIRED', 'Confirm you have permission to share this photo publicly.');
    const source = input.photo;
    if (source.type !== 'image/jpeg' || typeof source.data !== 'string' || !source.data.length || source.data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(source.data)) {
      fail(400, 'INVALID_PHOTO', 'Choose a valid JPG, PNG or WebP photo in the form.');
    }
    const bytes = Buffer.from(source.data, 'base64');
    if (bytes.length > MAX_PHOTO) fail(413, 'PHOTO_TOO_LARGE', 'Please choose a smaller photo.');
    sourceDigest = sha256(bytes);
    try {
      const metadata = await sharp(bytes, { limitInputPixels: 16_000_000, failOn: 'warning' }).metadata();
      if (metadata.format !== 'jpeg' || !metadata.width || !metadata.height || (metadata.pages || 1) !== 1) throw Error();
      // Re-encoding excludes EXIF, location data, and embedded payloads by default.
      photo = await sharp(bytes, { limitInputPixels: 16_000_000, failOn: 'warning' })
        .rotate().resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      if (photo.length > MAX_PHOTO) throw Error();
    } catch { fail(400, 'INVALID_PHOTO', 'This photo could not be read. Please choose another photo.'); }
  }
  return {
    requestId: input.requestId, sender, message, photo,
    fingerprint: sha256(JSON.stringify([sender, message, sourceDigest, input.photo != null])),
    textFingerprint: sha256(JSON.stringify([sender.toLocaleLowerCase('en'), message.trim().toLocaleLowerCase('en')])),
    flags: screenText(sender, message),
  };
}

function parseCursor(value) {
  if (!value) return { after: null, afterId: null };
  try {
    if (value.length > 600 || !/^[A-Za-z0-9_-]+$/.test(value)) throw Error();
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString());
    if (!UUID.test(parsed.id) || typeof parsed.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(parsed.createdAt) || !Number.isFinite(Date.parse(parsed.createdAt))) throw Error();
    return { after: parsed.createdAt, afterId: parsed.id };
  } catch { fail(400, 'INVALID_CURSOR', 'Please reload the notes.'); }
}

// Dependency injection keeps request/security tests independent from a live project.
export function createNotesService({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  async function upstream(settings, path, init = {}) {
    let response;
    try {
      response = await fetchImpl(`${settings.url}${path}`, {
        ...init, headers: { ...settings.headers, ...init.headers }, signal: AbortSignal.timeout(15_000),
      });
    } catch { fail(503, 'SERVICE_UNAVAILABLE', 'Notes are temporarily unavailable. Please retry the same note.'); }
    if (!response.ok) fail(503, 'SERVICE_UNAVAILABLE', 'Notes are temporarily unavailable. Please retry the same note.');
    return response;
  }
  async function rpc(settings, name, body) {
    const response = await upstream(settings, `/rest/v1/rpc/${name}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    try { return await response.json(); }
    catch { fail(503, 'SERVICE_UNAVAILABLE', 'Notes are temporarily unavailable. Please try again.'); }
  }
  function handleError(error, headers) {
    if (error instanceof NoteError) return json({ error: error.message, code: error.code }, error.status, headers);
    // Do not expose database errors, credentials, or uploaded content in responses/logs.
    return json({ error: 'The note could not be saved. Please retry the same note.', code: 'SERVICE_UNAVAILABLE' }, 503, headers);
  }
  function checkReceiptError(result, headers) {
    if (result.error === 'rate_limit') {
      headers['Retry-After'] = String(Math.max(1, result.retry_after || 86400));
      fail(429, 'DAILY_LIMIT', 'You can send 5 notes in 24 hours. Please try again later.');
    }
    if (result.error === 'request_conflict') fail(409, 'REQUEST_CONFLICT', 'This send attempt belongs to a different note. Please start a new note.');
    if (result.error === 'duplicate_text') fail(409, 'DUPLICATE_NOTE', 'You already sent this note in the last 24 hours.');
  }
  return {
    async getNotes(request) {
      const headers = {};
      try {
        const settings = config(env);
        const session = visitor(request, settings.cookieSecret);
        if (session.cookie) headers['Set-Cookie'] = session.cookie;
        const params = new URL(request.url).searchParams;
        const id = params.get('id');
        if (id !== null && !UUID.test(id)) fail(400, 'INVALID_ID', 'This note could not be found.');
        const cursor = parseCursor(params.get('cursor'));
        const rows = await rpc(settings, 'list_approved_notes', { p_after: cursor.after, p_after_id: cursor.afterId, p_limit: PAGE_SIZE + 1, p_id: id });
        if (!Array.isArray(rows)) fail(503, 'SERVICE_UNAVAILABLE', 'Notes are temporarily unavailable.');
        const page = rows.slice(0, PAGE_SIZE);
        const last = page.at(-1);
        return json({
          notes: page.map(row => ({ id: row.id, sender: row.sender, message: row.message, photoUrl: row.photo_path ? `/api/photo?id=${encodeURIComponent(row.id)}` : null, createdAt: row.created_at })),
          nextCursor: rows.length > PAGE_SIZE ? Buffer.from(JSON.stringify({ id: last.id, createdAt: last.created_at })).toString('base64url') : null,
        }, 200, headers);
      } catch (error) { return handleError(error, headers); }
    },
    async postNote(request) {
      const headers = {};
      try {
        checkOrigin(request);
        const settings = config(env);
        const session = visitor(request, settings.cookieSecret);
        if (session.cookie) headers['Set-Cookie'] = session.cookie;
        if (!session.valid) fail(409, 'SESSION_REQUIRED', 'Your browser is ready. Please press Send again.');
        const draft = await validateDraft(await readBody(request));
        const result = await rpc(settings, 'begin_note_submission', {
          p_visitor_hash: session.hash, p_request_id: draft.requestId, p_fingerprint: draft.fingerprint,
          p_text_fingerprint: draft.textFingerprint, p_sender: draft.sender, p_message: draft.message,
          p_moderation_flags: draft.flags, p_has_photo: Boolean(draft.photo),
        });
        checkReceiptError(result, headers);
        if (!UUID.test(result.id)) fail(503, 'SERVICE_UNAVAILABLE', 'This note could not be saved. Please retry the same note.');
        if (result.upload_needed) {
          if (!draft.photo) fail(503, 'SERVICE_UNAVAILABLE', 'Please retry the same note with its photo.');
          await upstream(settings, `/storage/v1/object/${BUCKET}/${result.id}.jpg`, {
            method: 'POST', headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'true' }, body: draft.photo,
          });
          const finalized = await rpc(settings, 'finalize_note_submission', { p_visitor_hash: session.hash, p_request_id: draft.requestId, p_fingerprint: draft.fingerprint });
          checkReceiptError(finalized, headers);
          if (!finalized?.ok) fail(503, 'SERVICE_UNAVAILABLE', 'Your photo is still being saved. Please retry the same note.');
        }
        return json({ id: result.id, status: 'pending', duplicate: Boolean(result.duplicate) }, result.duplicate ? 200 : 201, headers);
      } catch (error) { return handleError(error, headers); }
    },
    async getPhoto(request) {
      try {
        const settings = config(env);
        const id = new URL(request.url).searchParams.get('id');
        if (!id || !UUID.test(id)) fail(404, 'NOT_FOUND', 'This photo is not available.');
        const rows = await rpc(settings, 'approved_note_photo', { p_id: id });
        const path = rows?.[0]?.photo_path;
        if (path !== `${id}.jpg`) fail(404, 'NOT_FOUND', 'This photo is not available.');
        const response = await upstream(settings, `/storage/v1/object/authenticated/${BUCKET}/${encodeURIComponent(path)}`);
        return new Response(response.body, { headers: { ...commonHeaders, 'Content-Type': 'image/jpeg', 'Content-Disposition': 'inline; filename="note-photo.jpg"' } });
      } catch (error) { return handleError(error); }
    },
  };
}
