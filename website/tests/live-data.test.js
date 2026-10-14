import test from 'node:test';
import assert from 'node:assert/strict';
import {createLiveAdapter} from '../src/live-data.js';
const note = {id:'3dc7cb6d-5772-4016-b918-edf386828c89',sender:'Sam',message:'Get well soon!',photoUrl:null};

test('approved notes paginate and only the same-origin approved photo route is retained', async () => {
  const urls=[];
  const adapter=createLiveAdapter(async (url,options)=>{
    urls.push(url);assert.equal(options.credentials,'same-origin');assert.equal(options.cache,'no-store');
    return Response.json(urls.length===1
      ? {notes:[{...note,photoUrl:'https://unsafe.example/photo',moderation_flags:['private']}],nextCursor:'next/page'}
      : {notes:[{...note,id:'second',photoUrl:'/api/photo?id=second'}],nextCursor:null});
  });
  const result=await adapter.list();
  assert.equal(result.length,2);assert.equal(result[0].photoUrl,null);
  assert.equal(result[1].photoUrl,'/api/photo?id=second');
  assert.equal('moderation_flags' in result[0],false);
  assert.equal(urls[1],'/api/notes?cursor=next%2Fpage');
});
test('a failed refresh never substitutes demo notes or partial pages',async()=>{
  let calls=0;
  const adapter=createLiveAdapter(async()=>++calls===1
    ? Response.json({notes:[note],nextCursor:'page2'})
    : Response.json({error:'Service offline',code:'SERVICE_UNAVAILABLE'},{status:503}));
  await assert.rejects(adapter.list(),/Service offline/);
});
test('session bootstrap retries only once and preserves the exact send ID and body',async()=>{
  const bodies=[];
  const adapter=createLiveAdapter(async(url,options)=>{
    assert.equal(url,'/api/notes');bodies.push(options.body);
    return bodies.length===1
      ? Response.json({error:'Retry',code:'SESSION_REQUIRED'},{status:409})
      : Response.json({id:note.id,status:'pending',duplicate:false},{status:201});
  });
  const receipt=await adapter.submit({requestId:'stable-id',sender:'Sam',message:'Hello'});
  assert.equal(receipt.status,'pending');assert.deepEqual(bodies,[bodies[0],bodies[0]]);
});
test('disabled cookies do not cause an endless retry loop',async()=>{
  let calls=0;
  const adapter=createLiveAdapter(async()=>{calls++;return Response.json({error:'Enable cookies',code:'SESSION_REQUIRED'},{status:409});});
  await assert.rejects(adapter.submit({}),/Enable cookies/);assert.equal(calls,2);
});
test('an ambiguous network failure is not silently retried or reported as a save',async()=>{
  let calls=0;
  const adapter=createLiveAdapter(async()=>{calls++;throw new Error('network');});
  await assert.rejects(adapter.submit({requestId:'stable-id'}),/connection/);assert.equal(calls,1);
});
test('collection reread handles revoked notes and malformed receipts remain errors',async()=>{
  const adapter=createLiveAdapter(async(url,options)=>Response.json(options.method==='POST'?{ok:true}:{notes:[],nextCursor:null}));
  assert.equal(await adapter.get(note.id),null);
  await assert.rejects(adapter.submit({}),/confirmation/);
});
