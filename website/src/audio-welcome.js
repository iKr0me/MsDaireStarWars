import './audio-welcome.css';
export function createAudioWelcome({audio,onClose}){
  const root=document.querySelector('#audio-welcome'),page=document.querySelector('#journey');
  const off=document.querySelector('#audio-keep-off'),on=document.querySelector('#audio-turn-on');
  page.inert=true;document.documentElement.classList.add('scroll-locked');
  on.focus({preventScroll:true});let choosing=false;
  async function choose(enabled){
    if(choosing)return;choosing=true;off.disabled=on.disabled=true;
    if(audio.enabled!==enabled)audio.toggle();
    let music=false;if(enabled)music=await audio.toggleMusic();
    root.hidden=true;page.inert=false;document.documentElement.classList.remove('scroll-locked');
    onClose({musicFailed:enabled&&!music});
  }
  off.addEventListener('click',()=>choose(false));on.addEventListener('click',()=>choose(true));
  root.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();choose(false);}
    if(e.key==='Tab'){e.preventDefault();(document.activeElement===on?off:on).focus();}
  });
}
