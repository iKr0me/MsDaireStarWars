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
  // The stages overlap: streaks emerge during push-in; arrival starts during slowdown.
  const warp=reduced||phase<=.04||phase>=.98?0:phase<.58?smooth((phase-.04)/.54):1-smooth((phase-.58)/.40);
  const starZoom=reduced?1:1+.65*(phase<.24?smooth(phase/.24):phase<.64?1:1-smooth((phase-.64)/.36));
  const sceneOpacity=reduced?(chapter==='galaxy'?1:0):smooth((enter-.60)/.34)*(1-smooth((leave-.12)/.43));
  return {chapter,warp,starZoom,sceneOpacity,
    sceneScale:reduced?1:enter>=.6&&enter<1?.82+.18*smooth((enter-.6)/.4):leave>0&&leave<.55?1+.35*smooth(leave/.24):1,
    sceneVisible:sceneOpacity>0,
    farewellOpacity:reduced?(chapter==='farewell'?1:0):smooth((leave-.60)/.34),
    intro:clamp(units/.72),farewell:clamp((units-(CHAPTERS.leaveStart+.6*(CHAPTERS.leaveEnd-CHAPTERS.leaveStart)))/(CHAPTERS.end-(CHAPTERS.leaveStart+.6*(CHAPTERS.leaveEnd-CHAPTERS.leaveStart))))};
}
