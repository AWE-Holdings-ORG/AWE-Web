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
  setTimeout(()=>{crownDoor.hidden=true;crownDoor.classList.remove('terminal-mode');if(crownTerminal)crownTerminal.hidden=true;resetTerminal();crownReturnFocus?.focus?.();},500);
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
const crownTerminal=document.querySelector('.crown-terminal');
const crownForm=document.querySelector('.terminal-form');
const crownName=document.querySelector('#crown-name');
const crownPck=document.querySelector('#crown-pck');
const pckLine=document.querySelector('.terminal-pck-line');
const namePrompt=document.querySelector('[data-name-prompt]');
const terminalMessage=document.querySelector('.terminal-message');
const crownEnroll=document.querySelector('.crown-enroll');
const crownWelcome=document.querySelector('.crown-welcome');
let terminalIdleTimer=null;
let terminalStage='name';

function resetTerminal(){
  clearTimeout(terminalIdleTimer);
  terminalStage='name';
  if(namePrompt)namePrompt.textContent='01001110 01100001 01101101 01100101';
  if(crownName)crownName.value='';
  if(crownPck)crownPck.value='';
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
    crownPck?.focus();
    return;
  }
  showTerminalMessage('VERIFYING CROWN...');
  const submit=crownForm.querySelector('.terminal-submit'); if(submit)submit.disabled=true;
  fetch('/api/crown/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:crownName?.value.trim(),pck:crownPck?.value||''})})
    .then(async r=>({r,data:await r.json().catch(()=>({}))}))
    .then(({r,data})=>{
      if(!r.ok||!data.ok)throw new Error(data.message||'CROWN NOT RECOGNIZED.');
      if(crownTerminal)crownTerminal.hidden=true;
      if(crownWelcome)crownWelcome.hidden=false;
      setTimeout(()=>{if(data.destination)window.location.assign(data.destination);},1800);
    })
    .catch(err=>showTerminalMessage(err.message||'CROWN NOT RECOGNIZED.',true))
    .finally(()=>{if(submit)submit.disabled=false;});
});
const crownEnrollForm=document.querySelector('.crown-enroll-form');
const enrollEmail=document.querySelector('#enroll-email');
const enrollName=document.querySelector('#enroll-name');
const enrollPck=document.querySelector('#enroll-pck');
const enrollPckConfirm=document.querySelector('#enroll-pck-confirm');

crownEnroll?.addEventListener('click',()=>{
  crownForm.hidden=true;
  crownEnroll.hidden=true;
  crownEnrollForm.hidden=false;
  showTerminalMessage('ESTABLISH YOUR CROWN IDENTITY.');
  enrollEmail?.focus();
});
crownEnrollForm?.addEventListener('submit',e=>{
  e.preventDefault();
  if(enrollPck.value!==enrollPckConfirm.value){showTerminalMessage('PCK CONFIRMATION DOES NOT MATCH.',true);return;}
  const submit=crownEnrollForm.querySelector('.terminal-submit'); submit.disabled=true;
  showTerminalMessage('ESTABLISHING CROWN IDENTITY...');
  fetch('/api/crown/enroll',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:enrollEmail.value.trim(),crownName:enrollName.value.trim(),pck:enrollPck.value})})
    .then(async r=>({r,data:await r.json().catch(()=>({}))}))
    .then(({r,data})=>{
      if(!r.ok||!data.ok)throw new Error(data.message||'ENROLLMENT COULD NOT BE COMPLETED.');
      crownEnrollForm.hidden=true;
      crownForm.hidden=false;
      crownEnroll.hidden=false;
      crownName.value=data.crownName||enrollName.value.trim();
      terminalStage='pck';
      pckLine.hidden=false;
      showTerminalMessage(`CROWN IDENTITY ESTABLISHED // ${data.awId}. PRESENT YOUR PCK TO ENTER.`);
      crownPck.focus();
    })
    .catch(err=>showTerminalMessage(err.message||'ENROLLMENT COULD NOT BE COMPLETED.',true))
    .finally(()=>{submit.disabled=false;});
});

