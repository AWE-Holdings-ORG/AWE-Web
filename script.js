document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}

const crownDoor=document.querySelector('[data-crown-door]');
if(crownDoor){
  const overlay=document.createElement('div');
  overlay.className='crown-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML=`
    <div class="crown-terminal" role="dialog" aria-modal="true" aria-labelledby="crown-title">
      <p class="terminal-kicker">AW Enterprises // Internal System</p>
      <h2 id="crown-title">Crown Access</h2>
      <p>Signal detected. Authorized keys only.</p>
      <form data-crown-form>
        <label for="crown-key">Enter Crown Key</label>
        <input id="crown-key" name="crown-key" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="CROWN KEY">
        <div class="crown-terminal-actions">
          <button class="crown-submit" type="submit">Authenticate</button>
          <button class="crown-close" type="button" data-crown-close>Return</button>
        </div>
        <p class="crown-status" data-crown-status aria-live="polite"></p>
      </form>
    </div>`;
  document.body.appendChild(overlay);
  const form=overlay.querySelector('[data-crown-form]');
  const input=overlay.querySelector('#crown-key');
  const status=overlay.querySelector('[data-crown-status]');
  const close=()=>{overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');input.value='';status.textContent='';status.className='crown-status';};
  crownDoor.addEventListener('click',()=>{
    crownDoor.classList.add('signal');
    setTimeout(()=>crownDoor.classList.remove('signal'),850);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    setTimeout(()=>input.focus(),160);
  });
  overlay.querySelector('[data-crown-close]').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))close();});
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const bytes=new TextEncoder().encode(input.value);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hash=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
    if(hash==='6403968b08c4301e5d18f12d391287961d57b49d4c4304657cd9501f003b8b5c'){
      status.textContent='ACCESS GRANTED // THE CROWD HOUSE';
      status.className='crown-status granted';
      sessionStorage.setItem('awe-crown-access','crowd-v1');
      setTimeout(()=>{window.location.href='/crown/crowd/';},900);
    }else{
      status.textContent='ACCESS DENIED // KEY NOT RECOGNIZED';
      status.className='crown-status denied';
      input.select();
    }
  });
}
