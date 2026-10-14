export const CHAPTERS = {enterStart:.30,enterEnd:1.20,leaveStart:1.95,leaveEnd:2.85,end:3.65};
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function journeyState(units,reduced=false){
  const enter=clamp((units-CHAPTERS.enterStart)/(CHAPTERS.enterEnd-CHAPTERS.enterStart));
  const leave=clamp((units-CHAPTERS.leaveStart)/(CHAPTERS.leaveEnd-CHAPTERS.leaveStart));
  const chapter=reduced
    ? units<CHAPTERS.enterEnd?'intro':units<(CHAPTERS.leaveStart+CHAPTERS.leaveEnd)/2?'galaxy':'farewell'
    : units<CHAPTERS.enterStart?'intro':units<CHAPTERS.enterEnd?'transition':units<CHAPTERS.leaveStart?'galaxy':units<CHAPTERS.leaveEnd?'transition':'farewell';
  const phase=enter>0&&enter<1?enter:leave>0&&leave<1?leave:0;
  const warp=reduced||phase<=.2||phase>=.8?0:phase<.6?smooth((phase-.2)/.4):1-smooth((phase-.6)/.2);
  const starZoom=reduced?1:1+.65*(phase<.2?smooth(phase/.2):phase<.8?1:1-smooth((phase-.8)/.2));
  return {chapter,warp,starZoom,
    sceneScale:reduced?1:enter>=.8&&enter<1?.82+.18*smooth((enter-.8)/.2):1,
    sceneVisible:reduced?chapter==='galaxy':units>=CHAPTERS.enterStart+.8*(CHAPTERS.enterEnd-CHAPTERS.enterStart)&&units<CHAPTERS.leaveStart+.4*(CHAPTERS.leaveEnd-CHAPTERS.leaveStart),
    intro:clamp(units/.72),farewell:clamp((units-CHAPTERS.leaveEnd)/(CHAPTERS.end-CHAPTERS.leaveEnd))};
}
