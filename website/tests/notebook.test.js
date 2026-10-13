import test from "node:test";
import assert from "node:assert/strict";
import { Notebook } from "../src/notebook.js";
const notes = [{ id: "a" }, { id: "b" }, { id: "c" }];
function finish(book, note, source = "r2") {
  for (const state of ["flying", "opening", "reading", "closing", "departing"])
    book.transition(state);
  book.complete(note, source);
}
test("rapid requests remain locked through flight, reading, closing and departure", () => {
  const b = new Notebook();
  assert.equal(b.begin(), true);
  const n = b.choose(notes);
  for (const s of ["flying", "opening", "reading", "closing", "departing"]) {
    b.transition(s);
    assert.equal(b.begin(), false);
    assert.equal(b.count, 0);
  }
  b.complete(n, "r2");
  assert.equal(b.count, 1);
  assert.equal(b.begin(), true);
});
test("all notes precede repeats and unique count stops at total", () => {
  const b = new Notebook({ random: () => 0.5 });
  const drawn = [];
  for (let i = 0; i < 12; i++) {
    b.begin();
    const n = b.choose(notes);
    drawn.push(n.id);
    finish(b, n);
    assert.equal(b.count, Math.min(i + 1, 3));
  }
  assert.equal(new Set(drawn.slice(0, 3)).size, 3);
  for (let i = 3; i < 12; i += 3) {
    assert.equal(new Set(drawn.slice(i, i + 3)).size, 3);
    assert.notEqual(drawn[i], drawn[i - 1]);
  }
});
test("collection rereads preserve shuffle and count; a newly arrived note beats repeats", () => {
  const b = new Notebook({ random: () => 0.5 });
  for (let i = 0; i < 3; i++) {
    b.begin();
    finish(b, b.choose(notes));
  }
  b.begin();
  const next = b.choose(notes);
  finish(b, next);
  const queue = [...b.queue],
    last = b.lastId;
  b.begin();
  finish(b, notes[0], "collection");
  assert.deepEqual(b.queue, queue);
  assert.equal(b.lastId, last);
  assert.equal(b.count, 3);
  b.begin();
  assert.equal(b.choose([...notes, { id: "new" }]).id, "new");
});
test("persistent progress includes IDs only; unavailable notes cannot be selected", () => {
  let saved;
  const b = new Notebook({ persist: (s) => (saved = s) });
  b.begin();
  finish(b, { ...b.choose(notes), message: "private message" });
  assert.equal(JSON.stringify(saved).includes("private message"), false);
  const restored = new Notebook({ saved });
  assert.equal(restored.count, 1);
  restored.begin();
  assert.equal(restored.choose([{ id: "only" }]).id, "only");
});
test("zero/one note, storage denial and reset are safe", () => {
  const b = new Notebook({
    persist: () => {
      throw Error("blocked");
    },
  });
  b.begin();
  assert.equal(b.choose([]), null);
  b.cancel();
  b.begin();
  const n = b.choose([{ id: "one" }]);
  assert.equal(b.reset(), false);
  finish(b, n);
  b.begin();
  finish(b, b.choose([{ id: "one" }]));
  assert.equal(b.count, 1);
  assert.equal(b.reset(), true);
  assert.equal(b.count, 0);
});
test("a canceled launch is not collected or consumed", () => {
  const b = new Notebook();
  b.begin();
  const n = b.choose(notes);
  const queue = [...b.queue];
  b.cancel();
  assert.equal(b.count, 0);
  assert.deepEqual(b.queue, queue);
  b.begin();
  assert.equal(b.choose(notes).id, n.id);
});
