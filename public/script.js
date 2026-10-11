document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}


// Crown Door v3 discovery layer — AW corner key
const crownTrigger=document.querySelector('.crown-trigger');
const crownDoor=document.querySelector('#crown-door');
const crownClose=document.querySelector('.crown-close');
const crownKey=document.querySelector('.crown-key');
const crownWhisper=document.querySelector('.crown-whisper');
let crownReturnFocus=null;
let crownHoverTimer=null;
let crownPressTimer=null;
let crownPressActive=false;

const DESKTOP_DISCOVERY_MS=45000;
const MOBILE_DISCOVERY_MS=3000;
const MOBILE_QUERY='(max-width:850px)';

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
  setTimeout(()=>{crownDoor.hidden=true;crownDoor.classList.remove('terminal-mode');if(crownTerminal)crownTerminal.hidden=true;resetTerminal();crownReturnFocus?.focus?.();},500);
}
function revealCrown(){
  crownTrigger?.classList.add('crown-discovered');
  if(navigator.vibrate&&matchMedia(MOBILE_QUERY).matches)navigator.vibrate([35,45,35]);
}
function resetDesktopDiscovery(){
  clearTimeout(crownHoverTimer);
  crownHoverTimer=null;
}
function beginDesktopDiscovery(){
  if(matchMedia(MOBILE_QUERY).matches||crownTrigger?.classList.contains('crown-discovered'))return;
  clearTimeout(crownHoverTimer);
  crownHoverTimer=setTimeout(revealCrown,DESKTOP_DISCOVERY_MS);
}
function beginMobileDiscovery(e){
  if(!matchMedia(MOBILE_QUERY).matches||crownTrigger?.classList.contains('crown-discovered'))return;
  if(e.pointerType==='mouse')return;
  crownPressActive=true;
  crownTrigger?.classList.add('crown-pressing');
  clearTimeout(crownPressTimer);
  crownPressTimer=setTimeout(()=>{
    if(!crownPressActive)return;
    crownPressActive=false;
    crownTrigger?.classList.remove('crown-pressing');
    revealCrown();
  },MOBILE_DISCOVERY_MS);
}
function cancelMobileDiscovery(){
  crownPressActive=false;
  clearTimeout(crownPressTimer);
  crownPressTimer=null;
  crownTrigger?.classList.remove('crown-pressing');
}

crownTrigger?.addEventListener('pointerenter',beginDesktopDiscovery);
crownTrigger?.addEventListener('pointerleave',()=>{resetDesktopDiscovery();cancelMobileDiscovery();});
crownTrigger?.addEventListener('pointerdown',beginMobileDiscovery);
crownTrigger?.addEventListener('pointerup',e=>{
  if(matchMedia(MOBILE_QUERY).matches){
    if(crownTrigger.classList.contains('crown-discovered')){e.preventDefault();openCrownDoor();}
    else cancelMobileDiscovery();
  }
});
crownTrigger?.addEventListener('pointercancel',cancelMobileDiscovery);
crownTrigger?.addEventListener('contextmenu',e=>{if(matchMedia(MOBILE_QUERY).matches)e.preventDefault();});
crownTrigger?.addEventListener('click',e=>{
  if(matchMedia(MOBILE_QUERY).matches)return;
  if(!crownTrigger.classList.contains('crown-discovered')&&e.detail!==0)return;
  openCrownDoor();
});
crownClose?.addEventListener('click',closeCrownDoor);
crownDoor?.addEventListener('click',e=>{if(e.target===crownDoor)closeCrownDoor();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&crownDoor&&!crownDoor.hidden)closeCrownDoor();});
const crownTerminal=document.querySelector('.crown-terminal');
const crownForm=document.querySelector('.terminal-form');
const crownName=document.querySelector('#crown-name');
const crownPck=document.querySelector('#crown-pck');
const pckVisibility=document.querySelector('.pck-visibility');
const pckLine=document.querySelector('.terminal-pck-line');
const namePrompt=document.querySelector('[data-name-prompt]');
const terminalMessage=document.querySelector('.terminal-message');
const crownEnroll=document.querySelector('.crown-enroll');
const crownWelcome=document.querySelector('.crown-welcome');
let terminalIdleTimer=null;
let terminalStage='name';

function setPckVisibility(show=false){
  if(crownPck)crownPck.type=show?'text':'password';
  if(pckVisibility){
    pckVisibility.textContent=show?'HIDE':'SHOW';
    pckVisibility.setAttribute('aria-pressed',show?'true':'false');
    pckVisibility.setAttribute('aria-label',show?'Hide Personal Crown Key':'Show Personal Crown Key');
  }
}
pckVisibility?.addEventListener('click',()=>setPckVisibility(crownPck?.type==='password'));

function resetTerminal(){
  clearTimeout(terminalIdleTimer);
  terminalStage='name';
  if(namePrompt)namePrompt.textContent='01001110 01100001 01101101 01100101';
  if(crownName)crownName.value='';
  if(crownPck)crownPck.value='';
  setPckVisibility(false);
  if(pckLine)pckLine.hidden=true;
  if(terminalMessage){terminalMessage.textContent='';terminalMessage.classList.remove('error');}
  crownWelcome&&(crownWelcome.hidden=true);
}
function armNameTranslation(){
  clearTimeout(terminalIdleTimer);
  terminalIdleTimer=setTimeout(()=>{if(namePrompt&&terminalStage==='name')namePrompt.textContent='NAME....';},30000);
}
function enterTerminal(){
  crownDoor?.classList.add('terminal-mode');
  if(crownTerminal)crownTerminal.hidden=false;
  resetTerminal();
  requestAnimationFrame(()=>crownName?.focus());
  armNameTranslation();
}
function showTerminalMessage(message,isError=false){
  if(!terminalMessage)return;
  terminalMessage.textContent=message;
  terminalMessage.classList.toggle('error',isError);
}
crownKey?.addEventListener('click',enterTerminal);
crownName?.addEventListener('input',armNameTranslation);
crownForm?.addEventListener('submit',e=>{
  e.preventDefault();
  if(terminalStage==='name'){
    const name=crownName?.value.trim();
    if(!name){showTerminalMessage('IDENTITY REQUIRED.',true);return;}
    clearTimeout(terminalIdleTimer);
    terminalStage='pck';
    if(pckLine)pckLine.hidden=false;
    showTerminalMessage('IDENTITY RECEIVED. PRESENT YOUR PERSONAL CROWN KEY.');
    if(!crownPck?.value){crownPck?.focus();return;}
  }
  if(!crownPck?.value){showTerminalMessage('PRESENT YOUR PERSONAL CROWN KEY.',true);crownPck?.focus();return;}
  showTerminalMessage('VERIFYING CROWN...');
  const submit=crownForm.querySelector('.terminal-submit'); if(submit)submit.disabled=true;
  fetch('/api/crown/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:crownName?.value.trim(),pck:crownPck?.value||''})})
    .then(async r=>({r,data:await r.json().catch(()=>({}))}))
    .then(({r,data})=>{
      if(!r.ok||!data.ok)throw new Error(data.message||'CROWN NOT RECOGNIZED.');
      if(crownTerminal)crownTerminal.hidden=true;
      if(crownWelcome)crownWelcome.hidden=false;
      setTimeout(()=>window.location.assign('/crown/'),1400);
    })
    .catch(err=>showTerminalMessage(err.message||'CROWN NOT RECOGNIZED.',true))
    .finally(()=>{if(submit)submit.disabled=false;});
});
const crownEnrollForm=document.querySelector('.crown-enroll-form');
const enrollEmail=document.querySelector('#enroll-email');
const enrollName=document.querySelector('#enroll-name');
const enrollPck=document.querySelector('#enroll-pck');
const enrollPckConfirm=document.querySelector('#enroll-pck-confirm');

// All signups use the dedicated verified-invitation page.
function crownJoinUrl(){
  const ref=String(new URLSearchParams(location.search).get('ref')||'')
    .toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,60);
  return '/join/'+(ref?'?ref='+encodeURIComponent(ref):'');
}
crownEnroll?.addEventListener('click',()=>window.location.assign(crownJoinUrl()));

// Direct, intentionally shareable Crown invitations. These bypass the hidden
// AW discovery gesture only; all enrollment and login checks remain server-side.
// Example: /?crown=signup&ref=x-tha-god
// Existing members (including X) may use /?crown=login instead.
(function openCrownInvitation(){
  const intent=new URLSearchParams(window.location.search).get('crown');
  if(!['signup','login'].includes(intent))return;
  if(intent==='signup'){window.location.replace(crownJoinUrl());return;}
  if(!crownDoor||!crownTerminal)return;
  openCrownDoor();
  enterTerminal();
})();
