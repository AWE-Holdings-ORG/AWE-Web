const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const enc=new TextEncoder();
const b64url=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
async function pckDigest(pck,salt,pepper){
  const base=await crypto.subtle.importKey("raw",enc.encode(String(pck)+":"+String(pepper||"")),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:310000},base,256);
  return b64url(bits);
}
function randomToken(bytes=32){const a=new Uint8Array(bytes);crypto.getRandomValues(a);return b64url(a);}
async function tokenDigest(token,pepper){return b64url(await crypto.subtle.digest("SHA-256",enc.encode(token+":"+pepper)));}
function cookieValue(request,name){const raw=request.headers.get("cookie")||"";for(const part of raw.split(";")){const [k,...v]=part.trim().split("=");if(k===name)return v.join("=");}return "";}
async function sessionMember(request,env){
  const raw=cookieValue(request,"awe_crown_session"); if(!raw)return null;
  const digest=await tokenDigest(raw,env.SESSION_PEPPER||env.PCK_PEPPER||"preview-only");
  return env.CROWN_DB.prepare(`SELECT m.id,m.aw_id,m.crown_name,m.status FROM sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires_at>datetime('now') AND m.status='active' LIMIT 1`).bind(digest).first();
}
async function crownAsset(request,env){
  const member=await sessionMember(request,env);
  if(!member)return Response.redirect(new URL("/",request.url).toString(),302);
  return env.ASSETS.fetch(request);
}
function normalizeName(v){return String(v||"").trim().toLowerCase();}
async function readJson(request){try{return await request.json()}catch{return {}}}
async function verifyTurnstile(token,request,env){
  if(!env.TURNSTILE_SECRET)return true; // preview until secret is configured
  if(!token)return false;
  const form=new FormData(); form.set("secret",env.TURNSTILE_SECRET); form.set("response",token);
  const ip=request.headers.get("CF-Connecting-IP"); if(ip)form.set("remoteip",ip);
  const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:form});
  return !!(await r.json()).success;
}
async function auth(request,env){
  const body=await readJson(request), name=normalizeName(body.name), pck=String(body.pck||"");
  if(!name||!pck)return json({ok:false,message:"IDENTITY AND PCK REQUIRED."},400);
  const member=await env.CROWN_DB.prepare(`SELECT m.id,m.aw_id,m.crown_name,m.status,c.pck_hash,c.pck_salt FROM members m JOIN crown_credentials c ON c.member_id=m.id WHERE lower(m.crown_name)=? LIMIT 1`).bind(name).first();
  if(!member||member.status!=="active")return json({ok:false,message:"CROWN NOT RECOGNIZED."},401);
  const hash=await pckDigest(pck,member.pck_salt,env.PCK_PEPPER||"preview-only");
  if(hash!==member.pck_hash)return json({ok:false,message:"CROWN NOT RECOGNIZED."},401);
  const access=(await env.CROWN_DB.prepare(`SELECT house_slug,destination FROM member_access WHERE member_id=? AND active=1 ORDER BY priority ASC`).bind(member.id).all()).results||[];
  const raw=randomToken(), digest=await tokenDigest(raw,env.SESSION_PEPPER||env.PCK_PEPPER||"preview-only");
  await env.CROWN_DB.prepare(`INSERT INTO sessions(token_hash,member_id,expires_at,created_at) VALUES(?,?,datetime('now','+8 hours'),datetime('now'))`).bind(digest,member.id).run();
  await env.CROWN_DB.prepare(`INSERT INTO access_events(member_id,event_type,created_at) VALUES(?, 'login_success', datetime('now'))`).bind(member.id).run();
  const destination=access[0]?.destination||"/crown/";
  const cookie=`awe_crown_session=${raw}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`;
  return json({ok:true,awId:member.aw_id,crownName:member.crown_name,destination},200,{"set-cookie":cookie});
}
async function enroll(request,env){
  const body=await readJson(request);
  if(!(await verifyTurnstile(body.turnstileToken,request,env)))return json({ok:false,message:"HUMAN VERIFICATION REQUIRED."},403);
  const email=String(body.email||"").trim().toLowerCase(), crownName=String(body.crownName||"").trim(), pck=String(body.pck||"");
  if(!email||!crownName||!pck)return json({ok:false,message:"EMAIL, CROWN NAME AND PCK REQUIRED."},400);
  if(pck.length<12)return json({ok:false,message:"PCK MUST BE AT LEAST 12 CHARACTERS."},400);
  const exists=await env.CROWN_DB.prepare(`SELECT id FROM members WHERE email=? OR lower(crown_name)=lower(?) LIMIT 1`).bind(email,crownName).first();
  if(exists)return json({ok:false,message:"IDENTITY ALREADY EXISTS."},409);
  const awId="AWE-"+String((await env.CROWN_DB.prepare("SELECT COUNT(*) AS n FROM members").first()).n+1).padStart(6,"0");
  const salt=randomToken(18), hash=await pckDigest(pck,salt,env.PCK_PEPPER||"preview-only");
  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare(`INSERT INTO members(aw_id,email,crown_name,status,verified_at) VALUES(?,?,?,'active',datetime('now'))`).bind(awId,email,crownName),
    env.CROWN_DB.prepare(`INSERT INTO enrollment_requests(email,crown_name,verification_token,status,created_at) VALUES(?,?,?,'preview-activated',datetime('now'))`).bind(email,crownName,randomToken(18))
  ]);
  const member=await env.CROWN_DB.prepare("SELECT id FROM members WHERE aw_id=?").bind(awId).first();
  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare("INSERT INTO crown_credentials(member_id,pck_hash,pck_salt) VALUES(?,?,?)").bind(member.id,hash,salt),
    env.CROWN_DB.prepare("INSERT INTO member_access(member_id,house_slug,destination,active,priority) VALUES(?, 'crown-house','/crown/',1,1)").bind(member.id),
    env.CROWN_DB.prepare("INSERT INTO access_events(member_id,event_type,created_at) VALUES(?,'preview_enrollment',datetime('now'))").bind(member.id)
  ]);
  return json({ok:true,message:"CROWN IDENTITY ESTABLISHED.",awId,crownName},201);
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    try {
      if(url.pathname==="/api/crown/auth"&&request.method==="POST")return await auth(request,env);
      if(url.pathname==="/api/crown/enroll"&&request.method==="POST")return await enroll(request,env);
      if(url.pathname==="/api/crown/health")return json({ok:true,service:"CROWN IDENTITY",db:!!env.CROWN_DB,pckPepper:typeof env.PCK_PEPPER==="string"&&env.PCK_PEPPER.length>0,sessionPepper:typeof env.SESSION_PEPPER==="string"&&env.SESSION_PEPPER.length>0});
      if(url.pathname.startsWith("/crown/"))return await crownAsset(request,env);
    } catch(error) {
      // Classify locally; never emit raw exceptions, request bodies, or binding values.
      const message=String(error?.message||"");
      const code=/iteration counts above .*not supported/i.test(message)?"PCK_RUNTIME_LIMIT":/no such table/i.test(message)?"IDENTITY_SCHEMA_MISSING":"IDENTITY_RUNTIME_FAILURE";
      const requestId=crypto.randomUUID();
      console.error(JSON.stringify({event:"crown_request_failed",code,requestId}));
      return json({ok:false,message:"CROWN SERVICE TEMPORARILY UNAVAILABLE.",code,requestId},503);
    }
    return env.ASSETS.fetch(request);
  }
};
