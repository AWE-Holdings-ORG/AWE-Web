function pushRows(target,rows,key){
  for(const row of Array.isArray(rows)?rows:[]){
    const value=row?.[key];
    if(value!==null&&value!==undefined&&String(value).length)target.add(key==="media_id"?Number(value):String(value));
  }
}

export async function buildPlayerViewerContext(db,{
  crownMemberId=null,
  cypherzProfileId=null,
  crownAuthenticated=false
}={}){
  if(!db)throw new Error("PLAYER_CONTEXT_DB_REQUIRED");

  const houseSlugs=new Set();
  const unlockedMediaIds=new Set();

  if(Number.isInteger(Number(crownMemberId))&&Number(crownMemberId)>0){
    const memberId=Number(crownMemberId);
    const [houseResult,unlockResult]=await Promise.all([
      db.prepare(
        "SELECT house_slug FROM member_access WHERE member_id=? AND active=1"
      ).bind(memberId).all(),
      db.prepare(
        "SELECT media_id FROM media_unlock_grants WHERE crown_member_id=? AND revoked_at IS NULL"
      ).bind(memberId).all()
    ]);
    pushRows(houseSlugs,houseResult?.results,"house_slug");
    pushRows(unlockedMediaIds,unlockResult?.results,"media_id");
  }

  if(Number.isInteger(Number(cypherzProfileId))&&Number(cypherzProfileId)>0){
    const profileId=Number(cypherzProfileId);
    const [houseResult,unlockResult]=await Promise.all([
      db.prepare(
        "SELECT house_slug FROM cypherz_house_access WHERE profile_id=? AND active=1 AND revoked_at IS NULL"
      ).bind(profileId).all(),
      db.prepare(
        "SELECT media_id FROM media_unlock_grants WHERE cypherz_profile_id=? AND revoked_at IS NULL"
      ).bind(profileId).all()
    ]);
    pushRows(houseSlugs,houseResult?.results,"house_slug");
    pushRows(unlockedMediaIds,unlockResult?.results,"media_id");
  }

  return {
    crownAuthenticated:crownAuthenticated===true,
    houseSlugs:[...houseSlugs],
    unlockedMediaIds:[...unlockedMediaIds]
  };
}
