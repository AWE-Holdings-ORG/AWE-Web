const form=document.querySelector('[data-key-form]');
if(form){
  const input=form.querySelector('input');
  const status=form.querySelector('[data-status]');
  const submit=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const key=input.value.trim();
    if(!key)return;
    submit.disabled=true;
    status.textContent='AUTHENTICATING // SERVER';
    status.className='status';
    try{
      const res=await fetch('/api/crown/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key}),credentials:'same-origin'});
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data.ok)throw new Error('denied');
      status.textContent='ACCESS GRANTED';
      status.className='status granted';
      input.value='';
      setTimeout(()=>location.href=data.destination||'/crown/',650);
    }catch(err){
      status.textContent='ACCESS DENIED // KEY NOT RECOGNIZED';
      status.className='status denied';
      submit.disabled=false;
      input.select();
    }
  });
}
