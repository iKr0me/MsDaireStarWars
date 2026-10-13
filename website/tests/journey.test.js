import test from "node:test";
import assert from "node:assert/strict";
import { journeyState } from "../src/journey-state.js";
test("chapters follow scroll position and reverse exactly without accumulated state", () => {
  const steps = [0, 0.3, 0.7, 0.85, 1, 1.3, 2.5, 3.1, 3.24, 3.4, 3.6, 4.5];
  const forward = steps.map((x) => journeyState(x));
  const reverse = [...steps]
    .reverse()
    .map((x) => journeyState(x))
    .reverse();
  assert.deepEqual(reverse, forward);
  assert.equal(forward[0].chapter, "intro");
  assert.equal(journeyState(1).chapter, "galaxy");
  assert.equal(forward.at(-1).chapter, "farewell");
  assert.equal(journeyState(0.51).sceneVisible, false);
  assert.equal(journeyState(1).sceneVisible, true);
});
test("warp peaks at crossings and disappears in the reading scene; reduced motion never streaks", () => {
  assert.ok(journeyState(0.52).warp > 0.99);
  assert.ok(journeyState(1.49).warp > 0.99);
  for (const n of [0, 0.85, 1.2, 1.8, 1.98])
    assert.equal(journeyState(n).warp, 0);
  for (const n of [0.7, 0.86, 1, 3.1, 3.24, 3.4])
    assert.equal(journeyState(n, true).warp, 0);
});

test("reduced motion keeps a readable static chapter throughout both crossings", () => {
  assert.equal(journeyState(0.5, true).chapter, "intro");
  assert.equal(journeyState(0.85, true).chapter, "galaxy");
  assert.equal(journeyState(1.4, true).chapter, "galaxy");
  assert.equal(journeyState(1.7, true).chapter, "farewell");
  for (const n of [0.9, 1.3, 3.1, 3.3])
    assert.notEqual(journeyState(n, true).chapter, "transition");
});
