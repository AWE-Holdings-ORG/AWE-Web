export function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
}
export async function sha256(value){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
export function randomToken(bytes=32){
  const buf=new Uint8Array(bytes);crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
}
export function readCookie(request,name){
  const header=request.headers.get("cookie")||"";
  for(const part of header.split(";")){
    const [k,...rest]=part.trim().split("=");
    if(k===name)return decodeURIComponent(rest.join("="));
  }
  return null;
}
export function notFound(){
  return new Response("Not Found",{status:404,headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}});
}
export async function requireEntitlement(context,entitlement){
  const token=readCookie(context.request,"__Host-awe_crown");
  if(!token||!context.env.CROWN_DB)return false;
  const sessionHash=await sha256(token);
  const now=new Date().toISOString();
  const row=await context.env.CROWN_DB.prepare(
    `SELECT 1 AS ok
       FROM crown_sessions s
       JOIN crown_session_entitlements e ON e.session_id=s.id
      WHERE s.session_hash=?
        AND s.revoked_at IS NULL
        AND s.expires_at>?
        AND e.entitlement=?
      LIMIT 1`
  ).bind(sessionHash,now,entitlement).first();
  return !!row?.ok;
}
