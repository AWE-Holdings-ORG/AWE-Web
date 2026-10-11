function positiveInt(value){
  const n=Number(value);
  return Number.isInteger(n)&&n>0?n:null;
}
function addRows(set,rows,key){
  for(const row of rows||[]){
    const value=row?.[key];
    if(value!==null&&value!==undefined&&String(value).length)set.add(value);
  }
}
async function rows(stmt){
  const result=await stmt.all();
  return result?.results||[];
}

/**
 * Build the entitlement context consumed by the pure Player resolver.
 *
 * Authentication stays outside this module. Callers pass only identities they
 * have already authenticated. A linked counterpart can contribute HOUSE and
 * UNLOCK grants, but never turns a CYPHERZ session into Crown authentication.
 */
export async function buildPlayerViewerContext(db,{
  crownMemberId=null,
  cypherzProfileId=null,
  crownAuthenticated=false
}={}){
  if(!db)throw new Error("PLAYER_CONTEXT_DB_REQUIRED");

  const directCrownId=positiveInt(crownMemberId);
  const directCypherzId=positiveInt(cypherzProfileId);

  let linkedCrownId=null;
  let linkedCypherzId=null;
  let identityConflict=false;

  if(directCypherzId){
    const profile=await db.prepare(
      "SELECT id,crown_member_id,status FROM cypherz_profiles WHERE id=? LIMIT 1"
    ).bind(directCypherzId).first();

    if(!profile||profile.status!=="active")throw new Error("CYPHERZ_PROFILE_NOT_ACTIVE");
    linkedCrownId=positiveInt(profile.crown_member_id);
    if(directCrownId&&linkedCrownId&&directCrownId!==linkedCrownId)identityConflict=true;
  }

  if(directCrownId){
    const member=await db.prepare(
      "SELECT id,status FROM members WHERE id=? LIMIT 1"
    ).bind(directCrownId).first();

    if(!member||member.status!=="active")throw new Error("CROWN_MEMBER_NOT_ACTIVE");

    const linked=await db.prepare(
      "SELECT id FROM cypherz_profiles WHERE crown_member_id=? AND status='active' LIMIT 1"
    ).bind(directCrownId).first();
    linkedCypherzId=positiveInt(linked?.id);

    if(directCypherzId&&linkedCypherzId&&directCypherzId!==linkedCypherzId)identityConflict=true;
  }

  if(identityConflict){
    return {
      crownAuthenticated:false,
      crownMemberId:null,
      cypherzProfileId:null,
      linked:false,
      identityConflict:true,
      houseSlugs:[],
      unlockedMediaIds:[]
    };
  }

  const effectiveCrownId=directCrownId||linkedCrownId;
  const effectiveCypherzId=directCypherzId||linkedCypherzId;
  const houses=new Set();
  const unlocked=new Set();

  if(effectiveCrownId){
    addRows(
      houses,
      await rows(db.prepare(
        "SELECT house_slug FROM member_access WHERE member_id=? AND active=1"
      ).bind(effectiveCrownId)),
      "house_slug"
    );
    addRows(
      unlocked,
      await rows(db.prepare(
        "SELECT media_id FROM media_unlock_grants WHERE crown_member_id=? AND revoked_at IS NULL"
      ).bind(effectiveCrownId)),
      "media_id"
    );
  }

  if(effectiveCypherzId){
    addRows(
      houses,
      await rows(db.prepare(
        "SELECT house_slug FROM cypherz_house_access WHERE profile_id=? AND active=1 AND revoked_at IS NULL"
      ).bind(effectiveCypherzId)),
      "house_slug"
    );
    addRows(
      unlocked,
      await rows(db.prepare(
        "SELECT media_id FROM media_unlock_grants WHERE cypherz_profile_id=? AND revoked_at IS NULL"
      ).bind(effectiveCypherzId)),
      "media_id"
    );
  }

  return {
    crownAuthenticated:directCrownId!==null&&crownAuthenticated===true,
    crownMemberId:effectiveCrownId,
    cypherzProfileId:effectiveCypherzId,
    linked:!!(effectiveCrownId&&effectiveCypherzId),
    identityConflict:false,
    houseSlugs:[...houses],
    unlockedMediaIds:[...unlocked].map(Number).filter(Number.isInteger)
  };
}
