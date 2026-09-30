import baseWorker from "./worker.js";
import {playerCatalogResponse} from "./lib/player-api.js";

const json=(data,status=200)=>new Response(JSON.stringify(data),{
  status,
  headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store"
  }
});

async function crownIdentity(request,env){
  const incoming=new URL(request.url);
  const probeUrl=new URL("/api/crown/atrium",incoming.origin);
  const probeRequest=new Request(probeUrl.toString(),{
    method:"GET",
    headers:request.headers
  });

  const probeResponse=await baseWorker.fetch(probeRequest,env);
  if(!probeResponse.ok)return {ok:false,response:probeResponse};

  const data=await probeResponse.json().catch(()=>null);
  if(!data?.ok||!data?.awId){
    return {ok:false,response:json({ok:false,message:"CROWN SESSION REQUIRED."},401)};
  }

  const member=await env.CROWN_DB.prepare(
    "SELECT id,aw_id,crown_name,status FROM members WHERE aw_id=? AND status='active' LIMIT 1"
  ).bind(data.awId).first();

  if(!member){
    return {ok:false,response:json({ok:false,message:"CROWN SESSION REQUIRED."},401)};
  }

  return {ok:true,member};
}

async function playerAccessSchema(env){
  if(!env?.CROWN_DB)return {ready:false,tables:[]};

  const expected=[
    "media_access_policy",
    "cypherz_house_access",
    "media_unlock_grants"
  ];

  const result=await env.CROWN_DB.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('media_access_policy','cypherz_house_access','media_unlock_grants')"
  ).all();

  const tables=(result?.results||[]).map(row=>row.name);
  return {
    ready:expected.every(name=>tables.includes(name)),
    tables
  };
}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);

    if(url.pathname==="/api/crown/player/access-health"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;

      try{
        const schema=await playerAccessSchema(env);
        return json({
          ok:true,
          service:"DA CROWD PLAYER ACCESS",
          schemaReady:schema.ready,
          tables:schema.tables,
          mode:schema.ready?"SCRYPT-CROWN-002":"LEGACY-FALLBACK"
        });
      }catch{
        return json({
          ok:false,
          message:"PLAYER ACCESS HEALTH UNAVAILABLE.",
          schemaReady:false
        },503);
      }
    }

    if(url.pathname==="/api/crown/player/catalog"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;

      try{
        const schema=await playerAccessSchema(env);

        // Until 0009 + 0010 exist remotely, preserve the currently working
        // Crown catalog rather than breaking Preview during migration rollout.
        if(!schema.ready)return baseWorker.fetch(request,env,ctx);

        return playerCatalogResponse(request,env,{
          crownMemberId:Number(identity.member.id),
          crownAuthenticated:true,
          surface:"crown"
        });
      }catch{
        return json({
          ok:false,
          message:"PLAYER TEMPORARILY UNAVAILABLE.",
          code:"PLAYER_ACCESS_RUNTIME_FAILURE"
        },503);
      }
    }

    return baseWorker.fetch(request,env,ctx);
  }
};
