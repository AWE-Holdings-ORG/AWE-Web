import baseWorker from "./worker.js";
import {playerCatalogResponse} from "./lib/player-api.js";
import {archivezCatalogResponse} from "./lib/archivez-api.js";
import {buildPlayerViewerContext} from "./lib/player-viewer-context.js";
import {resolveMediaAccess} from "./lib/player-access.js";
import {playerAnalyticsSchemaReady,playerAnalyticsAuthorized,recordPlaybackSignal,playerAnalyticsResponse} from "./lib/player-analytics.js";

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

async function engagementMediaId(request){
  if(request.method==="GET"){
    const value=Number(new URL(request.url).searchParams.get("mediaId"));
    return Number.isInteger(value)&&value>0?value:null;
  }

  const body=await request.clone().json().catch(()=>null);
  const value=Number(body?.mediaId);
  return Number.isInteger(value)&&value>0?value:null;
}

async function playerEngagementAuthorized(request,env,member){
  const mediaId=await engagementMediaId(request);
  if(!mediaId)return {authorized:null};

  const viewer=await buildPlayerViewerContext(env.CROWN_DB,{
    crownMemberId:Number(member.id),
    crownAuthenticated:true
  });

  if(viewer.identityConflict)return {authorized:false};

  const media=await env.CROWN_DB.prepare(`
    SELECT
      m.id,
      COALESCE(p.access_state,'unknown') AS access_state,
      p.house_slug,
      p.unlock_slug,
      COALESCE(p.teaser_mode,'concealed') AS teaser_mode
    FROM artist_media m
    LEFT JOIN media_access_policy p ON p.media_id=m.id AND p.active=1
    WHERE m.id=? AND m.active=1
    LIMIT 1
  `).bind(mediaId).first();

  if(!media)return {authorized:false};

  const decision=resolveMediaAccess(media,viewer);
  return {authorized:decision.authorized===true};
}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);

    if(url.pathname==="/api/archivez/catalog"&&request.method==="GET"){
      try{
        const schema=await playerAccessSchema(env);
        if(!schema.ready){
          return json({
            ok:false,
            message:"PUBLIC ARCHIVEZ DATA NOT READY.",
            code:"PLAYER_ACCESS_SCHEMA_MISSING"
          },503);
        }

        return archivezCatalogResponse(request,env,{
          crownMemberId:null,
          cypherzProfileId:null,
          crownAuthenticated:false,
          surface:"public"
        });
      }catch{
        return json({
          ok:false,
          message:"PUBLIC ARCHIVEZ TEMPORARILY UNAVAILABLE.",
          code:"ARCHIVEZ_PUBLIC_RUNTIME_FAILURE"
        },503);
      }
    }

    if(url.pathname==="/api/crown/archivez/catalog"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;

      try{
        const schema=await playerAccessSchema(env);
        if(!schema.ready){
          return json({
            ok:false,
            message:"ARCHIVEZ DATA NOT READY.",
            code:"PLAYER_ACCESS_SCHEMA_MISSING"
          },503);
        }

        return archivezCatalogResponse(request,env,{
          crownMemberId:Number(identity.member.id),
          crownAuthenticated:true,
          surface:"crown"
        });
      }catch{
        return json({
          ok:false,
          message:"ARCHIVEZ TEMPORARILY UNAVAILABLE.",
          code:"ARCHIVEZ_RUNTIME_FAILURE"
        },503);
      }
    }

    if(url.pathname==="/api/player/catalog"&&request.method==="GET"){
      try{
        const schema=await playerAccessSchema(env);
        if(!schema.ready){
          return json({
            ok:false,
            message:"PUBLIC PLAYER DATA NOT READY.",
            code:"PLAYER_ACCESS_SCHEMA_MISSING"
          },503);
        }

        return playerCatalogResponse(request,env,{
          crownMemberId:null,
          cypherzProfileId:null,
          crownAuthenticated:false,
          surface:"public"
        });
      }catch{
        return json({
          ok:false,
          message:"PUBLIC PLAYER TEMPORARILY UNAVAILABLE.",
          code:"PLAYER_PUBLIC_RUNTIME_FAILURE"
        },503);
      }
    }

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

    if(url.pathname==="/api/crown/player/playback"&&request.method==="POST"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;

      try{
        const ready=await playerAnalyticsSchemaReady(env.CROWN_DB);
        if(!ready){
          return json({
            ok:false,
            message:"PLAYER ANALYTICS SCHEMA NOT READY.",
            code:"PLAYER_ANALYTICS_SCHEMA_MISSING"
          },503);
        }

        const decision=await playerEngagementAuthorized(request,env,identity.member);
        if(decision.authorized===null)return json({ok:false,message:"INVALID PLAYBACK SIGNAL."},400);
        if(!decision.authorized)return json({ok:false,message:"MEDIA NOT AVAILABLE."},404);

        return recordPlaybackSignal(request,env,{memberId:Number(identity.member.id)});
      }catch{
        return json({
          ok:false,
          message:"PLAYER ANALYTICS TEMPORARILY UNAVAILABLE.",
          code:"PLAYER_ANALYTICS_RUNTIME_FAILURE"
        },503);
      }
    }

    if(url.pathname==="/api/crown/player/analytics-access"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;

      try{
        const ready=await playerAnalyticsSchemaReady(env.CROWN_DB);
        if(!ready)return json({ok:true,granted:false,schemaReady:false});
        const granted=await playerAnalyticsAuthorized(env.CROWN_DB,Number(identity.member.id));
        return json({ok:true,granted,schemaReady:true});
      }catch{
        return json({ok:true,granted:false,schemaReady:false});
      }
    }

    if(url.pathname==="/api/crown/player/analytics"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;

      try{
        const ready=await playerAnalyticsSchemaReady(env.CROWN_DB);
        if(!ready){
          return json({
            ok:false,
            message:"PLAYER ANALYTICS SCHEMA NOT READY.",
            code:"PLAYER_ANALYTICS_SCHEMA_MISSING"
          },503);
        }

        const allowed=await playerAnalyticsAuthorized(env.CROWN_DB,Number(identity.member.id));
        if(!allowed)return json({ok:false,message:"ANALYTICS ACCESS REQUIRED."},403);

        return playerAnalyticsResponse(request,env);
      }catch{
        return json({
          ok:false,
          message:"PLAYER ANALYTICS TEMPORARILY UNAVAILABLE.",
          code:"PLAYER_ANALYTICS_RUNTIME_FAILURE"
        },503);
      }
    }

    const isPlayerEngagement=
      (url.pathname==="/api/crown/player/view"&&request.method==="POST")||
      (url.pathname==="/api/crown/player/comments"&&(request.method==="GET"||request.method==="POST"));

    if(isPlayerEngagement){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;

      try{
        const schema=await playerAccessSchema(env);
        if(!schema.ready)return baseWorker.fetch(request,env,ctx);

        const decision=await playerEngagementAuthorized(request,env,identity.member);

        // Preserve the legacy endpoint's own 400 validation for malformed IDs.
        if(decision.authorized===null)return baseWorker.fetch(request,env,ctx);

        // Fail closed without confirming protected/concealed media details.
        if(!decision.authorized)return json({ok:false,message:"MEDIA NOT AVAILABLE."},404);

        return baseWorker.fetch(request,env,ctx);
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
