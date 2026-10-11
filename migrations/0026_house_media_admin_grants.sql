PRAGMA foreign_keys=ON;

-- Scoped House administration.
-- This is intentionally separate from Crown owner authority.
-- A media admin may curate presentation metadata for their House without
-- receiving member-management, credential, infrastructure, or cross-House power.

CREATE TABLE IF NOT EXISTS house_admin_grants (
  member_id INTEGER NOT NULL,
  house_slug TEXT NOT NULL,
  role_slug TEXT NOT NULL
    CHECK(role_slug IN ('media-admin','admin')),
  can_edit_public_meta INTEGER NOT NULL DEFAULT 0 CHECK(can_edit_public_meta IN (0,1)),
  can_view_source_title INTEGER NOT NULL DEFAULT 0 CHECK(can_view_source_title IN (0,1)),
  can_manage_access INTEGER NOT NULL DEFAULT 0 CHECK(can_manage_access IN (0,1)),
  can_moderate_comments INTEGER NOT NULL DEFAULT 0 CHECK(can_moderate_comments IN (0,1)),
  granted_by_member_id INTEGER,
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  note TEXT,
  PRIMARY KEY(member_id,house_slug),
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY(house_slug) REFERENCES houses(slug) ON DELETE CASCADE,
  FOREIGN KEY(granted_by_member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_house_admin_grants_house
  ON house_admin_grants(house_slug,active,role_slug);

-- X Tha God is the first scoped The CROWD media admin.
-- Exact Crown identity: AWE-000002.
INSERT INTO house_admin_grants(
  member_id,house_slug,role_slug,
  can_edit_public_meta,can_view_source_title,
  can_manage_access,can_moderate_comments,
  granted_by_member_id,granted_at,revoked_at,active,note
)
SELECT
  x.id,'the-crowd','media-admin',
  1,1,
  0,0,
  owner.id,datetime('now'),NULL,1,
  'X Tha God may curate public titles/captions for The CROWD archive media. No owner/member/infrastructure authority.'
FROM members x
LEFT JOIN members owner ON owner.aw_id='AWE-000001'
WHERE x.aw_id='AWE-000002'
  AND x.status='active'
ON CONFLICT(member_id,house_slug) DO UPDATE SET
  role_slug='media-admin',
  can_edit_public_meta=1,
  can_view_source_title=1,
  can_manage_access=0,
  can_moderate_comments=0,
  granted_by_member_id=excluded.granted_by_member_id,
  revoked_at=NULL,
  active=1,
  note=excluded.note;
