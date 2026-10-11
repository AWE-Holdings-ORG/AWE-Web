PRAGMA foreign_keys=ON;

-- Player/CYPHERZ access grants.
-- PUBLIC needs no grant.
-- HOUSE and UNLOCK must work before a user ever receives a Crown.
-- CROWN remains an authenticated Crown identity state.
-- VAULT may use explicit grants while remaining concealed until authorized.

CREATE TABLE IF NOT EXISTS cypherz_house_access (
  profile_id INTEGER NOT NULL,
  house_slug TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'system'
    CHECK(source_type IN ('system','hashtag','code','house-key','qr','nfc','event','comment','challenge','admin')),
  source_ref TEXT,
  discovered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  revoked_at TEXT,
  PRIMARY KEY(profile_id,house_slug),
  FOREIGN KEY(profile_id) REFERENCES cypherz_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY(house_slug) REFERENCES houses(slug) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_unlock_grants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_id INTEGER NOT NULL,
  crown_member_id INTEGER,
  cypherz_profile_id INTEGER,
  unlock_slug TEXT,
  source_type TEXT NOT NULL DEFAULT 'system'
    CHECK(source_type IN ('system','house-key','fragm3nt','event','qr','nfc','hashtag','comment','challenge','admin')),
  source_ref TEXT,
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  CHECK(
    (crown_member_id IS NOT NULL AND cypherz_profile_id IS NULL)
    OR
    (crown_member_id IS NULL AND cypherz_profile_id IS NOT NULL)
  ),
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE,
  FOREIGN KEY(crown_member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY(cypherz_profile_id) REFERENCES cypherz_profiles(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_media_unlock_crown
  ON media_unlock_grants(media_id,crown_member_id)
  WHERE crown_member_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_media_unlock_cypherz
  ON media_unlock_grants(media_id,cypherz_profile_id)
  WHERE cypherz_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cypherz_house_access_profile
  ON cypherz_house_access(profile_id,active,granted_at);

CREATE INDEX IF NOT EXISTS idx_media_unlock_crown
  ON media_unlock_grants(crown_member_id,revoked_at,granted_at);

CREATE INDEX IF NOT EXISTS idx_media_unlock_cypherz
  ON media_unlock_grants(cypherz_profile_id,revoked_at,granted_at);

CREATE INDEX IF NOT EXISTS idx_media_unlock_slug
  ON media_unlock_grants(unlock_slug,revoked_at);
