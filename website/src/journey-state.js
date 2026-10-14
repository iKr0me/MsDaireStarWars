export const CHAPTERS = {enterStart:.30,enterEnd:1.45,leaveStart:2.25,leaveEnd:3.40,end:4.40};
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function journeyState(units,reduced=false){
  const enter=clamp((units-CHAPTERS.enterStart)/(CHAPTERS.enterEnd-CHAPTERS.enterStart));
  const leave=clamp((units-CHAPTERS.leaveStart)/(CHAPTERS.leaveEnd-CHAPTERS.leaveStart));
  const chapter=reduced
    ? units<CHAPTERS.enterEnd?'intro':units<(CHAPTERS.leaveStart+CHAPTERS.leaveEnd)/2?'galaxy':'farewell'
    : units<CHAPTERS.enterStart?'intro':units<CHAPTERS.enterEnd?'transition':units<CHAPTERS.leaveStart?'galaxy':units<CHAPTERS.leaveEnd?'transition':'farewell';
  const phase=enter>0&&enter<1?enter:leave>0&&leave<1?leave:0;
  // The second jump forms streaks as its zoom starts, before R2 can swell on screen.
  const buildEnd=.55;
  const warp=reduced||phase<=0||phase>=1?0:phase<buildEnd?smooth(phase/buildEnd):1-smooth((phase-buildEnd)/(1-buildEnd));
  const starZoom=reduced?1:1+.65*(phase<.25?smooth(phase/.25):phase<.62?1:1-smooth((phase-.62)/.38));
  const sceneOpacity=reduced?(chapter==='galaxy'?1:0):smooth((enter-.57)/.35)*(1-smooth((leave-.08)/.39));
  return {chapter,warp,starZoom,sceneOpacity,
    sceneScale:reduced?1:enter>=.57&&enter<1?.82+.18*smooth((enter-.57)/.43):leave>0&&leave<.48?1+.12*smooth(leave/.22):1,
    sceneVisible:sceneOpacity>0,
    farewellOpacity:reduced?(chapter==='farewell'?1:0):smooth((leave-.54)/.39),
    intro:clamp(units/.94),farewell:clamp((units-(CHAPTERS.leaveStart+.50*(CHAPTERS.leaveEnd-CHAPTERS.leaveStart)))/(CHAPTERS.end-(CHAPTERS.leaveStart+.50*(CHAPTERS.leaveEnd-CHAPTERS.leaveStart))))};
}
