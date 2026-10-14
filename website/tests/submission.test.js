import test from 'node:test';
import assert from 'node:assert/strict';
import {characterCount,validateDraft,previewAllowance} from '../src/submission.js';
test('limit includes spaces, counts graphemes and rejects whitespace-only text',()=>{
  assert.equal(characterCount('a 👨‍👩‍👧‍👦'),3);
  assert.equal(validateDraft({sender:'Sam',message:'x'.repeat(400)}).valid,true);
  assert.equal(validateDraft({sender:'Sam',message:'x'.repeat(400)+' '}).valid,false);
  assert.equal(validateDraft({sender:'Sam',message:'   '}).valid,false);
});
test('optional photos require allowed type, size and public permission',()=>{
  const draft={sender:'Sam',message:'Get well soon',photo:{type:'image/png',size:1024}};
  assert.equal(validateDraft(draft).valid,false);
  assert.equal(validateDraft({...draft,consent:true}).valid,true);
  assert.equal(validateDraft({...draft,consent:true,photo:{type:'image/svg+xml',size:1}}).valid,false);
  assert.equal(validateDraft({...draft,consent:true,photo:{type:'image/png',size:6*1024*1024}}).valid,false);
});
test('preview has no count limit while duplicate protection expires after a day',()=>{
  const now=100000000;
  const entries=Array.from({length:50},(_,i)=>({fingerprint:String(i),at:now-i*1000}));
  assert.equal(previewAllowance(entries,'new',now).allowed,true);
  assert.match(previewAllowance(entries,'0',now).reason,/already/);
  assert.equal(previewAllowance(entries,'new',now+86400001).allowed,true);
});
