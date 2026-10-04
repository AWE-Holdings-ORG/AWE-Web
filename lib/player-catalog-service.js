import {resolveAndSanitizeMedia} from "./player-access.js";

function cleanArtistSlug(value){
  return String(value||"").trim().toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,100);
}

async function resultRows(stmt){
  const result=await stmt.all();
  return result?.results||[];
}

async function engagement(db,mediaId){
  const [views,comments]=await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM media_views WHERE media_id=?").bind(mediaId).first(),
    db.prepare("SELECT COUNT(*) AS n FROM media_comments WHERE media_id=? AND status='visible'").bind(mediaId).first()
  ]);
  return {
    view_count:Number(views?.n||0),
    comment_count:Number(comments?.n||0)
  };
}

async function eventSchemaReady(db){
  try{
    const row=await db.prepare(`
      SELECT COUNT(*) AS n
      FROM sqlite_master
      WHERE type='table'
        AND name IN ('player_events','player_event_media','player_event_artifacts','player_event_spaces')
    `).first();
    return Number(row?.n||0)===4;
  }catch{
    return false;
  }
}

async function eventContext(db,mediaId){
  const event=await db.prepare(`
    SELECT
      e.id,e.event_slug,e.display_name,e.event_date,e.time_text,e.platform,
      e.organizer,e.rights_status,e.evidence_status,em.relation_role
    FROM player_event_media em
    JOIN player_events e ON e.id=em.event_id
    WHERE em.media_id=? AND e.active=1
    ORDER BY em.sort_order,e.event_date,e.id
    LIMIT 1
  `).bind(mediaId).first();

  if(!event)return null;

  const [artifacts,spaces]=await Promise.all([
    resultRows(db.prepare(`
      SELECT artifact_type,provider,source_url,title,rights_status
      FROM player_event_artifacts
      WHERE event_id=? AND active=1 AND (media_id IS NULL OR media_id=?)
      ORDER BY id
    `).bind(event.id,mediaId)),
    resultRows(db.prepare(`
      SELECT space_url,display_time_text,host_handle,replay_status
      FROM player_event_spaces
      WHERE event_id=? AND active=1 AND space_url IS NOT NULL AND TRIM(space_url)<>''
      ORDER BY id
    `).bind(event.id))
  ]);

  return {
    event_slug:event.event_slug,
    display_name:event.display_name,
    event_date:event.event_date,
    time_text:event.time_text,
    platform:event.platform,
    organizer:event.organizer,
    rights_status:event.rights_status,
    evidence_status:event.evidence_status,
    relation_role:event.relation_role,
    artifacts,
    spaces
  };
}

/**
 * Read one artist catalog and apply SCRYPT-CROWN-002 before anything leaves
 * this service boundary. Missing policies fail closed as concealed/unknown.
 */
export async function buildPlayerCatalog(db,{
  artistSlug="x-tha-god",
  viewer={},
  surface="crown"
}={}){
  if(!db)throw new Error("PLAYER_DB_REQUIRED");
  const slug=cleanArtistSlug(artistSlug);
  if(!slug)throw new Error("ARTIST_SLUG_REQUIRED");

  const artist=await db.prepare(
    "SELECT id,artist_slug,display_name,artist_number,status,primary_house_slug,label_house_slug,public_bio FROM artists WHERE artist_slug=? AND status='active' LIMIT 1"
  ).bind(slug).first();

  if(!artist)return null;

  const media=await resultRows(db.prepare(`
    SELECT
      m.id,m.media_type,m.provider,m.external_id,m.canonical_url,m.title,
      m.event_date,m.era_slug,m.sort_order,m.description,m.source_name,
      m.source_url,m.thumbnail_url,m.rights_status,m.duration_seconds,m.published_at,
      p.access_state,p.house_slug,p.unlock_slug,p.teaser_mode,p.cypherz_visible
    FROM artist_media m
    LEFT JOIN media_access_policy p ON p.media_id=m.id AND p.active=1
    WHERE m.artist_id=? AND m.active=1
    ORDER BY m.sort_order,m.event_date,m.id
  `).bind(artist.id));

  const prepared=media.map(item=>({
    ...item,
    access_state:item.access_state||"unknown",
    teaser_mode:item.teaser_mode||"concealed"
  }));

  const surfaceFiltered=surface==="cypherz"
    ? prepared.filter(item=>Number(item.cypherz_visible)===1)
    : prepared;

  const safe=resolveAndSanitizeMedia(surfaceFiltered,viewer);
  const hasEventContext=await eventSchemaReady(db);

  for(const item of safe){
    if(item.authorized){
      Object.assign(item,await engagement(db,Number(item.id)));
      item.event=hasEventContext?await eventContext(db,Number(item.id)):null;
    }else{
      item.view_count=null;
      item.comment_count=null;
      item.event=null;
    }
    delete item.cypherz_visible;
  }

  return {
    artist,
    media:safe,
    access:{
      surface,
      crownAuthenticated:viewer?.crownAuthenticated===true,
      linked:viewer?.linked===true,
      houses:Array.isArray(viewer?.houseSlugs)?viewer.houseSlugs:[]
    }
  };
}
