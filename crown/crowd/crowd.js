(()=>{
  const required=document.body.hasAttribute('data-crown-required');
  if(required&&sessionStorage.getItem('awe-crown-access')!=='crowd-v1'){location.replace('/crown/');return;}

  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  const judge=document.querySelector('[data-judge-engine]');
  if(!judge)return;

  const battleId=judge.dataset.battleId||'crowd-demo-001';
  const mode=new URLSearchParams(location.search).get('mode')==='live'?'live':'archive';
  const voteKey='crowd-vote:'+battleId;
  const a=judge.dataset.a||'Competitor A';
  const b=judge.dataset.b||'Competitor B';
  const modeLabel=judge.querySelector('[data-mode-label]');
  const countdown=judge.querySelector('[data-countdown]');
  const submit=judge.querySelector('[data-submit-vote]');
  const status=judge.querySelector('[data-vote-status]');
  let winner='';
  let categoryVotes={};

  if(modeLabel)modeLabel.textContent=mode==='live'?'LIVE — 5 MINUTE WINDOW':'ARCHIVED — CONTINUOUS';
  if(mode==='live'){
    const end=Date.now()+300000;
    const tick=()=>{
      const ms=Math.max(0,end-Date.now());
      const m=String(Math.floor(ms/60000)).padStart(2,'0');
      const s=String(Math.floor((ms%60000)/1000)).padStart(2,'0');
      if(countdown)countdown.textContent='JUDGING WINDOW '+m+':'+s;
      if(ms<=0){submit.disabled=true;status.textContent='JUDGING CLOSED // WINDOW EXPIRED';clearInterval(timer);}
    };
    tick();const timer=setInterval(tick,250);
  }else if(countdown){countdown.textContent='VOTING OPEN // ONE FINAL BALLOT';}

  const existing=localStorage.getItem(voteKey);
  if(existing){
    const saved=JSON.parse(existing);
    submit.disabled=true;
    judge.querySelectorAll('button[data-pick],button[data-category-pick]').forEach(btn=>btn.disabled=true);
    status.textContent='BALLOT LOCKED // '+saved.winner+' // SUBMITTED '+new Date(saved.timestamp).toLocaleString();
    status.classList.add('locked');
    return;
  }

  judge.querySelectorAll('[data-category-pick]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const category=btn.dataset.categoryPick;
      const side=btn.dataset.side;
      categoryVotes[category]=side;
      judge.querySelectorAll('[data-category-pick="'+category+'"]').forEach(x=>x.classList.toggle('selected',x===btn));
    });
  });

  judge.querySelectorAll('[data-pick]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      winner=btn.dataset.pick==='a'?a:b;
      judge.querySelectorAll('[data-pick]').forEach(x=>x.classList.toggle('selected',x===btn));
    });
  });

  submit.addEventListener('click',()=>{
    if(!winner){status.textContent='SELECT A FINAL WINNER BEFORE SUBMITTING.';return;}
    const ballot={battleId,mode,winner,categories:categoryVotes,timestamp:Date.now()};
    localStorage.setItem(voteKey,JSON.stringify(ballot));
    submit.disabled=true;
    judge.querySelectorAll('button[data-pick],button[data-category-pick]').forEach(btn=>btn.disabled=true);
    status.textContent='BALLOT ACCEPTED + LOCKED // '+winner+' // NO CHANGES ALLOWED';
    status.classList.add('locked');
  });
})();