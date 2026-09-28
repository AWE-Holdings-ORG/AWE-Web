const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const enc=new TextEncoder();
const b64url=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
async function pckDigest(pck,salt,pepper){
  const material=enc.encode(`${salt}:${pck}:${pepper}`);
  let digest=await crypto.subtle.digest("SHA-256",material);
  for(let i=0;i<120000;i++) digest=await crypto.subtle.digest("SHA-256",digest);
  return b64url(digest);
}
function randomToken(bytes=32){const a=new Uint8Array(bytes);crypto.getRandomValues(a);return b64url(a);}
async function tokenDigest(token,pepper){return b64url(await crypto.subtle.digest("SHA-256",enc.encode(token+":"+pepper)));}
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
  return json({ok:true,awId:member.aw_id,crownName:member.crown_name,destination},{},{});
}
async function enroll(request,env){
  const body=await readJson(request);
  if(!(await verifyTurnstile(body.turnstileToken,request,env)))return json({ok:false,message:"HUMAN VERIFICATION REQUIRED."},403);
  const email=String(body.email||"").trim().toLowerCase(), crownName=String(body.crownName||"").trim();
  if(!email||!crownName)return json({ok:false,message:"EMAIL AND CROWN NAME REQUIRED."},400);
  const exists=await env.CROWN_DB.prepare(`SELECT id FROM members WHERE email=? OR lower(crown_name)=lower(?) LIMIT 1`).bind(email,crownName).first();
  if(exists)return json({ok:false,message:"IDENTITY ALREADY EXISTS."},409);
  const pending=randomToken(18);
  await env.CROWN_DB.prepare(`INSERT INTO enrollment_requests(email,crown_name,verification_token,status,created_at) VALUES(?,?,?,'pending',datetime('now'))`).bind(email,crownName,pending).run();
  return json({ok:true,message:"ENROLLMENT REQUEST RECEIVED.",verificationPending:true},202);
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==="/api/crown/auth"&&request.method==="POST")return auth(request,env);
    if(url.pathname==="/api/crown/enroll"&&request.method==="POST")return enroll(request,env);
    if(url.pathname==="/api/crown/health")return json({ok:true,service:"CROWN IDENTITY",db:!!env.CROWN_DB});
    return env.ASSETS.fetch(request);
  }
};