import {buildPlayerViewerContext} from "./player-viewer-context.js";
import {buildPlayerCatalog} from "./player-catalog-service.js";

const json=(data,status=200)=>new Response(JSON.stringify(data),{
  status,
  headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store"
  }
});

export async function archivezCatalogResponse(request,env,{
  crownMemberId=null,
  cypherzProfileId=null,
  crownAuthenticated=false,
  surface="crown"
}={}){
  if(!env?.CROWN_DB)return json({ok:false,message:"ARCHIVEZ DATA UNAVAILABLE."},503);

  try{
    const viewer=await buildPlayerViewerContext(env.CROWN_DB,{
      crownMemberId,
      cypherzProfileId,
      crownAuthenticated
    });

    if(viewer.identityConflict){
      return json({ok:false,message:"IDENTITY LINK CONFLICT."},403);
    }

    const url=new URL(request.url);
    const artistSlug=url.searchParams.get("artist")||"x-tha-god";
    const collectionSlug=url.searchParams.get("collection")||"tha-x-filez";

    const catalog=await buildPlayerCatalog(env.CROWN_DB,{
      artistSlug,
      viewer,
      surface,
      collectionSlug
    });

    if(!catalog)return json({ok:false,message:"ARCHIVE SIGNAL NOT FOUND."},404);

    return json({
      ok:true,
      archive:{
        collectionSlug,
        surface
      },
      ...catalog
    });
  }catch(error){
    const code=String(error?.message||"ARCHIVEZ_RUNTIME_FAILURE");
    const safeCode=/^[A-Z0-9_]+$/.test(code)?code:"ARCHIVEZ_RUNTIME_FAILURE";
    return json({ok:false,message:"ARCHIVEZ TEMPORARILY UNAVAILABLE.",code:safeCode},503);
  }
}
