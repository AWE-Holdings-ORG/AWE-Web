import {json,randomToken,sha256} from "../../_lib/crown.js";

export async function onRequestPost(context){
  try{
    if(!context.env.CROWN_DB)return json({ok:false,error:"CROWN_BACKEND_NOT_CONFIGURED"},503);
    const body=await context.request.json().catch(()=>null);
    const key=typeof body?.key==="string"?body.key.trim():"";
    if(!key||key.length>128)return json({ok:false,error:"ACCESS_DENIED"},401);

    const keyHash=await sha256(key);
    const now=new Date();
    const row=await context.env.CROWN_DB.prepare(
      `SELECT id,label,max_uses,use_count,expires_at
         FROM crown_keys
        WHERE key_hash=? AND status='active'
        LIMIT 1`
    ).bind(keyHash).first();

    if(!row)return json({ok:false,error:"ACCESS_DENIED"},401);
    if(row.expires_at&&Date.parse(row.expires_at)<=now.getTime())return json({ok:false,error:"ACCESS_DENIED"},401);
    if(row.max_uses!==null&&Number(row.use_count)>=Number(row.max_uses))return json({ok:false,error:"ACCESS_DENIED"},401);

    const entitlements=await context.env.CROWN_DB.prepare(
      "SELECT entitlement FROM crown_key_entitlements WHERE key_id=? ORDER BY entitlement"
    ).bind(row.id).all();
    const grants=(entitlements.results||[]).map(x=>x.entitlement);
    if(!grants.length)return json({ok:false,error:"ACCESS_DENIED"},401);

    const rawToken=randomToken(32);
    const sessionHash=await sha256(rawToken);
    const sessionId=crypto.randomUUID();
    const createdAt=now.toISOString();
    const expiresAt=new Date(now.getTime()+24*60*60*1000).toISOString();

    const statements=[
      context.env.CROWN_DB.prepare(
        "INSERT INTO crown_sessions (id,key_id,session_hash,created_at,expires_at) VALUES (?,?,?,?,?)"
      ).bind(sessionId,row.id,sessionHash,createdAt,expiresAt),
      context.env.CROWN_DB.prepare(
        "UPDATE crown_keys SET use_count=use_count+1,last_used_at=? WHERE id=?"
      ).bind(createdAt,row.id)
    ];
    for(const entitlement of grants){
      statements.push(context.env.CROWN_DB.prepare(
        "INSERT INTO crown_session_entitlements (session_id,entitlement) VALUES (?,?)"
      ).bind(sessionId,entitlement));
    }
    await context.env.CROWN_DB.batch(statements);

    const destination=grants.includes("crowd")?"/crown/crowd/":"/crown/";
    const cookie=`__Host-awe_crown=${rawToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`;
    return json({ok:true,destination,entitlements:grants},200,{"set-cookie":cookie});
  }catch(err){
    console.error("crown auth error",err);
    return json({ok:false,error:"CROWN_AUTH_ERROR"},500);
  }
}
export function onRequest(){return json({ok:false,error:"METHOD_NOT_ALLOWED"},405,{"allow":"POST"});}
