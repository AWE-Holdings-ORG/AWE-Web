import {buildPlayerViewerContext} from "./player-viewer-context.js";
import {buildPlayerCatalog} from "./player-catalog-service.js";

const json=(data,status=200)=>new Response(JSON.stringify(data),{
  status,
  headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store"
  }
});

/**
 * Runtime bridge for Da CROWD Player catalog requests.
 *
 * Authentication is intentionally outside this module. The Worker passes only
 * identities it has already authenticated. This keeps credential/PCK handling
 * separate from media authorization.
 */
export async function playerCatalogResponse(request,env,{
  crownMemberId=null,
  cypherzProfileId=null,
  crownAuthenticated=false,
  surface="crown"
}={}){
  if(!env?.CROWN_DB)return json({ok:false,message:"PLAYER DATA UNAVAILABLE."},503);

  try{
    const viewer=await buildPlayerViewerContext(env.CROWN_DB,{
      crownMemberId,
      cypherzProfileId,
      crownAuthenticated
    });

    if(viewer.identityConflict){
      return json({ok:false,message:"IDENTITY LINK CONFLICT."},403);
    }

    const artistSlug=new URL(request.url).searchParams.get("artist")||"x-tha-god";
    const catalog=await buildPlayerCatalog(env.CROWN_DB,{
      artistSlug,
      viewer,
      surface
    });

    if(!catalog)return json({ok:false,message:"ARTIST SIGNAL NOT FOUND."},404);
    return json({ok:true,...catalog});
  }catch(error){
    const code=String(error?.message||"PLAYER_RUNTIME_FAILURE");
    const safeCode=/^[A-Z0-9_]+$/.test(code)?code:"PLAYER_RUNTIME_FAILURE";
    return json({ok:false,message:"PLAYER TEMPORARILY UNAVAILABLE.",code:safeCode},503);
  }
}
