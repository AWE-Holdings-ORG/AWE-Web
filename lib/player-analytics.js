const json=(data,status=200)=>new Response(JSON.stringify(data),{
  status,
  headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store"
  }
});

const MAX_ACTIVE_MS=12*60*60*1000;
const MAX_DURATION_MS=24*60*60*1000;
const EVENTS=new Set(["start","progress","pause","waiting","stalled","ended","switch","pagehide"]);

function cleanSessionKey(value){
  const key=String(value||"").trim();
  return /^[A-Za-z0-9_-]{12,100}$/.test(key)?key:"";
}

function boundedInt(value,{min=0,max=Number.MAX_SAFE_INTEGER,nullable=false}={}){
  if(nullable&&(value===null||value===undefined||value===""))return null;
  const n=Number(value);
  if(!Number.isFinite(n))return nullable?null:min;
  return Math.min(max,Math.max(min,Math.round(n)));
}

export function completionPct(activeMs,durationMs){
  const active=boundedInt(activeMs,{min:0,max:MAX_ACTIVE_MS});
  const duration=boundedInt(durationMs,{min:1,max:MAX_DURATION_MS,nullable:true});
  if(!duration)return 0;
  return Math.min(100,Math.max(0,(active/duration)*100));
}

export function normalizePlaybackSignal(body={}){
  const mediaId=Number(body.mediaId);
  const sessionKey=cleanSessionKey(body.sessionKey);
  const activeMs=boundedInt(body.activeMs,{min:0,max:MAX_ACTIVE_MS});
  const durationMs=boundedInt(body.durationMs,{min:1,max:MAX_DURATION_MS,nullable:true});
  const event=String(body.event||"progress").trim().toLowerCase();

  if(!Number.isInteger(mediaId)||mediaId<1||!sessionKey||!EVENTS.has(event)){
    return null;
  }

  return {
    mediaId,
    sessionKey,
    activeMs,
    durationMs,
    event,
    completionPct:completionPct(activeMs,durationMs)
  };
}

export async function playerAnalyticsSchemaReady(db){
  if(!db)return false;
  const result=await db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('media_playback_sessions','player_analytics_access')"
  ).all();
  const names=new Set((result?.results||[]).map(row=>row.name));
  return names.has("media_playback_sessions")&&names.has("player_analytics_access");
}

export async function playerAnalyticsAuthorized(db,memberId){
  if(!db||!Number.isInteger(Number(memberId)))return false;
  const row=await db.prepare(
    "SELECT access_level FROM player_analytics_access WHERE member_id=? AND revoked_at IS NULL LIMIT 1"
  ).bind(Number(memberId)).first();
  return row?.access_level==="viewer"||row?.access_level==="operator";
}

export async function recordPlaybackSignal(request,env,{memberId}={}){
  if(!env?.CROWN_DB)return json({ok:false,message:"PLAYER ANALYTICS UNAVAILABLE."},503);

  const body=await request.json().catch(()=>null);
  const signal=normalizePlaybackSignal(body||{});
  if(!signal)return json({ok:false,message:"INVALID PLAYBACK SIGNAL."},400);

  const existing=await env.CROWN_DB.prepare(
    "SELECT crown_member_id FROM media_playback_sessions WHERE media_id=? AND session_key=? LIMIT 1"
  ).bind(signal.mediaId,signal.sessionKey).first();

  if(existing?.crown_member_id!=null&&Number(existing.crown_member_id)!==Number(memberId)){
    return json({ok:false,message:"PLAYBACK SESSION CONFLICT."},409);
  }

  const endedAt=signal.event==="ended"?"datetime('now')":"NULL";
  await env.CROWN_DB.prepare(`
    INSERT INTO media_playback_sessions(
      media_id,crown_member_id,session_key,first_played_at,last_signal_at,
      active_ms,duration_ms,completion_pct,ended_at
    )
    VALUES(?,?,?,datetime('now'),datetime('now'),?,?,?,${endedAt})
    ON CONFLICT(media_id,session_key) DO UPDATE SET
      crown_member_id=COALESCE(media_playback_sessions.crown_member_id,excluded.crown_member_id),
      last_signal_at=datetime('now'),
      active_ms=MAX(media_playback_sessions.active_ms,excluded.active_ms),
      duration_ms=CASE
        WHEN excluded.duration_ms IS NOT NULL THEN excluded.duration_ms
        ELSE media_playback_sessions.duration_ms
      END,
      completion_pct=MAX(media_playback_sessions.completion_pct,excluded.completion_pct),
      ended_at=CASE
        WHEN excluded.ended_at IS NOT NULL THEN excluded.ended_at
        ELSE media_playback_sessions.ended_at
      END
  `).bind(
    signal.mediaId,
    Number(memberId)||null,
    signal.sessionKey,
    signal.activeMs,
    signal.durationMs,
    signal.completionPct
  ).run();

  const row=await env.CROWN_DB.prepare(`
    SELECT active_ms,duration_ms,completion_pct,first_played_at,last_signal_at,ended_at
    FROM media_playback_sessions
    WHERE media_id=? AND session_key=?
    LIMIT 1
  `).bind(signal.mediaId,signal.sessionKey).first();

  return json({
    ok:true,
    mediaId:signal.mediaId,
    activeMs:Number(row?.active_ms||0),
    durationMs:row?.duration_ms==null?null:Number(row.duration_ms),
    completionPct:Number(row?.completion_pct||0)
  });
}

function rate(n,d){
  return d>0?Number(((n/d)*100).toFixed(1)):0;
}

function seconds(ms){
  return Number((Number(ms||0)/1000).toFixed(1));
}

function hours(ms){
  return Number((Number(ms||0)/3600000).toFixed(2));
}

export async function playerAnalyticsResponse(request,env){
  if(!env?.CROWN_DB)return json({ok:false,message:"PLAYER ANALYTICS UNAVAILABLE."},503);

  const url=new URL(request.url);
  const artistSlug=String(url.searchParams.get("artist")||"x-tha-god")
    .trim().toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,100);
  const days=Math.min(365,Math.max(1,Number.parseInt(url.searchParams.get("days")||"30",10)||30));
  const cutoff=new Date(Date.now()-days*86400000).toISOString();

  const artist=await env.CROWN_DB.prepare(
    "SELECT id,artist_slug,display_name,artist_number FROM artists WHERE artist_slug=? AND status='active' LIMIT 1"
  ).bind(artistSlug).first();

  if(!artist)return json({ok:false,message:"ARTIST SIGNAL NOT FOUND."},404);

  const playback=(await env.CROWN_DB.prepare(`
    SELECT
      m.id,m.title,m.media_type,m.sort_order,
      COUNT(ps.id) AS play_starts,
      COALESCE(SUM(ps.active_ms),0) AS active_ms,
      COALESCE(AVG(ps.active_ms),0) AS avg_active_ms,
      COALESCE(AVG(CASE WHEN ps.duration_ms IS NOT NULL THEN ps.completion_pct END),0) AS avg_completion_pct,
      COALESCE(SUM(CASE WHEN ps.completion_pct>=25 THEN 1 ELSE 0 END),0) AS reached_25,
      COALESCE(SUM(CASE WHEN ps.completion_pct>=50 THEN 1 ELSE 0 END),0) AS reached_50,
      COALESCE(SUM(CASE WHEN ps.completion_pct>=75 THEN 1 ELSE 0 END),0) AS reached_75,
      COALESCE(SUM(CASE WHEN ps.completion_pct>=90 THEN 1 ELSE 0 END),0) AS reached_90,
      COALESCE(SUM(CASE WHEN ps.completion_pct>=99.5 THEN 1 ELSE 0 END),0) AS reached_100,
      COALESCE(SUM(CASE WHEN ps.duration_ms IS NOT NULL THEN 1 ELSE 0 END),0) AS duration_known
    FROM artist_media m
    LEFT JOIN media_playback_sessions ps
      ON ps.media_id=m.id AND ps.first_played_at>=?
    WHERE m.artist_id=? AND m.active=1
    GROUP BY m.id,m.title,m.media_type,m.sort_order
    ORDER BY m.sort_order,m.id
  `).bind(cutoff,artist.id).all()).results||[];

  const viewRows=(await env.CROWN_DB.prepare(`
    SELECT mv.media_id,COUNT(*) AS crowd_views
    FROM media_views mv
    JOIN artist_media m ON m.id=mv.media_id
    WHERE m.artist_id=? AND mv.qualified_at>=?
    GROUP BY mv.media_id
  `).bind(artist.id,cutoff).all()).results||[];
  const viewMap=new Map(viewRows.map(row=>[Number(row.media_id),Number(row.crowd_views||0)]));

  const media=playback.map(row=>{
    const playStarts=Number(row.play_starts||0);
    const crowdViews=viewMap.get(Number(row.id))||0;
    return {
      mediaId:Number(row.id),
      title:row.title,
      mediaType:row.media_type,
      playStarts,
      crowdViews,
      crowdViewRate:rate(crowdViews,playStarts),
      activeWatchSeconds:seconds(row.active_ms),
      averageWatchSeconds:seconds(row.avg_active_ms),
      averageCompletionPct:Number(Number(row.avg_completion_pct||0).toFixed(1)),
      durationKnownSessions:Number(row.duration_known||0),
      reached25:Number(row.reached_25||0),
      reached50:Number(row.reached_50||0),
      reached75:Number(row.reached_75||0),
      reached90:Number(row.reached_90||0),
      reached100:Number(row.reached_100||0)
    };
  });

  const totals=media.reduce((acc,row)=>{
    acc.playStarts+=row.playStarts;
    acc.crowdViews+=row.crowdViews;
    acc.activeWatchSeconds+=row.activeWatchSeconds;
    acc.reached25+=row.reached25;
    acc.reached50+=row.reached50;
    acc.reached75+=row.reached75;
    acc.reached90+=row.reached90;
    acc.reached100+=row.reached100;
    return acc;
  },{playStarts:0,crowdViews:0,activeWatchSeconds:0,reached25:0,reached50:0,reached75:0,reached90:0,reached100:0});

  const aggregate=await env.CROWN_DB.prepare(`
    SELECT
      COUNT(*) AS play_starts,
      COALESCE(SUM(ps.active_ms),0) AS active_ms,
      COALESCE(AVG(ps.active_ms),0) AS avg_active_ms,
      COALESCE(AVG(CASE WHEN ps.duration_ms IS NOT NULL THEN ps.completion_pct END),0) AS avg_completion_pct,
      COALESCE(SUM(CASE WHEN ps.duration_ms IS NOT NULL THEN 1 ELSE 0 END),0) AS duration_known
    FROM media_playback_sessions ps
    JOIN artist_media m ON m.id=ps.media_id
    WHERE m.artist_id=? AND ps.first_played_at>=?
  `).bind(artist.id,cutoff).first();

  const playDaily=(await env.CROWN_DB.prepare(`
    SELECT substr(ps.first_played_at,1,10) AS day,
      COUNT(*) AS play_starts,
      COALESCE(SUM(ps.active_ms),0) AS active_ms
    FROM media_playback_sessions ps
    JOIN artist_media m ON m.id=ps.media_id
    WHERE m.artist_id=? AND ps.first_played_at>=?
    GROUP BY substr(ps.first_played_at,1,10)
    ORDER BY day
  `).bind(artist.id,cutoff).all()).results||[];

  const viewDaily=(await env.CROWN_DB.prepare(`
    SELECT substr(mv.qualified_at,1,10) AS day,COUNT(*) AS crowd_views
    FROM media_views mv
    JOIN artist_media m ON m.id=mv.media_id
    WHERE m.artist_id=? AND mv.qualified_at>=?
    GROUP BY substr(mv.qualified_at,1,10)
    ORDER BY day
  `).bind(artist.id,cutoff).all()).results||[];

  const dailyMap=new Map();
  for(const row of playDaily){
    dailyMap.set(row.day,{
      day:row.day,
      playStarts:Number(row.play_starts||0),
      crowdViews:0,
      activeWatchSeconds:seconds(row.active_ms)
    });
  }
  for(const row of viewDaily){
    const item=dailyMap.get(row.day)||{day:row.day,playStarts:0,crowdViews:0,activeWatchSeconds:0};
    item.crowdViews=Number(row.crowd_views||0);
    dailyMap.set(row.day,item);
  }

  return json({
    ok:true,
    generatedAt:new Date().toISOString(),
    days,
    artist,
    funnel:{
      playStarts:Number(aggregate?.play_starts||0),
      crowdViews:totals.crowdViews,
      crowdViewRate:rate(totals.crowdViews,Number(aggregate?.play_starts||0)),
      activeWatchHours:hours(aggregate?.active_ms),
      averageWatchSeconds:seconds(aggregate?.avg_active_ms),
      averageCompletionPct:Number(Number(aggregate?.avg_completion_pct||0).toFixed(1)),
      durationKnownSessions:Number(aggregate?.duration_known||0),
      reached25:totals.reached25,
      reached50:totals.reached50,
      reached75:totals.reached75,
      reached90:totals.reached90,
      reached100:totals.reached100
    },
    media,
    daily:[...dailyMap.values()].sort((a,b)=>a.day.localeCompare(b.day))
  });
}
