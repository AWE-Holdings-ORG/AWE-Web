(()=>{
  // Access is enforced server-side by Cloudflare Pages Functions.
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  const judge=document.querySelector('[data-judge-engine]');
  if(!judge)return;

  const params=new URLSearchParams(location.search);
  const battleId=params.get('battle')||judge.dataset.battleId||'crowd-demo-001';
  const mode=params.get('mode')==='live'?'live':'archive';
  const voteKey='crowd-vote:'+battleId;
  const a=params.get('a')||judge.dataset.a||'Competitor A';
  const b=params.get('b')||judge.dataset.b||'Competitor B';

  judge.dataset.battleId=battleId;
  judge.dataset.a=a;
  judge.dataset.b=b;
  const title=judge.querySelector('h2');
  if(title)title.textContent=a+' vs '+b;
  const headNames=judge.querySelectorAll('.scoreboard-head strong');
  if(headNames[0])headNames[0].textContent=a;
  if(headNames[1])headNames[1].textContent=b;
  const totalLabels=judge.querySelectorAll('.total-board span');
  if(totalLabels[0])totalLabels[0].textContent=a.toUpperCase()+' TOTAL';
  if(totalLabels[1])totalLabels[1].textContent=b.toUpperCase()+' TOTAL';
  judge.querySelectorAll('[data-score]').forEach(input=>{
    const who=input.dataset.side==='a'?a:b;
    input.setAttribute('aria-label',who+' '+input.dataset.score+' score');
  });
  const modeLabel=judge.querySelector('[data-mode-label]');
  const countdown=judge.querySelector('[data-countdown]');
  const submit=judge.querySelector('[data-submit-vote]');
  const status=judge.querySelector('[data-vote-status]');
  const totalAEl=judge.querySelector('[data-total-a]');
  const totalBEl=judge.querySelector('[data-total-b]');
  const winnerEl=judge.querySelector('[data-derived-winner]');
  const scoreInputs=[...judge.querySelectorAll('[data-score]')];

  if(modeLabel)modeLabel.textContent=mode==='live'?'LIVE — 5 MINUTE WINDOW':'ARCHIVED — CONTINUOUS';

  if(mode==='live'){
    const end=Date.now()+300000;
    const tick=()=>{
      const ms=Math.max(0,end-Date.now());
      const m=String(Math.floor(ms/60000)).padStart(2,'0');
      const s=String(Math.floor((ms%60000)/1000)).padStart(2,'0');
      if(countdown)countdown.textContent='JUDGING WINDOW '+m+':'+s;
      if(ms<=0){
        submit.disabled=true;
        scoreInputs.forEach(x=>x.disabled=true);
        status.textContent='JUDGING CLOSED // WINDOW EXPIRED';
        clearInterval(timer);
      }
    };
    tick();const timer=setInterval(tick,250);
  }else if(countdown){countdown.textContent='VOTING OPEN // ONE FINAL BALLOT';}

  const readCard=()=>{
    const scores={a:{},b:{}};
    let complete=true;
    for(const input of scoreInputs){
      const side=input.dataset.side;
      const category=input.dataset.score;
      const value=Number(input.value);
      if(!Number.isInteger(value)||value<1||value>10){complete=false;continue;}
      scores[side][category]=value;
    }
    const totalA=Object.values(scores.a).reduce((sum,n)=>sum+n,0);
    const totalB=Object.values(scores.b).reduce((sum,n)=>sum+n,0);
    const winner=!complete?'':totalA>totalB?a:totalB>totalA?b:'TIE';
    totalAEl.textContent=String(totalA);
    totalBEl.textContent=String(totalB);
    winnerEl.textContent=!complete?'ENTER ALL 10 SCORES':winner==='TIE'?'TIE CARD':winner.toUpperCase()+' WINS '+Math.max(totalA,totalB)+'–'+Math.min(totalA,totalB);
    return {scores,totalA,totalB,winner,complete};
  };

  scoreInputs.forEach(input=>{
    input.addEventListener('input',()=>{
      if(input.value!==''){
        const n=Math.max(1,Math.min(10,Math.trunc(Number(input.value)||0)));
        input.value=String(n);
      }
      readCard();
    });
  });

  const existing=localStorage.getItem(voteKey);
  if(existing){
    const saved=JSON.parse(existing);
    scoreInputs.forEach(input=>{
      const side=input.dataset.side;
      const category=input.dataset.score;
      if(saved.scores?.[side]?.[category])input.value=String(saved.scores[side][category]);
      input.disabled=true;
    });
    readCard();
    submit.disabled=true;
    status.textContent='BALLOT LOCKED // '+saved.winner+' // '+saved.totalA+'–'+saved.totalB+' // SUBMITTED '+new Date(saved.timestamp).toLocaleString();
    status.classList.add('locked');
    return;
  }

  submit.addEventListener('click',()=>{
    const card=readCard();
    if(!card.complete){status.textContent='COMPLETE ALL 5 CATEGORIES FOR BOTH BATTLERS // SCORES MUST BE 1–10';return;}
    const ballot={battleId,mode,winner:card.winner,totalA:card.totalA,totalB:card.totalB,scores:card.scores,maxScore:50,timestamp:Date.now()};
    localStorage.setItem(voteKey,JSON.stringify(ballot));
    submit.disabled=true;
    scoreInputs.forEach(x=>x.disabled=true);
    status.textContent='BALLOT ACCEPTED + LOCKED // '+card.winner+' // '+card.totalA+'–'+card.totalB+' // NO CHANGES ALLOWED';
    status.classList.add('locked');
  });
})();