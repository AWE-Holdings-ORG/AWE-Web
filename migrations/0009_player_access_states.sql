PRAGMA foreign_keys=ON;

-- Da CROWD Player access-state foundation.
-- Visibility describes presentation/access policy; discovery and authorization remain separate.
-- Canonical ladder: PUBLIC -> HOUSE -> UNLOCK -> CROWN -> VAULT.
-- Existing artist_media rows default to their current visibility and remain intact.

CREATE TABLE IF NOT EXISTS media_access_policy (
  media_id INTEGER PRIMARY KEY,
  access_state TEXT NOT NULL DEFAULT 'public'
    CHECK(access_state IN ('public','house','unlock','crown','vault')),
  house_slug TEXT,
  unlock_slug TEXT,
  teaser_mode TEXT NOT NULL DEFAULT 'visible'
    CHECK(teaser_mode IN ('visible','locked','encrypted','concealed')),
  cypherz_visible INTEGER NOT NULL DEFAULT 1 CHECK(cypherz_visible IN (0,1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE,
  FOREIGN KEY(house_slug) REFERENCES houses(slug)
);

CREATE INDEX IF NOT EXISTS idx_media_access_state
  ON media_access_policy(access_state, active);
CREATE INDEX IF NOT EXISTS idx_media_access_house
  ON media_access_policy(house_slug, access_state, active);
CREATE INDEX IF NOT EXISTS idx_media_access_unlock
  ON media_access_policy(unlock_slug, access_state, active);

-- Preserve the existing catalog while giving every current item an explicit policy.
-- Legacy 'public', 'crown', and 'vault' map directly. Unknown legacy values fail safe to crown.
INSERT OR IGNORE INTO media_access_policy(media_id,access_state,teaser_mode,cypherz_visible)
SELECT
  id,
  CASE
    WHEN lower(visibility)='public' THEN 'public'
    WHEN lower(visibility)='vault' THEN 'vault'
    ELSE 'crown'
  END,
  CASE
    WHEN lower(visibility)='public' THEN 'visible'
    WHEN lower(visibility)='vault' THEN 'concealed'
    ELSE 'locked'
  END,
  CASE
    WHEN lower(visibility)='vault' THEN 0
    ELSE 1
  END
FROM artist_media;
