const transitions = {
  idle: ["loading"],
  loading: ["flying"],
  flying: ["opening"],
  opening: ["reading"],
  reading: ["closing"],
  closing: ["departing"],
  departing: ["idle"],
};
export class Notebook {
  constructor({
    saved,
    random = Math.random,
    now = Date.now,
    persist = () => {},
  } = {}) {
    this.random = random;
    this.now = now;
    this.persist = persist;
    this.state = "idle";
    this.collected = new Map(
      (Array.isArray(saved?.collected) ? saved.collected : [])
        .filter(
          (p) =>
            Array.isArray(p) &&
            typeof p[0] === "string" &&
            Number.isFinite(p[1]),
        )
        .slice(0, 10000),
    );
    this.queue = Array.isArray(saved?.queue)
      ? [...new Set(saved.queue.filter((id) => typeof id === "string"))].slice(
          0,
          10000,
        )
      : [];
    this.lastId = typeof saved?.lastId === "string" ? saved.lastId : null;
  }
  get count() {
    return this.collected.size;
  }
  get busy() {
    return this.state !== "idle";
  }
  begin() {
    if (this.busy) return false;
    this.state = "loading";
    return true;
  }
  transition(next) {
    if (!transitions[this.state]?.includes(next))
      throw new Error(`Invalid reader transition: ${this.state} → ${next}`);
    this.state = next;
  }
  shuffle(ids) {
    const a = [...ids];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  choose(notes) {
    const ids = [...new Set(notes.map((n) => n.id))],
      available = new Set(ids);
    this.queue = this.queue.filter((id) => available.has(id));
    const unread = ids.filter((id) => !this.collected.has(id));
    if (unread.length) {
      const missing = unread.filter((id) => !this.queue.includes(id));
      this.queue.unshift(...this.shuffle(missing));
      const id = this.queue.find((id) => !this.collected.has(id));
      this.save();
      return notes.find((n) => n.id === id);
    }
    if (!this.queue.length) {
      this.queue = this.shuffle(ids);
      if (this.queue.length > 1 && this.queue[0] === this.lastId)
        [this.queue[0], this.queue[1]] = [this.queue[1], this.queue[0]];
    }
    this.save();
    return notes.find((n) => n.id === this.queue[0]) ?? null;
  }
  complete(note, source) {
    if (this.state !== "departing")
      throw new Error("A note is only collected after departure.");
    if (!this.collected.has(note.id)) this.collected.set(note.id, this.now());
    if (source === "r2") {
      this.queue = this.queue.filter((id) => id !== note.id);
      this.lastId = note.id;
    }
    this.transition("idle");
    this.save();
  }
  cancel() {
    this.state = "idle";
  }
  reset() {
    if (this.busy) return false;
    this.collected.clear();
    this.queue = [];
    this.lastId = null;
    this.save();
    return true;
  }
  save() {
    try {
      this.persist({
        collected: [...this.collected],
        queue: [...this.queue],
        lastId: this.lastId,
      });
    } catch {
      /* Reading works even if storage is unavailable. */
    }
  }
}
