PRAGMA foreign_keys=ON;

-- Crown linking is intentionally one-way discoverable:
-- CYPHERZ may recognize an existing Crown, but never explains how to obtain one.

CREATE TABLE IF NOT EXISTS cypherz_link_requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 profile_id INTEGER NOT NULL,
 request_token_digest TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL DEFAULT 'pending',
 expires_at TEXT NOT NULL,
 approved_member_id INTEGER,
 approved_at TEXT,
 consumed_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(profile_id) REFERENCES cypherz_profiles(id) ON DELETE CASCADE,
 FOREIGN KEY(approved_member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cypherz_link_requests_profile
ON cypherz_link_requests(profile_id,status,expires_at);
