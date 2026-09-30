const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const enc=new TextEncoder();
const PBKDF2_ITERATIONS=100000; // Cloudflare Workers production ceiling as of 2026-09.
const b64url=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
async function pckDigest(pck,salt,pepper){
  if(!pepper)throw new Error("PCK_PEPPER_MISSING");
  const base=await crypto.subtle.importKey("raw",enc.encode(String(pck)+":"+String(pepper)),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:PBKDF2_ITERATIONS},base,256);
  return b64url(bits);
}
function randomToken(bytes=32){const a=new Uint8Array(bytes);crypto.getRandomValues(a);return b64url(a);}
async function tokenDigest(token,pepper){
  if(!pepper)throw new Error("SESSION_PEPPER_MISSING");
  return b64url(await crypto.subtle.digest("SHA-256",enc.encode(token+":"+pepper)));
}
function safeEqual(a,b){
  const aa=enc.encode(String(a)),bb=enc.encode(String(b));
  if(aa.length!==bb.length)return false;
  if(typeof crypto.subtle.timingSafeEqual==="function")return crypto.subtle.timingSafeEqual(aa,bb);
  let diff=0;for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];return diff===0;
}
function requireRuntime(env){
  if(!env.CROWN_DB)throw new Error("CROWN_DB_MISSING");
  if(typeof env.PCK_PEPPER!=="string"||!env.PCK_PEPPER)throw new Error("PCK_PEPPER_MISSING");
  if(typeof env.SESSION_PEPPER!=="string"||!env.SESSION_PEPPER)throw new Error("SESSION_PEPPER_MISSING");
}
function cookieValue(request,name){const raw=request.headers.get("cookie")||"";for(const part of raw.split(";")){const [k,...v]=part.trim().split("=");if(k===name)return v.join("=");}return "";}
async function sessionMember(request,env){
  requireRuntime(env);
  const raw=cookieValue(request,"awe_crown_session"); if(!raw)return null;
  const digest=await tokenDigest(raw,env.SESSION_PEPPER);
  return env.CROWN_DB.prepare(`SELECT m.id,m.aw_id,m.crown_name,m.status FROM sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires_at>datetime('now') AND m.status='active' LIMIT 1`).bind(digest).first();
}
async function crownAsset(request,env){
  const member=await sessionMember(request,env);
  if(!member)return Response.redirect(new URL("/",request.url).toString(),302);
  const url=new URL(request.url);
  const access=(await env.CROWN_DB.prepare(`SELECT house_slug,destination FROM member_access WHERE member_id=? AND active=1 ORDER BY priority ASC`).bind(member.id).all()).results||[];
  if(!access.length)return Response.redirect(new URL("/",request.url).toString(),302);
  if(url.pathname.startsWith("/crown/crowd/")&&!access.some(a=>a.house_slug==="the-crowd"))return Response.redirect(new URL(access[0].destination||"/crown/",request.url).toString(),302);
  return env.ASSETS.fetch(request);
}
function normalizeName(v){return String(v||"").trim().toLowerCase();}
async function readJson(request){try{return await request.json()}catch{return {}}}
async function verifyTurnstile(token,request,env){
  if(!env.TURNSTILE_SECRET)return true; // PREVIEW ONLY. Production must fail closed.
  if(!token)return false;
  const form=new FormData(); form.set("secret",env.TURNSTILE_SECRET); form.set("response",token);
  const ip=request.headers.get("CF-Connecting-IP"); if(ip)form.set("remoteip",ip);
  const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:form});
  return !!(await r.json()).success;
}
function normalizeHouseKey(v){return String(v||"").trim().replace(/^#+/,"").toLowerCase().replace(/[^a-z0-9_-]/g,"");}
async function resolveHouseKey(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const body=await readJson(request), key=normalizeHouseKey(body.key);
  if(!key)return json({ok:false,message:"HOUSE KEY REQUIRED."},400);
  const route=await env.CROWN_DB.prepare(`SELECT k.key_slug,k.house_slug,COALESCE(k.destination,h.destination) AS destination,h.name FROM house_keys k JOIN houses h ON h.slug=k.house_slug WHERE lower(k.key_slug)=? AND k.active=1 LIMIT 1`).bind(key).first();
  if(!route)return json({ok:false,message:"HOUSE KEY NOT RECOGNIZED."},404);
  const access=await env.CROWN_DB.prepare(`SELECT destination FROM member_access WHERE member_id=? AND house_slug=? AND active=1 LIMIT 1`).bind(member.id,route.house_slug).first();
  if(!access)return json({ok:false,message:"HOUSE DISCOVERED // ACCESS NOT YET GRANTED.",house:route.house_slug,houseName:route.name},403);
  const destination=route.destination||access.destination;
  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare(`INSERT INTO member_discoveries(member_id,house_slug,discovery_key,discovered_at,last_visited_at) VALUES(?,?,?,datetime('now'),datetime('now')) ON CONFLICT(member_id,house_slug) DO UPDATE SET discovery_key=COALESCE(member_discoveries.discovery_key,excluded.discovery_key),last_visited_at=datetime('now')`).bind(member.id,route.house_slug,key),
    env.CROWN_DB.prepare(`INSERT INTO access_events(member_id,event_type,house_slug,created_at) VALUES(?,'house_key_resolved',?,datetime('now'))`).bind(member.id,route.house_slug)
  ]);
  return json({ok:true,house:route.house_slug,houseName:route.name,destination,discovered:true});
}
async function atriumState(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const discoveries=(await env.CROWN_DB.prepare(`SELECT d.house_slug,h.name,COALESCE(a.destination,h.destination) AS destination,d.discovered_at,d.last_visited_at,CASE WHEN a.active=1 THEN 1 ELSE 0 END AS authorized FROM member_discoveries d JOIN houses h ON h.slug=d.house_slug LEFT JOIN member_access a ON a.member_id=d.member_id AND a.house_slug=d.house_slug WHERE d.member_id=? ORDER BY d.discovered_at ASC`).bind(member.id).all()).results||[];
  return json({ok:true,awId:member.aw_id,crownName:member.crown_name,discoveries});
}
async function visitHouse(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const body=await readJson(request),house=String(body.house||"").trim();
  if(!house)return json({ok:false,message:"HOUSE REQUIRED."},400);
  const access=await env.CROWN_DB.prepare(`SELECT 1 AS ok FROM member_access WHERE member_id=? AND house_slug=? AND active=1 LIMIT 1`).bind(member.id,house).first();
  if(!access)return json({ok:false,message:"HOUSE ACCESS NOT GRANTED."},403);
  await env.CROWN_DB.prepare(`UPDATE member_discoveries SET last_visited_at=datetime('now') WHERE member_id=? AND house_slug=?`).bind(member.id,house).run();
  return json({ok:true});
}
function cleanPath(v){const p=String(v||"/").trim();return p.startsWith("/")?p.slice(0,240):"/";}
function cleanText(v,max=1200){return String(v||"").replace(/[\\u0000-\\u001F\\u007F]/g," ").replace(/\\s+/g," ").trim().slice(0,max);}
async function visitorDigest(request,env){
  const ip=request.headers.get("CF-Connecting-IP")||"unknown";
  const ua=request.headers.get("user-agent")||"unknown";
  const day=new Date().toISOString().slice(0,10);
  const pepper=env.ANALYTICS_PEPPER||env.SESSION_PEPPER;
  if(!pepper)throw new Error("SESSION_PEPPER_MISSING");
  return b64url(await crypto.subtle.digest("SHA-256",enc.encode(ip+"|"+ua+"|"+day+"|"+pepper)));
}
function referrerHost(request){
  try{const r=request.headers.get("referer");return r?new URL(r).hostname.slice(0,160):null}catch{return null}
}
async function analyticsSummary(env){
  requireRuntime(env);
  const visitors=await env.CROWN_DB.prepare("SELECT COUNT(*) AS n FROM site_visitors").first();
  const visits=await env.CROWN_DB.prepare("SELECT COUNT(*) AS n FROM site_visits").first();
  return {uniqueVisitors:Number(visitors?.n||0),visits:Number(visits?.n||0)};
}
async function trackSiteVisit(request,env){
  requireRuntime(env);
  const body=await readJson(request),path=cleanPath(body.path);
  const visitorKey=await visitorDigest(request,env),member=await sessionMember(request,env);
  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare("INSERT INTO site_visitors(visitor_key,first_seen_at,last_seen_at,visit_count) VALUES(?,datetime('now'),datetime('now'),1) ON CONFLICT(visitor_key) DO UPDATE SET last_seen_at=datetime('now'),visit_count=site_visitors.visit_count+1").bind(visitorKey),
    env.CROWN_DB.prepare("INSERT INTO site_visits(visitor_key,path,referrer_host,crown_member_id,visited_at) VALUES(?,?,?,?,datetime('now'))").bind(visitorKey,path,referrerHost(request),member?.id||null)
  ]);
  return json({ok:true,...await analyticsSummary(env)});
}
async function siteStats(request,env){
  return json({ok:true,...await analyticsSummary(env)});
}
async function playerCatalog(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const url=new URL(request.url),slug=String(url.searchParams.get("artist")||"x-tha-god").trim().toLowerCase();
  const artist=await env.CROWN_DB.prepare("SELECT id,artist_slug,display_name,artist_number,status,primary_house_slug,label_house_slug,public_bio FROM artists WHERE artist_slug=? AND status='active' LIMIT 1").bind(slug).first();
  if(!artist)return json({ok:false,message:"ARTIST SIGNAL NOT FOUND."},404);
  const media=(await env.CROWN_DB.prepare("SELECT id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,description,source_name,source_url,thumbnail_url,rights_status,duration_seconds,published_at FROM artist_media WHERE artist_id=? AND active=1 AND visibility IN ('public','crown') ORDER BY sort_order,event_date,id").bind(artist.id).all()).results||[];
  for(const item of media){
    const c=await env.CROWN_DB.prepare("SELECT COUNT(*) AS n FROM media_views WHERE media_id=?").bind(item.id).first();
    const m=await env.CROWN_DB.prepare("SELECT COUNT(*) AS n FROM media_comments WHERE media_id=? AND status='visible'").bind(item.id).first();
    item.view_count=Number(c?.n||0); item.comment_count=Number(m?.n||0);
  }
  return json({ok:true,artist,media});
}
async function recordMediaView(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const body=await readJson(request),mediaId=Number(body.mediaId),sessionKey=cleanText(body.sessionKey,100);
  if(!Number.isInteger(mediaId)||mediaId<1||sessionKey.length<12)return json({ok:false,message:"INVALID VIEW SIGNAL."},400);
  const exists=await env.CROWN_DB.prepare("SELECT 1 AS ok FROM artist_media WHERE id=? AND active=1 LIMIT 1").bind(mediaId).first();
  if(!exists)return json({ok:false,message:"MEDIA NOT FOUND."},404);
  const visitorKey=await visitorDigest(request,env);
  await env.CROWN_DB.prepare("INSERT OR IGNORE INTO media_views(media_id,visitor_key,crown_member_id,session_key,qualified_at) VALUES(?,?,?,?,datetime('now'))").bind(mediaId,visitorKey,member.id,sessionKey).run();
  const count=await env.CROWN_DB.prepare("SELECT COUNT(*) AS n FROM media_views WHERE media_id=?").bind(mediaId).first();
  return json({ok:true,views:Number(count?.n||0)});
}
async function listMediaComments(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const mediaId=Number(new URL(request.url).searchParams.get("mediaId"));
  if(!Number.isInteger(mediaId)||mediaId<1)return json({ok:false,message:"MEDIA REQUIRED."},400);
  const comments=(await env.CROWN_DB.prepare("SELECT c.id,c.body,c.created_at,m.crown_name,m.aw_id FROM media_comments c JOIN members m ON m.id=c.member_id WHERE c.media_id=? AND c.status='visible' ORDER BY c.created_at DESC LIMIT 100").bind(mediaId).all()).results||[];
  return json({ok:true,comments});
}
async function addMediaComment(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const body=await readJson(request),mediaId=Number(body.mediaId),comment=cleanText(body.body,1000);
  if(!Number.isInteger(mediaId)||mediaId<1||comment.length<1)return json({ok:false,message:"COMMENT REQUIRED."},400);
  const exists=await env.CROWN_DB.prepare("SELECT 1 AS ok FROM artist_media WHERE id=? AND active=1 LIMIT 1").bind(mediaId).first();
  if(!exists)return json({ok:false,message:"MEDIA NOT FOUND."},404);
  await env.CROWN_DB.prepare("INSERT INTO media_comments(media_id,member_id,body,status,created_at,updated_at) VALUES(?,? ,?,'visible',datetime('now'),datetime('now'))").bind(mediaId,member.id,comment).run();
  return json({ok:true,message:"COMMENT POSTED."},201);
}
async function competitionList(request,env){
  const member=await sessionMember(request,env); if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const rows=(await env.CROWN_DB.prepare("SELECT id,slug,title,competition_type,status,judging_opens_at,judging_closes_at,official_result_status FROM competitions WHERE status IN ('scheduled','live','closed') ORDER BY COALESCE(judging_opens_at,created_at) DESC LIMIT 50").all()).results||[];
  return json({ok:true,competitions:rows});
}
async function competitionDetail(request,env){
  const member=await sessionMember(request,env); if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const slug=cleanText(new URL(request.url).searchParams.get("slug"),100).toLowerCase();
  const c=await env.CROWN_DB.prepare("SELECT * FROM competitions WHERE slug=? LIMIT 1").bind(slug).first(); if(!c)return json({ok:false,message:"COMPETITION NOT FOUND."},404);
  const participants=(await env.CROWN_DB.prepare("SELECT a.id,a.artist_slug,a.display_name,cp.side,cp.display_order FROM competition_participants cp JOIN artists a ON a.id=cp.artist_id WHERE cp.competition_id=? ORDER BY cp.side,cp.display_order").bind(c.id).all()).results||[];
  const criteria=(await env.CROWN_DB.prepare("SELECT id,criterion_key,label,max_score,weight,display_order FROM judging_criteria WHERE competition_id=? AND active=1 ORDER BY display_order,id").bind(c.id).all()).results||[];
  const mine=await env.CROWN_DB.prepare("SELECT id,status,submitted_at FROM judging_ballots WHERE competition_id=? AND member_id=? LIMIT 1").bind(c.id,member.id).first();
  return json({ok:true,competition:c,participants,criteria,myBallot:mine||null});
}
async function submitBallot(request,env){
  const member=await sessionMember(request,env); if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const body=await readJson(request),competitionId=Number(body.competitionId),scores=Array.isArray(body.scores)?body.scores:[];
  if(!Number.isInteger(competitionId)||!scores.length)return json({ok:false,message:"COMPLETE SCORECARD REQUIRED."},400);
  const c=await env.CROWN_DB.prepare("SELECT id,status,judging_opens_at,judging_closes_at FROM competitions WHERE id=? LIMIT 1").bind(competitionId).first();
  if(!c||!['scheduled','live'].includes(c.status))return json({ok:false,message:"JUDGING IS CLOSED."},409);
  const now=Date.now(); if(c.judging_opens_at&&now<Date.parse(c.judging_opens_at))return json({ok:false,message:"JUDGING HAS NOT OPENED."},409);
  if(c.judging_closes_at&&now>Date.parse(c.judging_closes_at))return json({ok:false,message:"JUDGING IS CLOSED."},409);
  const existing=await env.CROWN_DB.prepare("SELECT id,status FROM judging_ballots WHERE competition_id=? AND member_id=? LIMIT 1").bind(competitionId,member.id).first();
  if(existing?.status==="submitted")return json({ok:false,message:"BALLOT ALREADY LOCKED."},409);
  let ballotId=existing?.id;
  if(!ballotId){const r=await env.CROWN_DB.prepare("INSERT INTO judging_ballots(competition_id,member_id,status) VALUES(?,?,'draft')").bind(competitionId,member.id).run();ballotId=r.meta.last_row_id;}
  const participants=(await env.CROWN_DB.prepare("SELECT artist_id FROM competition_participants WHERE competition_id=?").bind(competitionId).all()).results||[];
  const criteria=(await env.CROWN_DB.prepare("SELECT id,max_score FROM judging_criteria WHERE competition_id=? AND active=1").bind(competitionId).all()).results||[];
  const pset=new Set(participants.map(x=>Number(x.artist_id))), cmap=new Map(criteria.map(x=>[Number(x.id),Number(x.max_score)]));
  if(scores.length!==pset.size*cmap.size)return json({ok:false,message:"EVERY ACTIVE CRITERION MUST BE SCORED."},400);
  const seen=new Set(),stmts=[];
  for(const x of scores){const a=Number(x.artistId),k=Number(x.criterionId),v=Number(x.score),key=a+":"+k;if(!pset.has(a)||!cmap.has(k)||!Number.isFinite(v)||v<0||v>cmap.get(k)||seen.has(key))return json({ok:false,message:"INVALID SCORECARD."},400);seen.add(key);stmts.push(env.CROWN_DB.prepare("INSERT INTO judging_scores(ballot_id,artist_id,criterion_id,score) VALUES(?,?,?,?) ON CONFLICT(ballot_id,artist_id,criterion_id) DO UPDATE SET score=excluded.score").bind(ballotId,a,k,v));}
  stmts.push(env.CROWN_DB.prepare("UPDATE judging_ballots SET status='submitted',submitted_at=datetime('now'),updated_at=datetime('now') WHERE id=?").bind(ballotId)); await env.CROWN_DB.batch(stmts);
  return json({ok:true,message:"CROWD SCORECARD LOCKED."});
}
async function logout(request,env){
  const raw=cookieValue(request,"awe_crown_session");
  if(raw&&env.SESSION_PEPPER&&env.CROWN_DB){
    const digest=await tokenDigest(raw,env.SESSION_PEPPER);
    await env.CROWN_DB.prepare(`DELETE FROM sessions WHERE token_hash=?`).bind(digest).run();
  }
  return json({ok:true,message:"CROWN SESSION ENDED."},200,{"set-cookie":"awe_crown_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"});
}
async function auth(request,env){
  requireRuntime(env);
  const body=await readJson(request), name=normalizeName(body.name), pck=String(body.pck||"");
  if(!name||!pck)return json({ok:false,message:"IDENTITY AND PCK REQUIRED."},400);
  const member=await env.CROWN_DB.prepare(`SELECT m.id,m.aw_id,m.crown_name,m.status,c.pck_hash,c.pck_salt FROM members m JOIN crown_credentials c ON c.member_id=m.id WHERE lower(m.crown_name)=? LIMIT 1`).bind(name).first();
  if(!member||member.status!=="active")return json({ok:false,message:"CROWN NOT RECOGNIZED."},401);
  const hash=await pckDigest(pck,member.pck_salt,env.PCK_PEPPER);
  if(!safeEqual(hash,member.pck_hash))return json({ok:false,message:"CROWN NOT RECOGNIZED."},401);
  const access=(await env.CROWN_DB.prepare(`SELECT house_slug,destination FROM member_access WHERE member_id=? AND active=1 ORDER BY priority ASC`).bind(member.id).all()).results||[];
  if(!access.length)return json({ok:false,message:"CROWN ACCESS NOT ASSIGNED."},403);
  const raw=randomToken(), digest=await tokenDigest(raw,env.SESSION_PEPPER);
  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare(`INSERT INTO sessions(token_hash,member_id,expires_at,created_at) VALUES(?,?,datetime('now','+8 hours'),datetime('now'))`).bind(digest,member.id),
    env.CROWN_DB.prepare(`INSERT INTO access_events(member_id,event_type,created_at) VALUES(?, 'login_success', datetime('now'))`).bind(member.id)
  ]);
  const destination=access[0].destination;
  const cookie=`awe_crown_session=${raw}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`;
  return json({ok:true,awId:member.aw_id,crownName:member.crown_name,destination},200,{"set-cookie":cookie});
}
async function enroll(request,env){
  requireRuntime(env);
  const body=await readJson(request);
  if(!(await verifyTurnstile(body.turnstileToken,request,env)))return json({ok:false,message:"HUMAN VERIFICATION REQUIRED."},403);
  const email=String(body.email||"").trim().toLowerCase(), crownName=String(body.crownName||"").trim(), pck=String(body.pck||"");
  if(!email||!crownName||!pck)return json({ok:false,message:"EMAIL, CROWN NAME AND PCK REQUIRED."},400);
  if(pck.length<12)return json({ok:false,message:"PCK MUST BE AT LEAST 12 CHARACTERS."},400);
  const exists=await env.CROWN_DB.prepare(`SELECT id FROM members WHERE email=? OR lower(crown_name)=lower(?) LIMIT 1`).bind(email,crownName).first();
  if(exists)return json({ok:false,message:"IDENTITY ALREADY EXISTS."},409);
  const row=await env.CROWN_DB.prepare("SELECT COALESCE(MAX(id),0)+1 AS n FROM members").first();
  const awId="AWE-"+String(row.n).padStart(6,"0");
  const salt=randomToken(18), hash=await pckDigest(pck,salt,env.PCK_PEPPER), verificationToken=randomToken(18);
  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare(`INSERT INTO members(aw_id,email,crown_name,status,verified_at) VALUES(?,?,?,'active',datetime('now'))`).bind(awId,email,crownName),
    env.CROWN_DB.prepare(`INSERT INTO enrollment_requests(email,crown_name,verification_token,status,created_at) VALUES(?,?,?,'preview-activated',datetime('now'))`).bind(email,crownName,verificationToken),
    env.CROWN_DB.prepare(`INSERT INTO crown_credentials(member_id,pck_hash,pck_salt) SELECT id,?,? FROM members WHERE aw_id=?`).bind(hash,salt,awId),
    env.CROWN_DB.prepare(`INSERT INTO member_access(member_id,house_slug,destination,active,priority) SELECT id,'crown-house','/crown/',1,1 FROM members WHERE aw_id=?`).bind(awId),
    env.CROWN_DB.prepare(`INSERT INTO access_events(member_id,event_type,created_at) SELECT id,'preview_enrollment',datetime('now') FROM members WHERE aw_id=?`).bind(awId)
  ]);
  return json({ok:true,message:"CROWN IDENTITY ESTABLISHED.",awId,crownName},201);
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    try {
      if(url.pathname==="/api/crown/auth"&&request.method==="POST")return await auth(request,env);
      if(url.pathname==="/api/crown/atrium"&&request.method==="GET")return await atriumState(request,env);
      if(url.pathname==="/api/crown/house-key"&&request.method==="POST")return await resolveHouseKey(request,env);
      if(url.pathname==="/api/crown/visit"&&request.method==="POST")return await visitHouse(request,env);
      if(url.pathname==="/api/analytics/visit"&&request.method==="POST")return await trackSiteVisit(request,env);
      if(url.pathname==="/api/analytics/stats"&&request.method==="GET")return await siteStats(request,env);
      if(url.pathname==="/api/crown/player/catalog"&&request.method==="GET")return await playerCatalog(request,env);
      if(url.pathname==="/api/crown/player/view"&&request.method==="POST")return await recordMediaView(request,env);
      if(url.pathname==="/api/crown/player/comments"&&request.method==="GET")return await listMediaComments(request,env);
      if(url.pathname==="/api/crown/player/comments"&&request.method==="POST")return await addMediaComment(request,env);
      if(url.pathname==="/api/crown/competitions"&&request.method==="GET")return await competitionList(request,env);
      if(url.pathname==="/api/crown/competition"&&request.method==="GET")return await competitionDetail(request,env);
      if(url.pathname==="/api/crown/judge"&&request.method==="POST")return await submitBallot(request,env);
      if(url.pathname==="/api/crown/logout"&&request.method==="POST")return await logout(request,env);
      if(url.pathname==="/api/crown/enroll"&&request.method==="POST")return await enroll(request,env);
      if(url.pathname==="/api/crown/health")return json({ok:true,service:"CROWN IDENTITY",db:!!env.CROWN_DB,pckPepper:typeof env.PCK_PEPPER==="string"&&env.PCK_PEPPER.length>0,sessionPepper:typeof env.SESSION_PEPPER==="string"&&env.SESSION_PEPPER.length>0,pbkdf2Iterations:PBKDF2_ITERATIONS});
      if(url.pathname.startsWith("/crown/"))return await crownAsset(request,env);
    } catch(error) {
      const message=String(error?.message||"");
      const code=/iteration counts above .*not supported/i.test(message)?"PCK_RUNTIME_LIMIT":/no such table/i.test(message)?"IDENTITY_SCHEMA_MISSING":/_MISSING$/.test(message)?"IDENTITY_RUNTIME_CONFIG":"IDENTITY_RUNTIME_FAILURE";
      const requestId=crypto.randomUUID();
      console.error(JSON.stringify({event:"crown_request_failed",code,requestId}));
      return json({ok:false,message:"CROWN SERVICE TEMPORARILY UNAVAILABLE.",code,requestId},503);
    }
    return env.ASSETS.fetch(request);
  }
};