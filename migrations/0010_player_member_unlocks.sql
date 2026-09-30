PRAGMA foreign_keys=ON;

-- Per-member Player unlock ledger.
-- HOUSE authorization continues to use member_access.
-- CROWN authorization is an active Crown session.
-- UNLOCK and exceptional VAULT grants live here so discovery is not confused with access.

CREATE TABLE IF NOT EXISTS member_media_unlocks (
  member_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  unlock_slug TEXT,
  source_type TEXT NOT NULL DEFAULT 'system'
    CHECK(source_type IN ('system','house-key','fragm3nt','event','qr','challenge','admin')),
  source_ref TEXT,
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  PRIMARY KEY(member_id,media_id),
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_media_unlocks_member
  ON member_media_unlocks(member_id,revoked_at,granted_at);
CREATE INDEX IF NOT EXISTS idx_member_media_unlocks_slug
  ON member_media_unlocks(unlock_slug,revoked_at);
