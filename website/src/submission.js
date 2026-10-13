const segmenter=new Intl.Segmenter(undefined,{granularity:'grapheme'});
export const characterCount=text=>[...segmenter.segment(text)].length;
export function validateDraft({sender,message,photo,consent=false}) {
  const characters=characterCount(message);
  let reason='';
  if(!sender.trim() || characterCount(sender)>30) reason='Enter a name of 1–30 characters.';
  else if(!message.trim() || characters>400)reason='Enter a message of 1–400 characters, including spaces.';
  else if(photo && (!['image/jpeg','image/png','image/webp'].includes(photo.type) || photo.size>5*1024*1024))reason='Choose a JPG, PNG or WebP photo no larger than 5 MB.';
  else if(photo && !consent)reason='Confirm you have permission to publish this photo.';
  return {valid:!reason,reason,characters};
}
// UI rehearsal only; real limits must be enforced atomically by the shared service.
export function previewAllowance(ledger,fingerprint,now) {
  const recent=(Array.isArray(ledger)?ledger:[]).filter(x=>x && Number.isFinite(x.at) && x.at>now-86400000 && x.at<=now && typeof x.fingerprint==='string');
  if(recent.some(x=>x.fingerprint===fingerprint))return {allowed:false,recent,reason:'This note already had a delivery preview in the last 24 hours.'};
  if(recent.length>=5)return {allowed:false,recent,reason:'You have used all 5 delivery previews for the last 24 hours.'};
  return {allowed:true,recent};
}
