import gsap from "gsap";
import "./composer.css";
import { validateDraft, previewAllowance } from "./submission.js";
import { preparePhoto } from "./photo.js";
export function createComposer({ adapter, reduced, scene, onLock, onDone }) {
  const demo=adapter.mode==='demo';
  const root=document.querySelector('#composer'), form=root.querySelector('form');
  const name=form.elements.sender, message=form.elements.message, photo=form.elements.photo;
  const send=root.querySelector('[type=submit]'), counter=root.querySelector('#draft-count');
  const error=root.querySelector('#draft-status'), preview=root.querySelector('#photo-preview');
  const orb=document.createElement('div');orb.className='plasma-orb';orb.setAttribute('aria-hidden','true');root.append(orb);
  let active=false, sending=false, url=null, previous;
  const ledgerKey='ms-daire-preview-submissions-v1', requestKey='ms-daire-live-requests-v1';
  let requestLedger=[];
  try { requestLedger=JSON.parse(localStorage.getItem(requestKey)||'[]'); } catch {}
  if(!Array.isArray(requestLedger)) requestLedger=[];
  function validate(showError = true) {
    const result=validateDraft({sender:name.value,message:message.value,photo:photo.files[0],consent:form.elements.consent.checked});
    counter.textContent=`${result.characters} / 400`;
    send.disabled=sending || !result.valid;
    message.setAttribute('aria-invalid',String(result.characters>400));
    if (!sending && showError) error.textContent=(name.value || message.value || photo.files.length) ? result.reason : '';
    return result;
  }
  function setOpen(open) {
    if(sending) return;
    active=open; root.hidden=!open; onLock(open);
    if(open) {
      gsap.set(form,{scale:1,opacity:1,borderRadius:8});gsap.set(orb,{scale:1,opacity:0});
      error.textContent=''; previous=document.activeElement; name.focus();
    } else { previous?.focus({preventScroll:true}); }
  }
  async function fingerprintFor(value) {
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));
    return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  }
  function requestIdFor(fingerprint) {
    const now=Date.now();
    requestLedger=requestLedger.filter(x=>x && typeof x.fingerprint==='string' && typeof x.id==='string' && Number.isFinite(x.at) && x.at>now-86400000 && x.at<=now);
    let entry=requestLedger.find(x=>x.fingerprint===fingerprint);
    if(!entry){ entry={fingerprint,id:crypto.randomUUID(),at:now};requestLedger.push(entry); }
    requestLedger=requestLedger.slice(-30);
    // Keep only hashes and retry IDs, never draft text or photos in local storage.
    try {localStorage.setItem(requestKey,JSON.stringify(requestLedger));} catch {}
    return entry.id;
  }
  function resetForm() {
    form.reset(); if(url)URL.revokeObjectURL(url);url=null;preview.hidden=true;preview.removeAttribute('src');
  }
  async function animateDelivery() {
    const allowMotion=!reduced.matches && !root.closest('#galaxy').classList.contains('paused');
    if (allowMotion) {
      root.classList.add('delivering');
      await new Promise(resolve=>{
        gsap.timeline({onComplete:resolve})
          .to(form,{scale:.025,opacity:0,borderRadius:200,duration:.65,ease:'power3.inOut'},0)
          .fromTo(orb,{scale:.2,opacity:0},{scale:1,opacity:1,duration:.34,ease:'sine.out'},.3)
          .to(orb,{scale:.18,opacity:0,duration:.24,ease:'power2.in'},.64);
      });
    }
    gsap.set(orb,{opacity:0,scale:1});root.hidden=true;
    if(scene?.flyDelivery && allowMotion)await scene.flyDelivery();
  }
  form.addEventListener('input',()=>validate());
  photo.addEventListener('change',()=> {
    if(url)URL.revokeObjectURL(url); url=null; preview.hidden=true;preview.removeAttribute('src');
    const f=photo.files[0];
    if(f && ['image/jpeg','image/png','image/webp'].includes(f.type) && f.size<=5*1024*1024){url=URL.createObjectURL(f);preview.src=url;preview.hidden=false;}
    validate();
  });
  root.querySelector('#composer-close').addEventListener('click',()=>setOpen(false));
  root.addEventListener('keydown',e=>{
    if(e.key==='Escape') {e.preventDefault();setOpen(false);}
    if(e.key==='Tab') {
      const controls=[...root.querySelectorAll('button,input,textarea')].filter(e=>!e.disabled && e.offsetParent);
      const first=controls[0],last=controls.at(-1);
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
    }
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault(); if(sending || !validate().valid)return;
    sending=true;form.inert=true;validate();error.textContent=demo?'':'Saving your note…';
    send.textContent=demo?'Previewing…':'Saving…';
    let pendingFingerprint=null, receipt=null;
    try {
      if(demo) {
        const fingerprint=await fingerprintFor([name.value.trim(),message.value.trim()]);
        let ledger=[];try {ledger=JSON.parse(localStorage.getItem(ledgerKey)||'[]');}catch{}
        const allowance=previewAllowance(ledger,fingerprint,Date.now());
        if(!allowance.allowed)throw new Error(allowance.reason);
        pendingFingerprint=fingerprint;
        try {localStorage.setItem(ledgerKey,JSON.stringify([...allowance.recent,{fingerprint,at:Date.now()}]));} catch {}
      } else {
        const draft={sender:name.value.trim(),message:message.value.trim(),photo:await preparePhoto(photo.files[0]),consent:form.elements.consent.checked};
        const requestId=requestIdFor(await fingerprintFor(draft));
        receipt=await adapter.submit({...draft,requestId});
      }
      // Only a durable server receipt permits the real delivery celebration.
      // A renderer failure after saving must never ask the writer to send again.
      try { await animateDelivery(); } catch (animationError) {
        if(demo)throw animationError;
        console.warn('Note saved; delivery animation unavailable.');
        root.hidden=true;
      }
      resetForm();active=false;onLock(false);
      onDone(demo?'Delivery preview complete. No note was sent or published.':receipt.duplicate?'This note is already saved. It will appear after approval.':'Your note is saved. It will appear after approval.');
      previous?.focus({preventScroll:true});
    }catch(e){
      if(pendingFingerprint){try {
        const ledger=JSON.parse(localStorage.getItem(ledgerKey)||'[]');
        localStorage.setItem(ledgerKey,JSON.stringify(ledger.filter(x=>x.fingerprint!==pendingFingerprint)));
      } catch {}}
      gsap.set(form,{scale:1,opacity:1,borderRadius:8});gsap.set(orb,{opacity:0,scale:1});root.hidden=false;error.textContent=e.message;
    } finally {
      root.classList.remove('delivering');sending=false;form.inert=false;
      send.textContent=demo?'Preview delivery':'Send note';validate(false);
    }
  });
  root.querySelector('#submission-mode').textContent=demo
    ? 'Demo: preview the delivery. Nothing will be sent or published.'
    : 'Your note will appear after approval. Up to 5 notes per 24 hours in this browser.';
  send.textContent=demo?'Preview delivery':'Send note';validate();
  return {open:()=>setOpen(true),get active(){return active;}};
}
