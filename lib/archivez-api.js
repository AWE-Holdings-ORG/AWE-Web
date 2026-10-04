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

    let provenanceVisible=false;
    if(surface==="crown"&&crownMemberId){
      const member=await env.CROWN_DB.prepare(
        "SELECT aw_id FROM members WHERE id=? AND status='active' LIMIT 1"
      ).bind(Number(crownMemberId)).first();
      provenanceVisible=member?.aw_id==="AWE-000001";
    }

    const media=(catalog.media||[]).map(item=>{
      const basePath=surface==="crown"?"/api/crown/archivez/media":"/api/archivez/media";
      const mediaId=Number(item.id);
      const delivery={
        ...item,
        preview_url:Number.isInteger(mediaId)?basePath+"?mediaId="+mediaId+"&mode=preview":null,
        thumb_url:Number.isInteger(mediaId)&&item.provider!=="dropbox"
          ?basePath+"?mediaId="+mediaId+"&mode=thumbnail"
          :null,
        provenance_visible:provenanceVisible
      };

      if(provenanceVisible)return delivery;

      if(String(delivery.description||"").toLowerCase().startsWith("dropbox intake")){
        delivery.description=String(delivery.media_type||"").toLowerCase()==="photo"
          ?"Tha X Filez image. Artist tier/category review pending."
          :"Tha X Filez video. Artist tier/category review pending.";
      }else if(String(delivery.description||"").toLowerCase().startsWith("drive intake")){
        delivery.description=String(delivery.media_type||"").toLowerCase()==="photo"
          ?"Tha X Filez image. Artist tier/category review pending."
          :"Tha X Filez video. Artist tier/category review pending.";
      }

      delete delivery.provider;
      delete delivery.external_id;
      delete delivery.canonical_url;
      delete delivery.source_name;
      delete delivery.source_url;
      delete delivery.rights_status;
      delete delivery.thumbnail_url;
      return delivery;
    });

    return json({
      ok:true,
      archive:{
        collectionSlug,
        surface,
        provenanceVisible
      },
      ...catalog,
      media
    });
  }catch(error){
    const code=String(error?.message||"ARCHIVEZ_RUNTIME_FAILURE");
    const safeCode=/^[A-Z0-9_]+$/.test(code)?code:"ARCHIVEZ_RUNTIME_FAILURE";
    return json({ok:false,message:"ARCHIVEZ TEMPORARILY UNAVAILABLE.",code:safeCode},503);
  }
}
