import gsap from "gsap";
import "./composer.css";
import { validateDraft, previewAllowance } from "./submission.js";
export function createComposer({ demo, reduced, scene, onLock, onDone }) {
  const root=document.querySelector('#composer'), form=root.querySelector('form');
  const name=form.elements.sender, message=form.elements.message, photo=form.elements.photo;
  const send=root.querySelector('[type=submit]'), counter=root.querySelector('#draft-count');
  const error=root.querySelector('#draft-status'), preview=root.querySelector('#photo-preview');
  const orb=document.createElement('div');orb.className='plasma-orb';orb.setAttribute('aria-hidden','true');root.append(orb);
  let orbBob;
  let active=false, sending=false, url=null, previous;
  const ledgerKey='ms-daire-preview-submissions-v1';
  function validate(showError = true) {
    const result=validateDraft({sender:name.value,message:message.value,photo:photo.files[0],consent:form.elements.consent.checked});
    counter.textContent=`${result.characters} / 400`;
    send.disabled=sending || !demo || !result.valid;
    message.setAttribute("aria-invalid",String(result.characters>400));
    if (!sending && showError) error.textContent=(name.value || message.value || photo.files.length) ? result.reason : "";
    return result;
  }
  function setOpen(open) {
    if(sending) return;
    active=open; root.hidden=!open; onLock(open);
    if(open) { gsap.set(form,{scale:1,opacity:1,borderRadius:8});gsap.set(orb,{scale:1,opacity:0});previous=document.activeElement; name.focus(); }
    else { previous?.focus({preventScroll:true}); }
  }
  form.addEventListener('input',validate);
  photo.addEventListener('change',()=> {
    if(url)URL.revokeObjectURL(url); url=null; preview.hidden=true;
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
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault(); if(sending || !demo || !validate().valid)return;
    sending=true;validate(); error.textContent='';
    let pendingFingerprint=null;
    try {
      const text=JSON.stringify([name.value.trim(),message.value.trim()]);
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
      const fingerprint=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
      let ledger=[];try {ledger=JSON.parse(localStorage.getItem(ledgerKey)||'[]');}catch{}
      const allowance=previewAllowance(ledger,fingerprint,Date.now());
      if(!allowance.allowed)throw new Error(allowance.reason);
      pendingFingerprint=fingerprint;
      // Preview records only hashes/times, never a public note or photo.
      localStorage.setItem(ledgerKey,JSON.stringify([...allowance.recent,{fingerprint,at:Date.now()}]));
      form.inert=true;
      const allowMotion = !reduced.matches && !root.closest("#galaxy").classList.contains("paused");
      if (allowMotion) {
        await new Promise(resolve=>{
          gsap.timeline({onComplete:resolve})
            .to(form,{scale:.025,opacity:0,borderRadius:200,duration:.65,ease:'power3.inOut'},0)
            .fromTo(orb,{scale:.2,opacity:0},{scale:1,opacity:1,duration:.4,ease:'sine.out'},.3);
        });
        orbBob=gsap.to(orb,{scale:1.12,duration:.65,repeat:-1,yoyo:true,ease:'sine.inOut'});
      }
      root.classList.add("delivering");
      const box=orb.getBoundingClientRect();
      const pickup={x:box.left+box.width/2,y:box.top+box.height/2};
      const passed=()=>{orbBob?.kill();gsap.set(orb,{opacity:0});root.hidden=true;};
      if(scene?.flyDelivery && allowMotion)await scene.flyDelivery(passed,pickup);
      else passed();
      form.reset(); if(url)URL.revokeObjectURL(url);url=null;preview.hidden=true;
      active=false;onLock(false);onDone('Delivery preview complete. No note was sent or published.');
      previous?.focus({preventScroll:true});
    }catch(e){
      if(pendingFingerprint){try {
        const ledger=JSON.parse(localStorage.getItem(ledgerKey)||'[]');
        localStorage.setItem(ledgerKey,JSON.stringify(ledger.filter(x=>x.fingerprint!==pendingFingerprint)));
      } catch {}}
      orbBob?.kill();gsap.set(form,{scale:1,opacity:1,borderRadius:8});gsap.set(orb,{opacity:0});root.hidden=false;error.textContent=e.message;}
    finally {root.classList.remove("delivering");sending=false;form.inert=false;validate(false);}
  });
  root.querySelector('#submission-mode').textContent=demo
    ? 'Demo: preview the delivery. Nothing will be sent or published.'
    : 'Submissions are not connected yet. You can draft a note here.';
  send.textContent=demo?'Preview delivery':'Send note';
  validate();
  return {open:()=>setOpen(true),get active(){return active;}};
}
