export async function houseAdminCapabilities(db,memberId,houseSlug){
  if(!db||!Number.isInteger(Number(memberId))||!houseSlug){
    return {
      role:null,
      canEditPublicMeta:false,
      canViewSourceTitle:false,
      canManageAccess:false,
      canModerateComments:false
    };
  }

  const member=await db.prepare(
    "SELECT id,aw_id FROM members WHERE id=? AND status='active' LIMIT 1"
  ).bind(Number(memberId)).first();

  if(!member){
    return {
      role:null,
      canEditPublicMeta:false,
      canViewSourceTitle:false,
      canManageAccess:false,
      canModerateComments:false
    };
  }

  if(member.aw_id==="AWE-000001"){
    return {
      role:"owner",
      canEditPublicMeta:true,
      canViewSourceTitle:true,
      canManageAccess:true,
      canModerateComments:true
    };
  }

  const table=await db.prepare(
    "SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name='house_admin_grants' LIMIT 1"
  ).first();
  if(!table?.ok){
    // Preview/bootstrap compatibility: X Tha God may begin CROWD archive
    // curation immediately while migration 0026 is still being applied.
    // Once the table exists, database grants become authoritative.
    if(member.aw_id==="AWE-000002"&&String(houseSlug)==="the-crowd"){
      return {
        role:"media-admin",
        canEditPublicMeta:true,
        canViewSourceTitle:true,
        canManageAccess:false,
        canModerateComments:false
      };
    }
    return {
      role:null,
      canEditPublicMeta:false,
      canViewSourceTitle:false,
      canManageAccess:false,
      canModerateComments:false
    };
  }

  const row=await db.prepare(`
    SELECT role_slug,can_edit_public_meta,can_view_source_title,
           can_manage_access,can_moderate_comments
    FROM house_admin_grants
    WHERE member_id=? AND house_slug=? AND active=1 AND revoked_at IS NULL
    LIMIT 1
  `).bind(Number(memberId),String(houseSlug)).first();

  return {
    role:row?.role_slug||null,
    canEditPublicMeta:Number(row?.can_edit_public_meta||0)===1,
    canViewSourceTitle:Number(row?.can_view_source_title||0)===1,
    canManageAccess:Number(row?.can_manage_access||0)===1,
    canModerateComments:Number(row?.can_moderate_comments||0)===1
  };
}
