import {buildPlayerViewerContext} from "./player-viewer-context.js";
import {buildPlayerCatalog} from "./player-catalog-service.js";

const json=(data,status=200)=>new Response(JSON.stringify(data),{
  status,
  headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store"
  }
});

async function tableExists(db,name){
  const row=await db.prepare(
    "SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=? LIMIT 1"
  ).bind(name).first();
  return !!row?.ok;
}

async function publicMetaMap(db,media){
  if(!(await tableExists(db,"archive_media_public_meta")))return new Map();
  const ids=(media||[]).map(x=>Number(x.id)).filter(Number.isInteger);
  if(!ids.length)return new Map();

  // Keep D1 statements small for large archives.
  const map=new Map();
  for(let i=0;i<ids.length;i+=150){
    const chunk=ids.slice(i,i+150);
    const marks=chunk.map(()=>"?").join(",");
    const rows=(await db.prepare(
      `SELECT media_id,public_title,public_caption,updated_at
       FROM archive_media_public_meta
       WHERE media_id IN (${marks})`
    ).bind(...chunk).all())?.results||[];
    for(const row of rows)map.set(Number(row.media_id),row);
  }
  return map;
}

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

    const meta=await publicMetaMap(env.CROWN_DB,catalog.media||[]);

    const media=(catalog.media||[]).map(item=>{
      const basePath=surface==="crown"?"/api/crown/archivez/media":"/api/archivez/media";
      const mediaId=Number(item.id);
      const publicMeta=meta.get(mediaId)||null;
      const sourceTitle=item.title;
      const publicTitle=String(publicMeta?.public_title||"").trim()||sourceTitle;
      const publicCaption=String(publicMeta?.public_caption||"").trim()||null;
      const delivery={
        ...item,
        title:publicTitle,
        public_title:publicMeta?.public_title||null,
        public_caption:publicCaption,
        source_title:provenanceVisible?sourceTitle:null,
        description:publicCaption||item.description,
        preview_url:Number.isInteger(mediaId)?basePath+"?mediaId="+mediaId+"&mode=preview":null,
        thumb_url:Number.isInteger(mediaId)&&item.provider!=="dropbox"
          ?basePath+"?mediaId="+mediaId+"&mode=thumbnail"
          :null,
        provenance_visible:provenanceVisible,
        admin_editable:provenanceVisible
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
      delete delivery.source_title;
      delivery.admin_editable=false;
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
