import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS as C,journeyState} from '../src/journey-state.js';
const at=(p,start=C.enterStart,end=C.enterEnd)=>journeyState(start+p*(end-start));
test('chapters reverse without accumulated state and final scroll stops at farewell',()=>{
 const steps=[0,.3,.6,1,1.2,1.6,1.95,2.4,2.85,3.65];
 assert.deepEqual(steps.map(x=>journeyState(x)),[...steps].reverse().map(x=>journeyState(x)).reverse());
 assert.equal(journeyState(0).chapter,'intro');assert.equal(journeyState(1.6).chapter,'galaxy');assert.equal(journeyState(C.end).chapter,'farewell');
 assert.equal(at(.1).sceneVisible,false);assert.equal(at(.9).sceneVisible,true);
});
test('five warp stages increase count/length before slowing and settling',()=>{
 assert.ok(at(.1).warp>0);assert.ok(at(.1).starZoom>1);
 assert.ok(at(.35).warp>0 && at(.35).warp<at(.55).warp);
 assert.ok(at(.58).warp>.99);assert.ok(at(.7).warp<at(.6).warp);
 assert.ok(at(.9).warp>0);assert.ok(at(.9).starZoom<at(.6).starZoom);
 assert.ok(at(.9).sceneScale<1);assert.equal(at(1).sceneScale,1);
 assert.ok(at(.1,C.leaveStart,C.leaveEnd).sceneScale>1);
 for(const p of [.1,.35,.55,.6,.7,.9])assert.ok(Math.abs(at(p).warp-at(p,C.leaveStart,C.leaveEnd).warp)<1e-10);
});
test('both crossings stay static and readable with reduced motion',()=>{
 for(const x of [0,.5,1,1.6,2.1,2.6,3.2]){
  const state=journeyState(x,true);assert.notEqual(state.chapter,'transition');assert.equal(state.warp,0);assert.equal(state.starZoom,1);assert.equal(state.sceneScale,1);
 }
});
test('star push begins while opening text is still crawling',()=>{
 const s=at(.1);assert.ok(s.intro<1);assert.ok(s.starZoom>1);assert.ok(s.warp>0);
});

test('incoming content overlaps streak slowdown and outgoing scale does not reset',()=>{
 assert.ok(at(.72).warp>0 && at(.72).sceneOpacity>0);
 const incoming=at(.72,C.leaveStart,C.leaveEnd);
 assert.ok(incoming.warp>0 && incoming.farewellOpacity>0);
 const enlarged=at(.24,C.leaveStart,C.leaveEnd).sceneScale;
 assert.ok(Math.abs(at(.40,C.leaveStart,C.leaveEnd).sceneScale-enlarged)<1e-10);
 for(const p of [.61,.70,.80,.90,.94]){
  assert.ok(at(p).sceneOpacity>=at(p-.01).sceneOpacity);
  assert.ok(at(p,C.leaveStart,C.leaveEnd).farewellOpacity>=at(p-.01,C.leaveStart,C.leaveEnd).farewellOpacity);
 }
});
