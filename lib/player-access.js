const ACCESS_STATES=new Set(["public","house","unlock","crown","vault"]);
const TEASER_MODES=new Set(["visible","locked","encrypted","concealed"]);

function asSet(value){
  if(value instanceof Set)return value;
  return new Set(Array.isArray(value)?value:[]);
}

export function resolveMediaAccess(item,viewer={}){
  const state=String(item?.access_state||"").toLowerCase();
  const teaserMode=TEASER_MODES.has(String(item?.teaser_mode||"").toLowerCase())
    ? String(item.teaser_mode).toLowerCase()
    : "concealed";

  if(!ACCESS_STATES.has(state)){
    return {authorized:false,state:"unknown",teaserMode:"concealed",reason:"UNKNOWN_ACCESS_STATE"};
  }

  const houses=asSet(viewer.houseSlugs);
  const unlockedMediaIds=asSet((viewer.unlockedMediaIds||[]).map(Number));
  const mediaId=Number(item?.id);
  const explicitlyUnlocked=Number.isInteger(mediaId)&&unlockedMediaIds.has(mediaId);

  if(state==="public"){
    return {authorized:true,state,teaserMode,reason:"PUBLIC"};
  }

  if(state==="house"){
    const house=String(item?.house_slug||"").trim();
    if(!house)return {authorized:false,state,teaserMode:"concealed",reason:"HOUSE_POLICY_INVALID"};
    return {
      authorized:houses.has(house),
      state,
      teaserMode,
      reason:houses.has(house)?"HOUSE_GRANTED":"HOUSE_REQUIRED"
    };
  }

  if(state==="unlock"){
    return {
      authorized:explicitlyUnlocked,
      state,
      teaserMode,
      reason:explicitlyUnlocked?"UNLOCK_GRANTED":"UNLOCK_REQUIRED"
    };
  }

  if(state==="crown"){
    return {
      authorized:viewer.crownAuthenticated===true,
      state,
      teaserMode,
      reason:viewer.crownAuthenticated===true?"CROWN_AUTHENTICATED":"CROWN_REQUIRED"
    };
  }

  // VAULT defaults closed. An explicit per-media grant is required even for Crown.
  return {
    authorized:explicitlyUnlocked,
    state,
    teaserMode,
    reason:explicitlyUnlocked?"VAULT_GRANTED":"VAULT_REQUIRED"
  };
}

export function sanitizeMediaForViewer(item,decision){
  if(!item||!decision)return null;

  if(decision.authorized){
    return {
      ...item,
      access_state:decision.state,
      teaser_mode:decision.teaserMode,
      locked:false,
      authorized:true
    };
  }

  if(decision.teaserMode==="concealed")return null;

  const base={
    id:item.id,
    media_type:item.media_type||null,
    access_state:decision.state,
    teaser_mode:decision.teaserMode,
    locked:true,
    authorized:false,
    lock_reason:decision.reason
  };

  if(decision.teaserMode==="encrypted"){
    return {
      ...base,
      title:"ENCRYPTED SIGNAL",
      event_date:null,
      era_slug:null,
      description:null,
      thumbnail_url:null,
      house_slug:item.house_slug||null,
      unlock_slug:null
    };
  }

  // visible/locked teasers can expose presentation-safe metadata only.
  return {
    ...base,
    title:item.title||"LOCKED SIGNAL",
    event_date:item.event_date||null,
    era_slug:item.era_slug||null,
    description:item.description||null,
    thumbnail_url:item.thumbnail_url||null,
    collection_slug:item.collection_slug||null,
    collection_name:item.collection_name||null,
    house_slug:item.house_slug||null,
    unlock_slug:item.unlock_slug||null
  };
}

export function resolveAndSanitizeMedia(items,viewer={}){
  const out=[];
  for(const item of Array.isArray(items)?items:[]){
    const decision=resolveMediaAccess(item,viewer);
    const safe=sanitizeMediaForViewer(item,decision);
    if(safe)out.push(safe);
  }
  return out;
}
