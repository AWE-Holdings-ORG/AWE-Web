document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}


// Crown Door v1
const crownTrigger=document.querySelector('.crown-trigger');
const crownDoor=document.querySelector('#crown-door');
const crownClose=document.querySelector('.crown-close');
const crownKey=document.querySelector('.crown-key');
const crownWhisper=document.querySelector('.crown-whisper');
let crownReturnFocus=null;

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
crownTrigger?.addEventListener('click',openCrownDoor);
crownClose?.addEventListener('click',closeCrownDoor);
crownDoor?.addEventListener('click',e=>{if(e.target===crownDoor)closeCrownDoor();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&crownDoor&&!crownDoor.hidden)closeCrownDoor();});
crownKey?.addEventListener('click',()=>{
  crownWhisper?.classList.add('revealed');
  if(crownWhisper)crownWhisper.textContent='CROWN KEY 01 RECOGNIZED · THE NETWORK AWAITS';
  crownKey.setAttribute('aria-pressed','true');
});
