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

  if(!access){
    await env.CROWN_DB.batch([
      env.CROWN_DB.prepare(`INSERT INTO member_discoveries(member_id,house_slug,discovery_key,discovered_at,last_visited_at) VALUES(?,?,?,datetime('now'),NULL) ON CONFLICT(member_id,house_slug) DO UPDATE SET discovery_key=COALESCE(member_discoveries.discovery_key,excluded.discovery_key)`).bind(member.id,route.house_slug,key),
      env.CROWN_DB.prepare(`INSERT INTO access_events(member_id,event_type,house_slug,created_at) VALUES(?,'house_discovered',?,datetime('now'))`).bind(member.id,route.house_slug)
    ]);
    return json({ok:false,message:"HOUSE DISCOVERED // ACCESS NOT YET GRANTED.",house:route.house_slug,houseName:route.name},403);
  }

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
function crownOwner(member){
  return member?.aw_id==="AWE-000001";
}

async function crownAdminMembers(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  if(!crownOwner(member))return json({ok:false,message:"OWNER ACCESS REQUIRED."},403);

  const members=(await env.CROWN_DB.prepare(`
    SELECT m.id,m.aw_id,m.crown_name,m.status,m.created_at,
           COALESCE(GROUP_CONCAT(CASE WHEN a.active=1 THEN a.house_slug END),'') AS houses
    FROM members m
    LEFT JOIN member_access a ON a.member_id=m.id
    GROUP BY m.id,m.aw_id,m.crown_name,m.status,m.created_at
    ORDER BY m.id ASC
  `).all()).results||[];

  const discoveries=(await env.CROWN_DB.prepare(`
    SELECT d.member_id,d.house_slug,d.discovery_key,d.discovered_at,d.last_visited_at
    FROM member_discoveries d
    ORDER BY d.member_id,d.discovered_at
  `).all()).results||[];

  const byMember=new Map();
  for(const d of discoveries){
    if(!byMember.has(Number(d.member_id)))byMember.set(Number(d.member_id),[]);
    byMember.get(Number(d.member_id)).push({
      houseSlug:d.house_slug,
      discoveryKey:d.discovery_key,
      discoveredAt:d.discovered_at,
      lastVisitedAt:d.last_visited_at
    });
  }

  return json({
    ok:true,
    members:members.map(row=>({
      awId:row.aw_id,
      crownName:row.crown_name,
      status:row.status,
      createdAt:row.created_at,
      houses:String(row.houses||"").split(",").filter(Boolean),
      discoveries:byMember.get(Number(row.id))||[]
    }))
  });
}

async function crownAdminGrant(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  if(!crownOwner(member))return json({ok:false,message:"OWNER ACCESS REQUIRED."},403);

  const body=await readJson(request);
  const awId=String(body.awId||"").trim();
  const houseSlug=String(body.houseSlug||"").trim().toLowerCase();
  if(!awId||!houseSlug)return json({ok:false,message:"MEMBER AND HOUSE REQUIRED."},400);

  const target=await env.CROWN_DB.prepare(`SELECT id,aw_id,crown_name,status FROM members WHERE aw_id=? AND status='active' LIMIT 1`).bind(awId).first();
  if(!target)return json({ok:false,message:"ACTIVE MEMBER NOT FOUND."},404);

  const house=await env.CROWN_DB.prepare(`SELECT slug,name,destination FROM houses WHERE slug=? LIMIT 1`).bind(houseSlug).first();
  if(!house)return json({ok:false,message:"HOUSE NOT FOUND."},404);

  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare(`INSERT INTO member_access(member_id,house_slug,destination,active,priority) VALUES(?,?,?,?,?) ON CONFLICT(member_id,house_slug) DO UPDATE SET destination=excluded.destination,active=1,priority=excluded.priority`).bind(target.id,house.slug,house.destination,1,20),
    env.CROWN_DB.prepare(`INSERT INTO member_discoveries(member_id,house_slug,discovery_key,discovered_at,last_visited_at) VALUES(?,?,?,datetime('now'),NULL) ON CONFLICT(member_id,house_slug) DO NOTHING`).bind(target.id,house.slug,"owner-grant"),
    env.CROWN_DB.prepare(`INSERT INTO access_events(member_id,event_type,house_slug,created_at) VALUES(?,'owner_access_granted',?,datetime('now'))`).bind(target.id,house.slug)
  ]);

  return json({ok:true,awId:target.aw_id,crownName:target.crown_name,house:house.slug,houseName:house.name,destination:house.destination});
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
async function crownLinkRequest(request,env){
  const member=await sessionMember(request,env);
  if(!member)return json({ok:false,message:"CROWN SESSION REQUIRED."},401);
  const body=await readJson(request),token=cleanText(body.linkToken,180);
  if(token.length<24)return json({ok:false,message:"LINK SIGNAL INVALID."},400);
  const digest=await tokenDigest(token,env.SESSION_PEPPER);
  const link=await env.CROWN_DB.prepare("SELECT id,profile_id,status,expires_at FROM cypherz_link_requests WHERE request_token_digest=? LIMIT 1").bind(digest).first();
  if(!link||link.status!=="pending"||Date.parse(link.expires_at)<=Date.now())return json({ok:false,message:"LINK SIGNAL EXPIRED OR INVALID."},409);
  const existing=await env.CROWN_DB.prepare("SELECT id FROM cypherz_profiles WHERE crown_member_id=? AND id<>? LIMIT 1").bind(member.id,link.profile_id).first();
  if(existing)return json({ok:false,message:"THIS CROWN IS ALREADY LINKED."},409);
  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare("UPDATE cypherz_link_requests SET status='approved',approved_member_id=?,approved_at=datetime('now') WHERE id=? AND status='pending'").bind(member.id,link.id),
    env.CROWN_DB.prepare("UPDATE cypherz_profiles SET crown_member_id=?,linked_at=datetime('now') WHERE id=? AND crown_member_id IS NULL").bind(member.id,link.profile_id)
  ]);
  return json({ok:true,message:"CROWN IDENTITY LINKED.",awId:member.aw_id,crownName:member.crown_name});
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
// Enrollment is deliberately different from authentication: no active Crown
// identity or House access is granted until email ownership is verified.
async function crownEnrollmentReady(env){
  if(!env?.CROWN_DB||!env.PCK_PEPPER||!env.SESSION_PEPPER||
     !env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY||
     !env.RESEND_API_KEY||!env.CROWN_EMAIL_FROM||!env.CROWN_PUBLIC_ORIGIN)return false;
  try{
    const origin=new URL(env.CROWN_PUBLIC_ORIGIN);
    if(origin.protocol!=="https:"||origin.username||origin.password)return false;
    const columns=(await env.CROWN_DB.prepare("PRAGMA table_info(enrollment_requests)").all()).results||[];
    return ["member_id","expires_at","verified_at","last_sent_at","referral_code"]
      .every(name=>columns.some(column=>column.name===name));
  }catch{return false;}
}
async function crownSignupConfig(env){
  const ready=await crownEnrollmentReady(env);
  return json({ok:true,ready,siteKey:ready?String(env.TURNSTILE_SITE_KEY):null});
}
function normalizeReferral(value){
  return String(value||"").trim().toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,60)||null;
}
function safeEmail(value){
  const email=String(value||"").trim().toLowerCase();
  return email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:null;
}
async function sendCrownVerification(email,name,token,env){
  const verifyUrl=new URL("/verify/",String(env.CROWN_PUBLIC_ORIGIN));
  verifyUrl.searchParams.set("token",token);
  const link=verifyUrl.toString();
  // Token is only transmitted to the email provider and the addressee.
  // No plaintext verification token is written to D1 or audit logs.
  const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{
      "authorization":"Bearer "+env.RESEND_API_KEY,
      "content-type":"application/json",
      "Idempotency-Key":"crown-verify-"+(await tokenDigest(token,env.SESSION_PEPPER))
    },
    body:JSON.stringify({
      from:String(env.CROWN_EMAIL_FROM),
      to:[email],
      subject:"Verify your Crown Network email",
      text:"Welcome to the Crown Network, "+name+"!\n\nVerify your email within 24 hours:\n"+link+
        "\n\nIf you did not request this invitation, you can ignore this email.\n"+
        "Crown Coins, if offered, are promotional rewards only; they have no cash value.",
      html:'<div style="font-family:Arial,sans-serif;background:#080706;color:#f2e7cd;padding:32px;line-height:1.6">'+
        '<h2 style="color:#e2b85d">WELCOME TO THE CROWN NETWORK</h2>'+
        '<p>One step left: verify your email to activate your Crown identity.</p>'+
        '<p><a style="background:#cba250;color:#090806;padding:12px 22px;text-decoration:none;font-weight:bold" href="'+link+'">VERIFY MY EMAIL</a></p>'+
        '<p>This invitation expires in 24 hours. If you did not register, ignore this message.</p>'+
        '<small>Crown Coins are promotional, non-cash rewards with no promised monetary value.</small></div>'
    })
  });
  return response.ok;
}
async function enroll(request,env){
  if(!(await crownEnrollmentReady(env))){
    return json({ok:false,message:"CROWN SIGNUP IS NOT YET OPEN."},503);
  }
  const body=await readJson(request);
  if(!(await verifyTurnstile(body.turnstileToken,request,env))){
    return json({ok:false,message:"HUMAN VERIFICATION REQUIRED."},403);
  }
  const email=safeEmail(body.email);
  const crownName=String(body.crownName||"").trim().replace(/\s+/g," ");
  const pck=String(body.pck||"");
  const referralCode=normalizeReferral(body.referralCode);
  if(!email||crownName.length<3||crownName.length>60||pck.length<12||pck.length>256){
    return json({ok:false,message:"VALID EMAIL, CROWN NAME (3–60) AND PCK (12–256) REQUIRED."},400);
  }
  const exists=await env.CROWN_DB.prepare(
    "SELECT 1 AS existing FROM members WHERE email=? OR lower(crown_name)=lower(?) LIMIT 1"
  ).bind(email,crownName).first();
  if(exists)return json({ok:false,message:"THIS CROWN NAME OR EMAIL CANNOT BE REGISTERED."},409);
  const next=await env.CROWN_DB.prepare("SELECT COALESCE(MAX(id),0)+1 AS n FROM members").first();
  const awId="AWE-"+String(next.n).padStart(6,"0");
  const salt=randomToken(18),pckHash=await pckDigest(pck,salt,env.PCK_PEPPER);
  const rawToken=randomToken(32),digest=await tokenDigest(rawToken,env.SESSION_PEPPER);
  try{
    await env.CROWN_DB.batch([
      env.CROWN_DB.prepare(
        "INSERT INTO members(aw_id,email,crown_name,status,verified_at) VALUES(?,?,?,'pending',NULL)"
      ).bind(awId,email,crownName),
      env.CROWN_DB.prepare(
        "INSERT INTO crown_credentials(member_id,pck_hash,pck_salt) SELECT id,?,? FROM members WHERE aw_id=?"
      ).bind(pckHash,salt,awId),
      env.CROWN_DB.prepare(
        "INSERT INTO enrollment_requests(email,crown_name,verification_token,status,created_at,member_id,expires_at,last_sent_at,referral_code) "+
        "SELECT email,crown_name,?,'pending',datetime('now'),id,datetime('now','+24 hours'),datetime('now'),? FROM members WHERE aw_id=?"
      ).bind(digest,referralCode,awId),
      env.CROWN_DB.prepare(
        "INSERT INTO access_events(member_id,event_type,created_at) SELECT id,'email_verification_requested',datetime('now') FROM members WHERE aw_id=?"
      ).bind(awId)
    ]);
  }catch{
    return json({ok:false,message:"SIGNUP COULD NOT BE RESERVED. PLEASE TRY AGAIN."},409);
  }
  try{
    if(!(await sendCrownVerification(email,crownName,rawToken,env)))throw Error("MAIL_FAILED");
  }catch{
    return json({ok:false,message:"IDENTITY RESERVED, BUT EMAIL DELIVERY FAILED. PLEASE USE RESEND VERIFICATION AFTER TWO MINUTES."},502);
  }
  return json({ok:true,status:"pending",message:"CHECK YOUR EMAIL TO VERIFY YOUR CROWN IDENTITY. YOUR ACCOUNT IS NOT ACTIVE YET."},202);
}
async function resendCrownVerification(request,env){
  if(!(await crownEnrollmentReady(env)))return json({ok:false,message:"CROWN SIGNUP IS NOT YET OPEN."},503);
  const body=await readJson(request);
  if(!(await verifyTurnstile(body.turnstileToken,request,env))){
    return json({ok:false,message:"HUMAN VERIFICATION REQUIRED."},403);
  }
  const email=safeEmail(body.email);
  if(!email)return json({ok:false,message:"VALID EMAIL REQUIRED."},400);
  // Keep response independent of existence so email discovery is not possible.
  const generic={ok:true,message:"IF THIS EMAIL HAS A PENDING CROWN SIGNUP, A NEW LINK WILL BE SENT WHEN ELIGIBLE."};
  const pending=await env.CROWN_DB.prepare(
    "SELECT e.id,m.crown_name FROM enrollment_requests e JOIN members m ON m.id=e.member_id "+
    "WHERE m.email=? AND m.status='pending' AND e.status='pending' "+
    "AND (e.last_sent_at IS NULL OR datetime(e.last_sent_at)<=datetime('now','-2 minutes')) "+
    "ORDER BY e.id DESC LIMIT 1"
  ).bind(email).first();
  if(!pending)return json(generic);
  const raw=randomToken(32),digest=await tokenDigest(raw,env.SESSION_PEPPER);
  const updated=await env.CROWN_DB.prepare(
    "UPDATE enrollment_requests SET verification_token=?,expires_at=datetime('now','+24 hours'),"+
    "last_sent_at=datetime('now') WHERE id=? AND status='pending' "+
    "AND (last_sent_at IS NULL OR datetime(last_sent_at)<=datetime('now','-2 minutes'))"
  ).bind(digest,pending.id).run();
  if(Number(updated?.meta?.changes||0)!==1)return json(generic);
  try{await sendCrownVerification(email,pending.crown_name,raw,env);}catch{}
  return json(generic);
}
async function verifyCrownEmail(request,env){
  if(!(await crownEnrollmentReady(env)))return json({ok:false,message:"CROWN VERIFICATION NOT AVAILABLE."},503);
  const body=await readJson(request);
  const token=String(body.token||"");
  if(token.length<30||token.length>256)return json({ok:false,message:"INVALID VERIFICATION LINK."},400);
  const digest=await tokenDigest(token,env.SESSION_PEPPER);
  const entry=await env.CROWN_DB.prepare(
    "SELECT e.id,e.member_id FROM enrollment_requests e JOIN members m ON m.id=e.member_id "+
    "WHERE e.verification_token=? AND e.status='pending' AND e.expires_at>datetime('now') "+
    "AND m.status='pending' LIMIT 1"
  ).bind(digest).first();
  if(!entry)return json({ok:false,message:"THIS VERIFICATION LINK HAS EXPIRED OR ALREADY BEEN USED. REQUEST A NEW LINK IF NEEDED."},410);
  const results=await env.CROWN_DB.batch([
    env.CROWN_DB.prepare(
      "UPDATE enrollment_requests SET status='verified',verified_at=datetime('now') "+
      "WHERE id=? AND verification_token=? AND status='pending' AND expires_at>datetime('now')"
    ).bind(entry.id,digest),
    env.CROWN_DB.prepare(
      "UPDATE members SET status='active',verified_at=datetime('now') "+
      "WHERE id=? AND status='pending' AND EXISTS ("+
      "SELECT 1 FROM enrollment_requests WHERE id=? AND status='verified' AND verification_token=?)"
    ).bind(entry.member_id,entry.id,digest),
    env.CROWN_DB.prepare(
      "INSERT OR IGNORE INTO member_access(member_id,house_slug,destination,active,priority) "+
      "SELECT id,'crown-house','/crown/',1,1 FROM members WHERE id=? AND status='active'"
    ).bind(entry.member_id)
  ]);
  if(Number(results[0]?.meta?.changes||0)!==1){
    return json({ok:false,message:"VERIFICATION LINK ALREADY USED."},410);
  }
  const member=await env.CROWN_DB.prepare(
    "SELECT aw_id,crown_name FROM members WHERE id=? AND status='active'"
  ).bind(entry.member_id).first();
  if(!member)return json({ok:false,message:"VERIFICATION DID NOT COMPLETE."},503);
  return json({ok:true,message:"EMAIL VERIFIED. YOUR CROWN IDENTITY IS ACTIVE.",awId:member.aw_id,crownName:member.crown_name});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    try {
      if(request.method==="GET"&&(url.pathname==="/join/x"||url.pathname==="/join/x/")){
        return Response.redirect(new URL("/join/?ref=x-tha-god",request.url).toString(),302);
      }
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
      if(url.pathname==="/api/crown/cypherz/link"&&request.method==="POST")return await crownLinkRequest(request,env);
      if(url.pathname==="/api/crown/admin/members"&&request.method==="GET")return await crownAdminMembers(request,env);
      if(url.pathname==="/api/crown/admin/grant"&&request.method==="POST")return await crownAdminGrant(request,env);
      if(url.pathname==="/api/crown/logout"&&request.method==="POST")return await logout(request,env);
      if(url.pathname==="/api/crown/enroll"&&request.method==="POST")return await enroll(request,env);
      if(url.pathname==="/api/crown/signup-config"&&request.method==="GET")return await crownSignupConfig(env);
      if(url.pathname==="/api/crown/resend-verification"&&request.method==="POST")return await resendCrownVerification(request,env);
      if(url.pathname==="/api/crown/verify-email"&&request.method==="POST")return await verifyCrownEmail(request,env);
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