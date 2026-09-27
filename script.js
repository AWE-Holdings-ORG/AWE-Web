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
        <input id="crown-key" name="crown-key" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="CROWN KEY">
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
  const submit=form.querySelector('.crown-submit');
  const close=()=>{overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');input.value='';status.textContent='';status.className='crown-status';submit.disabled=false;};
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
    const key=input.value.trim();
    if(!key)return;
    submit.disabled=true;
    status.textContent='AUTHENTICATING // SERVER';
    status.className='crown-status';
    try{
      const res=await fetch('/api/crown/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key}),credentials:'same-origin'});
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data.ok)throw new Error('denied');
      status.textContent='ACCESS GRANTED';
      status.className='crown-status granted';
      input.value='';
      setTimeout(()=>{window.location.href=data.destination||'/crown/';},700);
    }catch(err){
      status.textContent='ACCESS DENIED // KEY NOT RECOGNIZED';
      status.className='crown-status denied';
      submit.disabled=false;
      input.select();
    }
  });
}
