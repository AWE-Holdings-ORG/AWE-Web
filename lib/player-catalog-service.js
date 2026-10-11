import {resolveAndSanitizeMedia} from "./player-access.js";

function cleanArtistSlug(value){
  return String(value||"").trim().toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,100);
}

function cleanCollectionSlug(value){
  return String(value||"").trim().toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,100);
}

async function resultRows(stmt){
  const result=await stmt.all();
  return result?.results||[];
}

async function engagementMap(db,artistId){
  const [views,comments]=await Promise.all([
    resultRows(db.prepare(`
      SELECT v.media_id,COUNT(*) AS n
      FROM media_views v
      JOIN artist_media m ON m.id=v.media_id
      WHERE m.artist_id=?
      GROUP BY v.media_id
    `).bind(artistId)),
    resultRows(db.prepare(`
      SELECT c.media_id,COUNT(*) AS n
      FROM media_comments c
      JOIN artist_media m ON m.id=c.media_id
      WHERE m.artist_id=? AND c.status='visible'
      GROUP BY c.media_id
    `).bind(artistId))
  ]);

  const map=new Map();
  for(const row of views){
    map.set(Number(row.media_id),{view_count:Number(row.n||0),comment_count:0});
  }
  for(const row of comments){
    const id=Number(row.media_id);
    const current=map.get(id)||{view_count:0,comment_count:0};
    current.comment_count=Number(row.n||0);
    map.set(id,current);
  }
  return map;
}

async function collectionSchemaReady(db){
  try{
    const row=await db.prepare(`
      SELECT COUNT(*) AS n
      FROM sqlite_master
      WHERE type='table'
        AND name IN ('player_media_collections','player_media_collection_items')
    `).first();
    return Number(row?.n||0)===2;
  }catch{
    return false;
  }
}

async function collectionContextMap(db,artistId){
  const rows=await resultRows(db.prepare(`
    SELECT i.media_id,i.file_code,c.collection_slug,c.display_name AS collection_name
    FROM player_media_collection_items i
    JOIN player_media_collections c ON c.id=i.collection_id
    JOIN artist_media m ON m.id=i.media_id
    WHERE m.artist_id=? AND i.active=1 AND i.is_primary=1 AND c.active=1
  `).bind(artistId));
  return new Map(rows.map(row=>[Number(row.media_id),row]));
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

async function eventContextMap(db,artistId){
  const events=await resultRows(db.prepare(`
    SELECT
      em.media_id,e.id AS event_id,e.event_slug,e.display_name,e.event_date,e.time_text,
      e.platform,e.organizer,e.rights_status,e.evidence_status,em.relation_role,em.sort_order
    FROM player_event_media em
    JOIN player_events e ON e.id=em.event_id
    JOIN artist_media m ON m.id=em.media_id
    WHERE m.artist_id=? AND e.active=1
    ORDER BY em.media_id,em.sort_order,e.event_date,e.id
  `).bind(artistId));

  if(!events.length)return new Map();

  const [artifacts,spaces]=await Promise.all([
    resultRows(db.prepare(`
      SELECT a.event_id,a.media_id,a.artifact_type,a.provider,a.source_url,a.title,a.rights_status
      FROM player_event_artifacts a
      WHERE a.active=1
        AND a.event_id IN (
          SELECT DISTINCT em.event_id
          FROM player_event_media em
          JOIN artist_media m ON m.id=em.media_id
          WHERE m.artist_id=?
        )
      ORDER BY a.id
    `).bind(artistId)),
    resultRows(db.prepare(`
      SELECT s.event_id,s.space_url,s.display_time_text,s.host_handle,s.replay_status
      FROM player_event_spaces s
      WHERE s.active=1
        AND s.space_url IS NOT NULL
        AND TRIM(s.space_url)<>''
        AND s.event_id IN (
          SELECT DISTINCT em.event_id
          FROM player_event_media em
          JOIN artist_media m ON m.id=em.media_id
          WHERE m.artist_id=?
        )
      ORDER BY s.id
    `).bind(artistId))
  ]);

  const artifactsByEvent=new Map();
  for(const row of artifacts){
    const id=Number(row.event_id);
    if(!artifactsByEvent.has(id))artifactsByEvent.set(id,[]);
    artifactsByEvent.get(id).push(row);
  }

  const spacesByEvent=new Map();
  for(const row of spaces){
    const id=Number(row.event_id);
    if(!spacesByEvent.has(id))spacesByEvent.set(id,[]);
    spacesByEvent.get(id).push(row);
  }

  const map=new Map();
  for(const event of events){
    const mediaId=Number(event.media_id);
    if(map.has(mediaId))continue;
    const eventId=Number(event.event_id);
    map.set(mediaId,{
      event_slug:event.event_slug,
      display_name:event.display_name,
      event_date:event.event_date,
      time_text:event.time_text,
      platform:event.platform,
      organizer:event.organizer,
      rights_status:event.rights_status,
      evidence_status:event.evidence_status,
      relation_role:event.relation_role,
      artifacts:(artifactsByEvent.get(eventId)||[])
        .filter(a=>a.media_id==null||Number(a.media_id)===mediaId)
        .map(({event_id,media_id,...a})=>a),
      spaces:(spacesByEvent.get(eventId)||[])
        .map(({event_id,...s})=>s)
    });
  }
  return map;
}

/**
 * Read one artist catalog and apply SCRYPT-CROWN-002 before anything leaves
 * this service boundary. Missing policies fail closed as concealed/unknown.
 */
export async function buildPlayerCatalog(db,{
  artistSlug="x-tha-god",
  viewer={},
  surface="crown",
  collectionSlug=null,
  excludeCollectionSlugs=[]
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

  const hasCollections=await collectionSchemaReady(db);
  const collections=hasCollections?await collectionContextMap(db,artist.id):new Map();
  const prepared=media.map(item=>{
    const collection=collections.get(Number(item.id));
    return {
      ...item,
      collection_slug:collection?.collection_slug||null,
      collection_name:collection?.collection_name||null,
      collection_file_code:collection?.file_code||null,
      access_state:item.access_state||"unknown",
      teaser_mode:item.teaser_mode||"concealed"
    };
  });

  const excluded=new Set(
    (Array.isArray(excludeCollectionSlugs)?excludeCollectionSlugs:[])
      .map(cleanCollectionSlug)
      .filter(Boolean)
  );

  const scoped=(collectionSlug
    ? prepared.filter(item=>String(item.collection_slug||"").toLowerCase()===cleanCollectionSlug(collectionSlug))
    : prepared
  ).filter(item=>!excluded.has(String(item.collection_slug||"").toLowerCase()));

  const surfaceFiltered=surface==="cypherz"
    ? scoped.filter(item=>Number(item.cypherz_visible)===1)
    : surface==="public"
      ? scoped.filter(item=>String(item.access_state).toLowerCase()==="public")
      : scoped;

  const safe=resolveAndSanitizeMedia(surfaceFiltered,viewer);
  const hasEventContext=await eventSchemaReady(db);
  const [engagements,events]=await Promise.all([
    engagementMap(db,artist.id),
    hasEventContext?eventContextMap(db,artist.id):Promise.resolve(new Map())
  ]);

  for(const item of safe){
    if(item.authorized){
      Object.assign(item,engagements.get(Number(item.id))||{view_count:0,comment_count:0});
      item.event=events.get(Number(item.id))||null;
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
