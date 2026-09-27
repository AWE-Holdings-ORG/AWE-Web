import {json,readCookie,sha256} from "../../_lib/crown.js";

export async function onRequestPost(context){
  const token=readCookie(context.request,"__Host-awe_crown");
  if(token&&context.env.CROWN_DB){
    try{
      const sessionHash=await sha256(token);
      await context.env.CROWN_DB.prepare(
        "UPDATE crown_sessions SET revoked_at=? WHERE session_hash=? AND revoked_at IS NULL"
      ).bind(new Date().toISOString(),sessionHash).run();
    }catch(err){console.error("crown logout error",err);}
  }
  return json({ok:true},200,{"set-cookie":"__Host-awe_crown=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"});
}
