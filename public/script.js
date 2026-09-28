document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}


// Crown Door v2 discovery layer
const crownTrigger=document.querySelector('.crown-trigger');
const crownDoor=document.querySelector('#crown-door');
const crownClose=document.querySelector('.crown-close');
const crownKey=document.querySelector('.crown-key');
const crownWhisper=document.querySelector('.crown-whisper');
const mobileSignal=document.querySelector('.mobile-crown-signal');
const hero=document.querySelector('.hero');
let crownReturnFocus=null;
let crownHoverTimer=null;
let mobileSequence=[];
let mobileSequenceStartedAt=0;

const DESKTOP_DISCOVERY_MS=60000;
const MOBILE_SEQUENCE_WINDOW_MS=12000;
const MOBILE_CORNER_RATIO=.18;

function openCrownDoor(){
  if(!crownDoor)return;
  crownReturnFocus=document.activeElement;
  crownDoor.hidden=false;
  document.body.classList.add('crown-open');
  requestAnimationFrame(()=>requestAnimationFrame(()=>crownDoor.classList.add('awake')));
  setTimeout(()=>crownClose?.focus(),850);
}
function closeCrownDoor(){
  if(!crownDoor)return;
  crownDoor.classList.remove('awake');
  document.body.classList.remove('crown-open');
  setTimeout(()=>{crownDoor.hidden=true;crownReturnFocus?.focus?.();},500);
}
function revealDesktopCrown(){
  crownTrigger?.classList.add('crown-discovered');
}
function resetDesktopDiscovery(){
  clearTimeout(crownHoverTimer);
  crownHoverTimer=null;
  crownTrigger?.classList.remove('crown-discovered');
}
function beginDesktopDiscovery(){
  if(matchMedia('(max-width:850px)').matches)return;
  clearTimeout(crownHoverTimer);
  crownHoverTimer=setTimeout(revealDesktopCrown,DESKTOP_DISCOVERY_MS);
}
function mobileCornerForPoint(x,y){
  if(!hero)return null;
  const r=hero.getBoundingClientRect();
  if(x<r.left||x>r.right||y<r.top||y>r.bottom)return null;
  const rx=(x-r.left)/r.width, ry=(y-r.top)/r.height;
  const edge=MOBILE_CORNER_RATIO;
  if(rx>=1-edge&&ry<=edge)return 'TR';
  if(rx>=1-edge&&ry>=1-edge)return 'BR';
  if(rx<=edge&&ry>=1-edge)return 'BL';
  if(rx<=edge&&ry<=edge)return 'TL';
  return null;
}
function registerMobileCorner(corner){
  const expected=['TR','BR','BL','TL'];
  const now=Date.now();
  if(!mobileSequence.length||now-mobileSequenceStartedAt>MOBILE_SEQUENCE_WINDOW_MS){
    mobileSequence=[];
    mobileSequenceStartedAt=now;
  }
  const next=expected[mobileSequence.length];
  if(corner===next){
    mobileSequence.push(corner);
  }else{
    mobileSequence=corner==='TR'?['TR']:[];
    mobileSequenceStartedAt=now;
  }
  if(mobileSequence.length===expected.length){
    mobileSequence=[];
    mobileSignal?.classList.add('awake');
    if(navigator.vibrate)navigator.vibrate([35,45,35]);
    setTimeout(()=>openCrownDoor(),650);
    setTimeout(()=>mobileSignal?.classList.remove('awake'),1400);
  }
}

crownTrigger?.addEventListener('pointerenter',beginDesktopDiscovery);
crownTrigger?.addEventListener('pointerleave',resetDesktopDiscovery);
crownTrigger?.addEventListener('click',e=>{
  if(!crownTrigger.classList.contains('crown-discovered')&&e.detail!==0)return;
  openCrownDoor();
});
hero?.addEventListener('pointerup',e=>{
  if(!matchMedia('(max-width:850px)').matches)return;
  const corner=mobileCornerForPoint(e.clientX,e.clientY);
  if(corner)registerMobileCorner(corner);
});
crownClose?.addEventListener('click',closeCrownDoor);
crownDoor?.addEventListener('click',e=>{if(e.target===crownDoor)closeCrownDoor();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&crownDoor&&!crownDoor.hidden)closeCrownDoor();});
crownKey?.addEventListener('click',()=>{
  crownWhisper?.classList.add('revealed');
  if(crownWhisper)crownWhisper.textContent='IDENTITY GATE READY';
  crownKey.setAttribute('aria-pressed','true');
});
