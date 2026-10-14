// The browser talks only to its own server. No Supabase credentials belong here.
export function createLiveAdapter(fetcher = globalThis.fetch) {
  async function request(url, options = {}) {
    let response;
    try {
      response = await fetcher(url, {
        ...options,
        credentials: 'same-origin',
        cache: 'no-store',
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      throw new Error('Could not reach the note service. Check your connection and try again.');
    }
    let payload;
    try { payload = await response.json(); } catch {
      throw new Error('The note service is unavailable. Please try again later.');
    }
    if (!response.ok) {
      const error = new Error(typeof payload.error === 'string' ? payload.error : 'Your note could not be saved. Please try again.');
      error.code = payload.code;
      error.status = response.status;
      throw error;
    }
    return payload;
  }
  function readNotes(payload) {
    if (!Array.isArray(payload.notes)) throw new Error('The note service returned an unexpected response.');
    return payload.notes.filter(note => note && typeof note.id === 'string' && typeof note.sender === 'string' && typeof note.message === 'string')
      .map(note => ({
        id: note.id, sender: note.sender, message: note.message,
        photoUrl: note.photoUrl === `/api/photo?id=${note.id}` ? note.photoUrl : null,
        createdAt: note.createdAt,
      }));
  }
  return {
    mode: 'live',
    async list() {
      const notes = new Map(), cursors = new Set();
      let cursor = null;
      do {
        const payload = await request(`/api/notes${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`);
        for (const note of readNotes(payload)) notes.set(note.id, note);
        cursor = payload.nextCursor ?? null;
        if (cursor && (typeof cursor !== 'string' || cursors.has(cursor))) throw new Error('Could not finish refreshing the notes. Please try again.');
        if (cursor) cursors.add(cursor);
      } while (cursor);
      return [...notes.values()];
    },
    async get(id) {
      return readNotes(await request(`/api/notes?id=${encodeURIComponent(id)}`))[0] ?? null;
    },
    async submit(draft) {
      const send = () => request('/api/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
      });
      let receipt;
      try { receipt = await send(); } catch (error) {
        // Cookie setup is the only automatic POST retry; the request ID stays identical.
        if (error.code !== 'SESSION_REQUIRED') throw error;
        receipt = await send();
      }
      if (!receipt || typeof receipt.id !== 'string' || receipt.status !== 'pending') {
        throw new Error('The save confirmation was incomplete. Try again with the same note.');
      }
      return receipt;
    },
  };
}
