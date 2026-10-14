import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlightTiming} from '../src/delivery-timing.js';
test('flight distance is continuous at first turn then gains speed progressively',()=>{
 const timing=createFlightTiming(405,66);
 const h=.0001,t=timing.turnTime;
 const before=(timing.distanceAt(t)-timing.distanceAt(t-h))/h;
 const after=(timing.distanceAt(t+h)-timing.distanceAt(t))/h;
 assert.ok(Math.abs(before-after)<.001);
 const speeds=[0,.5,1,2].map(dt=>(timing.distanceAt(t+dt+h)-timing.distanceAt(t+dt))/h);
 for(let i=1;i<speeds.length;i++)assert.ok(speeds[i]>speeds[i-1]);
 assert.equal(timing.distanceAt(-1),0);
 assert.ok(Math.abs(timing.distanceAt(timing.duration)-405)<1e-8);
 assert.equal(timing.distanceAt(timing.duration+1),405);
});
