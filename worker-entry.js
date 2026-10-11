import baseWorker from "./worker.js";
import {playerCatalogResponse} from "./lib/player-api.js";
import {archivezCatalogResponse} from "./lib/archivez-api.js";
import {buildPlayerViewerContext} from "./lib/player-viewer-context.js";
import {resolveMediaAccess} from "./lib/player-access.js";
import {playerAnalyticsSchemaReady,playerAnalyticsAuthorized,recordPlaybackSignal,playerAnalyticsResponse} from "./lib/player-analytics.js";
import {houseAdminCapabilities} from "./lib/house-admin.js";

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

async function playerRosterSchemaReady(env){
  if(!env?.CROWN_DB)return false;
  const result=await env.CROWN_DB.prepare(
    "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('player_signals','house_player_roster','member_signal_unlocks','player_cheat_codes','player_cheat_redemptions')"
  ).first();
  return Number(result?.n||0)===5;
}

async function memberHasHouse(db,memberId,houseSlug){
  const row=await db.prepare(
    "SELECT 1 AS ok FROM member_access WHERE member_id=? AND house_slug=? AND active=1 LIMIT 1"
  ).bind(memberId,houseSlug).first();
  return !!row?.ok;
}

async function playerRosterResponse(request,env,member){
  if(!(await playerRosterSchemaReady(env))){
    return json({ok:false,message:"PLAYER ROSTER SCHEMA NOT READY.",code:"PLAYER_ROSTER_SCHEMA_MISSING"},503);
  }

  const url=new URL(request.url);
  const houseSlug=String(url.searchParams.get("house")||"the-crowd").trim().toLowerCase();
  if(!(await memberHasHouse(env.CROWN_DB,Number(member.id),houseSlug))){
    return json({ok:false,message:"HOUSE ACCESS REQUIRED."},403);
  }

  const result=await env.CROWN_DB.prepare(`
    SELECT
      s.signal_slug,s.artist_slug,s.display_name,s.canonical_house_slug,s.signal_label,
      s.represents_text,s.world_text,s.status_text,s.character_image_url,s.headshot_url,
      s.art_fit,s.art_position,s.destination,s.start_text,s.building_message,
      COALESCE(r.relationship_status,'unlocked') AS relationship_status,
      COALESCE(r.sort_order,900) AS sort_order,
      u.unlock_source,
      CASE WHEN u.member_id IS NULL THEN 0 ELSE 1 END AS member_unlocked
    FROM player_signals s
    LEFT JOIN house_player_roster r
      ON r.house_slug=? AND r.signal_slug=s.signal_slug AND r.active=1
    LEFT JOIN member_signal_unlocks u
      ON u.member_id=? AND u.house_slug=? AND u.signal_slug=s.signal_slug AND u.active=1
    WHERE s.active=1
      AND (
        (r.signal_slug IS NOT NULL AND r.visible_by_default=1)
        OR u.member_id IS NOT NULL
      )
    ORDER BY COALESCE(r.sort_order,900),s.display_name
  `).bind(houseSlug,Number(member.id),houseSlug).all();

  const signals=(result?.results||[]).map((row,index)=>({
    index:index+1,
    signalSlug:row.signal_slug,
    artistSlug:row.artist_slug,
    displayName:row.display_name,
    canonicalHouseSlug:row.canonical_house_slug,
    signalLabel:row.signal_label,
    representsText:row.represents_text,
    worldText:row.world_text,
    statusText:row.status_text,
    characterImageUrl:row.character_image_url,
    headshotUrl:row.headshot_url,
    artFit:row.art_fit,
    artPosition:row.art_position,
    destination:row.destination,
    startText:row.start_text,
    buildingMessage:row.building_message,
    relationshipStatus:row.relationship_status,
    unlockSource:row.unlock_source,
    memberUnlocked:Number(row.member_unlocked)===1
  }));

  return json({
    ok:true,
    houseSlug,
    member:{awId:member.aw_id,crownName:member.crown_name},
    signals,
    capacity:12
  });
}

function normalizeCheatCode(value){
  return String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,80);
}

async function sha256Hex(value){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function playerCheatCodeResponse(request,env,member){
  if(!(await playerRosterSchemaReady(env))){
    return json({ok:false,message:"CHEAT SYSTEM NOT READY.",code:"PLAYER_ROSTER_SCHEMA_MISSING"},503);
  }

  const body=await request.clone().json().catch(()=>null);
  const houseSlug=String(body?.houseSlug||"the-crowd").trim().toLowerCase();
  const normalized=normalizeCheatCode(body?.code);
  if(normalized.length<3)return json({ok:false,message:"CHEAT CODE REQUIRED."},400);

  if(!(await memberHasHouse(env.CROWN_DB,Number(member.id),houseSlug))){
    return json({ok:false,message:"HOUSE ACCESS REQUIRED."},403);
  }

  const codeHash=await sha256Hex(normalized);
  const cheat=await env.CROWN_DB.prepare(`
    SELECT c.id,c.house_slug,c.signal_slug,c.label,c.max_redemptions,c.expires_at,
           s.display_name
    FROM player_cheat_codes c
    JOIN player_signals s ON s.signal_slug=c.signal_slug AND s.active=1
    WHERE c.code_hash=? AND c.house_slug=? AND c.active=1
      AND (c.expires_at IS NULL OR datetime(c.expires_at)>datetime('now'))
    LIMIT 1
  `).bind(codeHash,houseSlug).first();

  if(!cheat)return json({ok:false,message:"CHEAT CODE // NO SIGNAL FOUND."},404);

  const existing=await env.CROWN_DB.prepare(
    "SELECT 1 AS ok FROM player_cheat_redemptions WHERE cheat_code_id=? AND member_id=? LIMIT 1"
  ).bind(cheat.id,Number(member.id)).first();

  if(!existing&&cheat.max_redemptions!==null){
    const used=await env.CROWN_DB.prepare(
      "SELECT COUNT(*) AS n FROM player_cheat_redemptions WHERE cheat_code_id=?"
    ).bind(cheat.id).first();
    if(Number(used?.n||0)>=Number(cheat.max_redemptions)){
      return json({ok:false,message:"CHEAT CODE // SIGNAL EXPIRED."},410);
    }
  }

  await env.CROWN_DB.batch([
    env.CROWN_DB.prepare(`
      INSERT OR IGNORE INTO player_cheat_redemptions(cheat_code_id,member_id,redeemed_at)
      VALUES(?,?,datetime('now'))
    `).bind(cheat.id,Number(member.id)),
    env.CROWN_DB.prepare(`
      INSERT INTO member_signal_unlocks(
        member_id,house_slug,signal_slug,unlock_source,source_ref,unlocked_at,active
      ) VALUES(?,?,?,'cheat-code',?,datetime('now'),1)
      ON CONFLICT(member_id,house_slug,signal_slug)
      DO UPDATE SET unlock_source='cheat-code',source_ref=excluded.source_ref,active=1
    `).bind(Number(member.id),houseSlug,cheat.signal_slug,String(cheat.id)),
    env.CROWN_DB.prepare(`
      INSERT INTO access_events(member_id,event_type,house_slug,created_at)
      VALUES(?,'player_cheat_signal_unlocked',?,datetime('now'))
    `).bind(Number(member.id),houseSlug)
  ]);

  return json({
    ok:true,
    message:"CHEAT CODE ACCEPTED // SIGNAL UNLOCKED.",
    houseSlug,
    signalSlug:cheat.signal_slug,
    displayName:cheat.display_name
  });
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

async function archiveSocialSchemaReady(env){
  if(!env?.CROWN_DB)return false;
  const row=await env.CROWN_DB.prepare(
    "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('archive_media_public_meta','media_likes','media_comments')"
  ).first();
  return Number(row?.n||0)===3;
}

function cleanArchiveText(value,max){
  return String(value||"").replace(/\s+/g," ").trim().slice(0,max);
}

async function archiveFileContext(env,mediaId){
  return env.CROWN_DB.prepare(`
    SELECT m.id,m.title,m.media_type,m.active,i.file_code,c.collection_slug
    FROM artist_media m
    JOIN player_media_collection_items i ON i.media_id=m.id AND i.active=1
    JOIN player_media_collections c ON c.id=i.collection_id AND c.active=1
    WHERE m.id=? AND m.active=1 AND c.collection_slug='tha-x-filez'
    LIMIT 1
  `).bind(Number(mediaId)).first();
}

async function archiveSocialData(env,mediaId,memberId=null){
  const [likesRow,commentsResult,myLike]=await Promise.all([
    env.CROWN_DB.prepare("SELECT COUNT(*) AS n FROM media_likes WHERE media_id=?").bind(mediaId).first(),
    env.CROWN_DB.prepare(`
      SELECT c.id,c.body,c.created_at,m.crown_name
      FROM media_comments c
      JOIN members m ON m.id=c.member_id
      WHERE c.media_id=? AND c.status='visible'
      ORDER BY c.created_at DESC,c.id DESC
      LIMIT 100
    `).bind(mediaId).all(),
    memberId
      ?env.CROWN_DB.prepare("SELECT 1 AS ok FROM media_likes WHERE media_id=? AND member_id=? LIMIT 1").bind(mediaId,memberId).first()
      :Promise.resolve(null)
  ]);

  return {
    likeCount:Number(likesRow?.n||0),
    commentCount:Number(commentsResult?.results?.length||0),
    likedByMe:!!myLike?.ok,
    comments:(commentsResult?.results||[]).map(row=>({
      id:Number(row.id),
      body:row.body,
      createdAt:row.created_at,
      crownName:row.crown_name
    }))
  };
}

async function archiveSocialPublicResponse(request,env){
  if(!(await archiveSocialSchemaReady(env))){
    return json({ok:false,message:"ARCHIVE SOCIAL LAYER NOT READY.",code:"ARCHIVE_SOCIAL_SCHEMA_MISSING"},503);
  }
  const mediaId=Number(new URL(request.url).searchParams.get("mediaId"));
  if(!Number.isInteger(mediaId)||mediaId<1)return json({ok:false,message:"MEDIA REQUIRED."},400);
  const decision=await archiveMediaDecision(env,mediaId,{publicOnly:true});
  if(!decision.authorized)return json({ok:false,message:"MEDIA NOT AVAILABLE."},404);
  return json({ok:true,mediaId,...await archiveSocialData(env,mediaId,null)});
}

async function archiveSocialCrownResponse(request,env,member){
  if(!(await archiveSocialSchemaReady(env))){
    return json({ok:false,message:"ARCHIVE SOCIAL LAYER NOT READY.",code:"ARCHIVE_SOCIAL_SCHEMA_MISSING"},503);
  }
  const mediaId=Number(new URL(request.url).searchParams.get("mediaId"));
  if(!Number.isInteger(mediaId)||mediaId<1)return json({ok:false,message:"MEDIA REQUIRED."},400);
  const decision=await playerEngagementAuthorized(request,env,member);
  if(decision.authorized!==true)return json({ok:false,message:"MEDIA NOT AVAILABLE."},404);
  return json({ok:true,mediaId,...await archiveSocialData(env,mediaId,Number(member.id))});
}

async function archiveLikeToggle(request,env,member){
  if(!(await archiveSocialSchemaReady(env))){
    return json({ok:false,message:"ARCHIVE SOCIAL LAYER NOT READY.",code:"ARCHIVE_SOCIAL_SCHEMA_MISSING"},503);
  }
  const body=await request.clone().json().catch(()=>null);
  const mediaId=Number(body?.mediaId);
  if(!Number.isInteger(mediaId)||mediaId<1)return json({ok:false,message:"MEDIA REQUIRED."},400);

  const probe=new Request(new URL("/api/crown/player/comments?mediaId="+mediaId,request.url),{
    method:"GET",
    headers:request.headers
  });
  const decision=await playerEngagementAuthorized(probe,env,member);
  if(decision.authorized!==true)return json({ok:false,message:"MEDIA NOT AVAILABLE."},404);

  const existing=await env.CROWN_DB.prepare(
    "SELECT 1 AS ok FROM media_likes WHERE media_id=? AND member_id=? LIMIT 1"
  ).bind(mediaId,Number(member.id)).first();

  if(existing?.ok){
    await env.CROWN_DB.prepare("DELETE FROM media_likes WHERE media_id=? AND member_id=?")
      .bind(mediaId,Number(member.id)).run();
  }else{
    await env.CROWN_DB.prepare(
      "INSERT OR IGNORE INTO media_likes(media_id,member_id,created_at) VALUES(?,?,datetime('now'))"
    ).bind(mediaId,Number(member.id)).run();
  }

  const count=await env.CROWN_DB.prepare("SELECT COUNT(*) AS n FROM media_likes WHERE media_id=?")
    .bind(mediaId).first();

  return json({ok:true,mediaId,liked:!existing?.ok,likeCount:Number(count?.n||0)});
}

async function archiveAddComment(request,env,member){
  if(!(await archiveSocialSchemaReady(env))){
    return json({ok:false,message:"ARCHIVE SOCIAL LAYER NOT READY.",code:"ARCHIVE_SOCIAL_SCHEMA_MISSING"},503);
  }
  const body=await request.clone().json().catch(()=>null);
  const mediaId=Number(body?.mediaId);
  const comment=cleanArchiveText(body?.body,1000);
  if(!Number.isInteger(mediaId)||mediaId<1||!comment)return json({ok:false,message:"COMMENT REQUIRED."},400);

  const probe=new Request(new URL("/api/crown/player/comments?mediaId="+mediaId,request.url),{
    method:"GET",
    headers:request.headers
  });
  const decision=await playerEngagementAuthorized(probe,env,member);
  if(decision.authorized!==true)return json({ok:false,message:"MEDIA NOT AVAILABLE."},404);

  await env.CROWN_DB.prepare(`
    INSERT INTO media_comments(media_id,member_id,body,status,created_at,updated_at)
    VALUES(?, ?, ?, 'visible', datetime('now'), datetime('now'))
  `).bind(mediaId,Number(member.id),comment).run();

  return json({ok:true,message:"COMMENT POSTED.",mediaId},201);
}

async function archiveAdminPublicMeta(request,env,member){
  const capability=await houseAdminCapabilities(env.CROWN_DB,Number(member.id),"the-crowd");
  if(!capability.canEditPublicMeta){
    return json({ok:false,message:"THE CROWD MEDIA ADMIN ACCESS REQUIRED."},403);
  }
  if(!(await archiveSocialSchemaReady(env))){
    return json({ok:false,message:"ARCHIVE SOCIAL LAYER NOT READY.",code:"ARCHIVE_SOCIAL_SCHEMA_MISSING"},503);
  }

  const body=await request.clone().json().catch(()=>null);
  const mediaId=Number(body?.mediaId);
  const publicTitle=cleanArchiveText(body?.publicTitle,180);
  const publicCaption=cleanArchiveText(body?.publicCaption,1200);

  if(!Number.isInteger(mediaId)||mediaId<1)return json({ok:false,message:"MEDIA REQUIRED."},400);
  const file=await archiveFileContext(env,mediaId);
  if(!file)return json({ok:false,message:"ARCHIVE FILE NOT FOUND."},404);

  if(!publicTitle&&!publicCaption){
    await env.CROWN_DB.prepare("DELETE FROM archive_media_public_meta WHERE media_id=?").bind(mediaId).run();
    return json({
      ok:true,
      mediaId,
      publicTitle:null,
      publicCaption:null,
      displayTitle:file.title,
      message:"PUBLIC INFO RESET TO SOURCE DEFAULT."
    });
  }

  await env.CROWN_DB.prepare(`
    INSERT INTO archive_media_public_meta(media_id,public_title,public_caption,updated_by_member_id,updated_at)
    VALUES(?,?,?,?,datetime('now'))
    ON CONFLICT(media_id) DO UPDATE SET
      public_title=excluded.public_title,
      public_caption=excluded.public_caption,
      updated_by_member_id=excluded.updated_by_member_id,
      updated_at=datetime('now')
  `).bind(mediaId,publicTitle||null,publicCaption||null,Number(member.id)).run();

  await env.CROWN_DB.prepare(`
    INSERT INTO access_events(member_id,event_type,house_slug,created_at)
    VALUES(?,'archive_public_meta_updated','the-crowd',datetime('now'))
  `).bind(Number(member.id)).run();

  return json({
    ok:true,
    mediaId,
    publicTitle:publicTitle||null,
    publicCaption:publicCaption||null,
    displayTitle:publicTitle||file.title,
    message:"PUBLIC ARCHIVE INFO UPDATED.",
    adminRole:capability.role
  });
}

async function archiveMediaDecision(env,mediaId,{
  crownMemberId=null,
  crownAuthenticated=false,
  publicOnly=false
}={}){
  const media=await env.CROWN_DB.prepare(`
    SELECT
      m.id,m.title,m.media_type,m.provider,m.external_id,m.canonical_url,m.thumbnail_url,
      COALESCE(p.access_state,'unknown') AS access_state,
      p.house_slug,p.unlock_slug,COALESCE(p.teaser_mode,'concealed') AS teaser_mode
    FROM artist_media m
    LEFT JOIN media_access_policy p ON p.media_id=m.id AND p.active=1
    WHERE m.id=? AND m.active=1
    LIMIT 1
  `).bind(Number(mediaId)).first();

  if(!media)return {authorized:false,media:null};

  if(publicOnly){
    if(String(media.access_state||"").toLowerCase()!=="public"){
      return {authorized:false,media:null};
    }
    return {authorized:true,media};
  }

  const viewer=await buildPlayerViewerContext(env.CROWN_DB,{
    crownMemberId:Number(crownMemberId),
    crownAuthenticated:crownAuthenticated===true
  });
  if(viewer.identityConflict)return {authorized:false,media:null};

  const decision=resolveMediaAccess(media,viewer);
  return {authorized:decision.authorized===true,media:decision.authorized===true?media:null};
}

const X_DROPBOX_SHARED_FOLDER_URL="https://www.dropbox.com/scl/fo/3m0ooipt21spernsy34aa/ANAnGkOcszfg7Pk_IU8G240?rlkey=rditxo7ageg786kr9vaoytljz&dl=0";

function dropboxAppConfigured(env){
  return !!String(env?.DROPBOX_APP_KEY||"").trim()&&!!String(env?.DROPBOX_APP_SECRET||"").trim();
}

function dropboxSharedPath(media){
  const title=String(media?.title||"").trim();
  return title?"/"+title:null;
}

async function dropboxSharedFileResponse(request,env,media){
  if(!dropboxAppConfigured(env))return null;

  const path=dropboxSharedPath(media);
  if(!path)return null;

  const key=String(env.DROPBOX_APP_KEY).trim();
  const secret=String(env.DROPBOX_APP_SECRET).trim();
  const basic=btoa(key+":"+secret);

  const headers=new Headers({
    "authorization":"Basic "+basic,
    "dropbox-api-arg":JSON.stringify({
      url:X_DROPBOX_SHARED_FOLDER_URL,
      path
    })
  });

  const range=request.headers.get("range");
  if(range)headers.set("range",range);

  return fetch("https://content.dropboxapi.com/2/sharing/get_shared_link_file",{
    method:"POST",
    headers
  });
}

async function dropboxAppCheck(env){
  if(!dropboxAppConfigured(env))return {ok:false,status:0,stage:"config",detail:"missing"};
  const key=String(env.DROPBOX_APP_KEY).trim();
  const secret=String(env.DROPBOX_APP_SECRET).trim();
  const basic=btoa(key+":"+secret);
  const response=await fetch("https://api.dropboxapi.com/2/check/app",{
    method:"POST",
    headers:{
      "authorization":"Basic "+basic,
      "content-type":"application/json"
    },
    body:JSON.stringify({query:"awe-x-filez"})
  });
  const body=await response.text().catch(()=>"");
  return {
    ok:response.ok,
    status:response.status,
    stage:"auth",
    detail:response.ok?"ok":body.slice(0,220)
  };
}

async function dropboxSharedMetadataCheck(env,title){
  if(!dropboxAppConfigured(env))return {ok:false,status:0,stage:"metadata",detail:"missing"};
  const key=String(env.DROPBOX_APP_KEY).trim();
  const secret=String(env.DROPBOX_APP_SECRET).trim();
  const basic=btoa(key+":"+secret);
  const response=await fetch("https://api.dropboxapi.com/2/sharing/get_shared_link_metadata",{
    method:"POST",
    headers:{
      "authorization":"Basic "+basic,
      "content-type":"application/json"
    },
    body:JSON.stringify({
      url:X_DROPBOX_SHARED_FOLDER_URL,
      path:"/"+String(title||"").trim()
    })
  });
  const body=await response.text().catch(()=>"");
  return {
    ok:response.ok,
    status:response.status,
    stage:"metadata",
    detail:response.ok?"ok":body.slice(0,300)
  };
}

async function dropboxBridgeDiagnostics(request,env){
  const auth=await dropboxAppCheck(env);
  if(!auth.ok)return {configured:dropboxAppConfigured(env),auth,metadata:null,file:null};

  const sample=await env.CROWN_DB.prepare(
    "SELECT id,title,media_type,provider,external_id,canonical_url,thumbnail_url FROM artist_media WHERE provider='dropbox' AND active=1 ORDER BY id LIMIT 1"
  ).first();

  if(!sample)return {
    configured:true,
    auth,
    metadata:{ok:false,status:0,stage:"metadata",detail:"no-dropbox-record"},
    file:null
  };

  const metadata=await dropboxSharedMetadataCheck(env,sample.title);
  if(!metadata.ok)return {
    configured:true,
    auth,
    metadata,
    file:null,
    sample:{id:sample.id,title:sample.title}
  };

  const probeRequest=new Request(request.url,{headers:{range:"bytes=0-0"}});
  const response=await dropboxSharedFileResponse(probeRequest,env,sample);
  if(!response)return {
    configured:true,
    auth,
    metadata,
    file:{ok:false,status:0,stage:"file",detail:"no-response"},
    sample:{id:sample.id,title:sample.title}
  };

  const bodyText=response.ok||response.status===206
    ?""
    :await response.clone().text().catch(()=>"");

  return {
    configured:true,
    auth,
    metadata,
    file:{
      ok:response.ok||response.status===206,
      status:response.status,
      stage:"file",
      contentType:response.headers.get("content-type")||null,
      contentRange:response.headers.get("content-range")||null,
      detail:(response.ok||response.status===206)?"ok":bodyText.slice(0,300)
    },
    sample:{id:sample.id,title:sample.title}
  };
}

function driveThumbnailUrl(media){
  if(media?.thumbnail_url){
    try{
      const url=new URL(media.thumbnail_url);
      if(url.hostname==="drive.google.com")return url.toString();
    }catch{}
  }
  const id=String(media?.external_id||"").trim();
  return id?"https://drive.google.com/thumbnail?id="+encodeURIComponent(id)+"&sz=w1600":null;
}

function driveDownloadUrl(media){
  const id=String(media?.external_id||"").trim();
  return id?"https://drive.usercontent.google.com/download?id="+encodeURIComponent(id)+"&export=download&confirm=t":null;
}

function archiveMimeType(media){
  const title=String(media?.title||"").toLowerCase();
  const ext=title.includes(".")?title.split(".").pop():"";
  const byExt={
    jpg:"image/jpeg",
    jpeg:"image/jpeg",
    png:"image/png",
    webp:"image/webp",
    gif:"image/gif",
    avif:"image/avif",
    heic:"image/heic",
    heif:"image/heif",
    mp4:"video/mp4",
    mov:"video/quicktime",
    m4v:"video/x-m4v",
    webm:"video/webm"
  };
  if(byExt[ext])return byExt[ext];

  const type=String(media?.media_type||"").toLowerCase();
  if(["photo","portrait","image","artwork"].includes(type))return "image/jpeg";
  if(["video","clip","interview","bts","behind-the-scenes","promo"].includes(type))return "video/mp4";
  return null;
}

async function archiveMediaProxyResponse(request,env,{
  crownMemberId=null,
  crownAuthenticated=false,
  publicOnly=false
}={}){
  const url=new URL(request.url);
  const mediaId=Number(url.searchParams.get("mediaId"));
  const mode=url.searchParams.get("mode")==="thumbnail"?"thumbnail":"preview";
  if(!Number.isInteger(mediaId)||mediaId<1){
    return json({ok:false,message:"INVALID ARCHIVE FILE."},400);
  }

  const decision=await archiveMediaDecision(env,mediaId,{
    crownMemberId,
    crownAuthenticated,
    publicOnly
  });
  if(!decision.authorized||!decision.media){
    return json({ok:false,message:"ARCHIVE FILE NOT AVAILABLE."},404);
  }

  const media=decision.media;
  const type=String(media.media_type||"").toLowerCase();
  let upstream=null;

  if(media.provider==="google-drive"){
    if(mode==="thumbnail"||["photo","portrait","image","artwork"].includes(type)){
      upstream=driveThumbnailUrl(media);
    }else if(["video","clip","interview","bts","behind-the-scenes","promo"].includes(type)){
      upstream=driveDownloadUrl(media);
    }
  }else if(media.provider==="dropbox"){
    if(mode==="thumbnail"){
      return new Response(null,{status:204,headers:{"cache-control":"private, no-store"}});
    }
    const dropboxResponse=await dropboxSharedFileResponse(request,env,media);
    if(!dropboxResponse){
      return json({ok:false,message:"DROPBOX ARCHIVE BRIDGE NOT CONFIGURED.",code:"DROPBOX_BRIDGE_CONFIG_MISSING"},503);
    }
    if(!dropboxResponse.ok&&dropboxResponse.status!==206){
      return json({ok:false,message:"ARCHIVE PREVIEW TEMPORARILY UNAVAILABLE.",code:"DROPBOX_BRIDGE_UPSTREAM_FAILURE"},502);
    }

    const outHeaders=new Headers();
    for(const name of ["content-length","content-range","accept-ranges","etag","last-modified"]){
      const value=dropboxResponse.headers.get(name);
      if(value)outHeaders.set(name,value);
    }
    const explicitType=archiveMimeType(media);
    const upstreamType=dropboxResponse.headers.get("content-type");
    if(explicitType)outHeaders.set("content-type",explicitType);
    else if(upstreamType)outHeaders.set("content-type",upstreamType);
    outHeaders.set("content-disposition","inline");
    outHeaders.set("cache-control","private, no-store");
    outHeaders.set("x-content-type-options","nosniff");
    return new Response(dropboxResponse.body,{status:dropboxResponse.status,headers:outHeaders});
  }

  if(!upstream){
    return json({ok:false,message:"ARCHIVE PREVIEW NOT AVAILABLE."},404);
  }

  const headers=new Headers();
  const range=request.headers.get("range");
  if(range)headers.set("range",range);

  const remote=await fetch(upstream,{
    method:"GET",
    headers,
    redirect:"follow"
  });

  if(!remote.ok&&remote.status!==206){
    return json({ok:false,message:"ARCHIVE PREVIEW TEMPORARILY UNAVAILABLE."},502);
  }

  const outHeaders=new Headers();
  for(const name of ["content-type","content-length","content-range","accept-ranges","etag","last-modified"]){
    const value=remote.headers.get(name);
    if(value)outHeaders.set(name,value);
  }
  outHeaders.set("cache-control","private, no-store");
  outHeaders.set("x-content-type-options","nosniff");

  return new Response(remote.body,{status:remote.status,headers:outHeaders});
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

    if(url.pathname==="/api/archivez/media"&&request.method==="GET"){
      try{
        const schema=await playerAccessSchema(env);
        if(!schema.ready)return json({ok:false,message:"PUBLIC ARCHIVEZ DATA NOT READY."},503);
        return archiveMediaProxyResponse(request,env,{publicOnly:true});
      }catch{
        return json({ok:false,message:"PUBLIC ARCHIVE PREVIEW TEMPORARILY UNAVAILABLE."},503);
      }
    }

    if(url.pathname==="/api/archivez/social"&&request.method==="GET"){
      try{
        return archiveSocialPublicResponse(request,env);
      }catch{
        return json({ok:false,message:"ARCHIVE SOCIAL TEMPORARILY UNAVAILABLE."},503);
      }
    }

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

    if(url.pathname==="/api/crown/archivez/social"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;
      try{
        return archiveSocialCrownResponse(request,env,identity.member);
      }catch{
        return json({ok:false,message:"ARCHIVE SOCIAL TEMPORARILY UNAVAILABLE."},503);
      }
    }

    if(url.pathname==="/api/crown/archivez/like"&&request.method==="POST"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;
      try{
        return archiveLikeToggle(request,env,identity.member);
      }catch{
        return json({ok:false,message:"LIKE TEMPORARILY UNAVAILABLE."},503);
      }
    }

    if(url.pathname==="/api/crown/archivez/comments"&&request.method==="POST"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;
      try{
        return archiveAddComment(request,env,identity.member);
      }catch{
        return json({ok:false,message:"COMMENTS TEMPORARILY UNAVAILABLE."},503);
      }
    }

    if(url.pathname==="/api/crown/archivez/admin/public-meta"&&request.method==="POST"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;
      try{
        return archiveAdminPublicMeta(request,env,identity.member);
      }catch{
        return json({ok:false,message:"PUBLIC INFO UPDATE TEMPORARILY UNAVAILABLE."},503);
      }
    }

    if(url.pathname==="/api/crown/archivez/dropbox-health"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;
      if(identity.member.aw_id!=="AWE-000001")return json({ok:false,message:"OWNER ACCESS REQUIRED."},403);
      try{
        const diagnostic=await dropboxBridgeDiagnostics(request,env);
        return json({
          ok:true,
          mode:"DROPBOX APP AUTH // SHARED LINK FILE API",
          ...diagnostic
        });
      }catch{
        return json({
          ok:false,
          configured:dropboxAppConfigured(env),
          message:"DROPBOX BRIDGE DIAGNOSTIC FAILED."
        },503);
      }
    }

    if(url.pathname==="/api/crown/archivez/media"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;
      try{
        const schema=await playerAccessSchema(env);
        if(!schema.ready)return json({ok:false,message:"ARCHIVEZ DATA NOT READY."},503);
        return archiveMediaProxyResponse(request,env,{
          crownMemberId:Number(identity.member.id),
          crownAuthenticated:true,
          publicOnly:false
        });
      }catch{
        return json({ok:false,message:"ARCHIVE PREVIEW TEMPORARILY UNAVAILABLE."},503);
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

    if(url.pathname==="/api/crown/player/roster"&&request.method==="GET"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;
      try{
        return playerRosterResponse(request,env,identity.member);
      }catch{
        return json({ok:false,message:"PLAYER ROSTER TEMPORARILY UNAVAILABLE.",code:"PLAYER_ROSTER_RUNTIME_FAILURE"},503);
      }
    }

    if(url.pathname==="/api/crown/player/cheat"&&request.method==="POST"){
      const identity=await crownIdentity(request,env);
      if(!identity.ok)return identity.response;
      try{
        return playerCheatCodeResponse(request,env,identity.member);
      }catch{
        return json({ok:false,message:"CHEAT SYSTEM TEMPORARILY UNAVAILABLE.",code:"PLAYER_CHEAT_RUNTIME_FAILURE"},503);
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
