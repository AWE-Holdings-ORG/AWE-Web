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

  for(const item of safe){
    if(item.authorized){
      Object.assign(item,await engagement(db,Number(item.id)));
    }else{
      item.view_count=null;
      item.comment_count=null;
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
