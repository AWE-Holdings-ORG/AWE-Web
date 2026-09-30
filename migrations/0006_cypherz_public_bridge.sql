PRAGMA foreign_keys=ON;

-- CYPHERZ is the public-facing social layer. Crown linking is optional.
-- Guests can participate only in explicitly public capabilities; Crown-only
-- actions remain bound to AW ID / Crown authorization.

CREATE TABLE IF NOT EXISTS cypherz_profiles (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 handle TEXT NOT NULL UNIQUE COLLATE NOCASE,
 display_name TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active',
 crown_member_id INTEGER UNIQUE,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 linked_at TEXT,
 FOREIGN KEY(crown_member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cypherz_sessions (
 token_hash TEXT PRIMARY KEY,
 profile_id INTEGER NOT NULL,
 expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(profile_id) REFERENCES cypherz_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cypherz_capabilities (
 capability_key TEXT PRIMARY KEY,
 guest_allowed INTEGER NOT NULL DEFAULT 0,
 linked_crown_required INTEGER NOT NULL DEFAULT 0,
 description TEXT
);

INSERT OR IGNORE INTO cypherz_capabilities(capability_key,guest_allowed,linked_crown_required,description) VALUES
 ('browse_public',1,0,'Browse public CYPHERZ rooms, profiles and public media'),
 ('public_reactions',1,0,'React where a room or event allows public participation'),
 ('public_comments',1,0,'Comment where a room or event explicitly allows public comments'),
 ('crown_comments',0,1,'Post comments carrying verified Crown identity'),
 ('crowd_judging',0,1,'Submit official CROWD Scorecards'),
 ('ranking_participation',0,1,'Participate in ranking-affecting competitive actions'),
 ('fragm3nt_claims',0,1,'Claim persistent Crown Fragm3ntz'),
 ('house_exclusives',0,1,'Enter Crown/House-exclusive CYPHERZ experiences');

CREATE TABLE IF NOT EXISTS cypherz_rooms (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 room_slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
 title TEXT NOT NULL,
 visibility TEXT NOT NULL DEFAULT 'public',
 public_comments INTEGER NOT NULL DEFAULT 1,
 public_reactions INTEGER NOT NULL DEFAULT 1,
 crown_judging INTEGER NOT NULL DEFAULT 0,
 competition_id INTEGER,
 status TEXT NOT NULL DEFAULT 'scheduled',
 starts_at TEXT,
 ended_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(competition_id) REFERENCES competitions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cypherz_room_comments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 room_id INTEGER NOT NULL,
 profile_id INTEGER NOT NULL,
 body TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'visible',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(room_id) REFERENCES cypherz_rooms(id) ON DELETE CASCADE,
 FOREIGN KEY(profile_id) REFERENCES cypherz_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cypherz_profiles_crown ON cypherz_profiles(crown_member_id);
CREATE INDEX IF NOT EXISTS idx_cypherz_rooms_status ON cypherz_rooms(status,starts_at);
CREATE INDEX IF NOT EXISTS idx_cypherz_comments_room ON cypherz_room_comments(room_id,status,created_at);
