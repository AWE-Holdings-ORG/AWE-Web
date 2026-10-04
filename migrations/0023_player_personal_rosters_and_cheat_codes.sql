PRAGMA foreign_keys=ON;

-- Personalized Player roster + Cheat Code foundation.
--
-- A signal's canonical House is separate from where an individual member may
-- temporarily discover/unlock that signal.
--
-- Current canon:
-- - X Tha God -> The CROWD default signal.
-- - Big Tali -> The CROWD default signal.
-- - DeeJayy -> GBE default signal.
-- - AWE-000001 retains DeeJayy in The CROWD only as a legacy preview unlock
--   from the character-select development test. This is not CROWD affiliation.
--
-- Cheat Codes may reveal a signal to one member in one House without changing
-- the signal's canonical House or another member's roster.

CREATE TABLE IF NOT EXISTS player_signals (
  signal_slug TEXT PRIMARY KEY,
  artist_slug TEXT,
  display_name TEXT NOT NULL,
  canonical_house_slug TEXT,
  signal_label TEXT NOT NULL DEFAULT 'ACTIVE SIGNAL',
  represents_text TEXT,
  world_text TEXT,
  status_text TEXT,
  character_image_url TEXT,
  headshot_url TEXT,
  art_fit TEXT,
  art_position TEXT,
  destination TEXT,
  start_text TEXT,
  building_message TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(canonical_house_slug) REFERENCES houses(slug)
);

CREATE TABLE IF NOT EXISTS house_player_roster (
  house_slug TEXT NOT NULL,
  signal_slug TEXT NOT NULL,
  relationship_status TEXT NOT NULL DEFAULT 'current'
    CHECK(relationship_status IN ('current','former','affiliate','guest','test')),
  visible_by_default INTEGER NOT NULL DEFAULT 1 CHECK(visible_by_default IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 100,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  note TEXT,
  PRIMARY KEY(house_slug,signal_slug),
  FOREIGN KEY(house_slug) REFERENCES houses(slug) ON DELETE CASCADE,
  FOREIGN KEY(signal_slug) REFERENCES player_signals(signal_slug) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_signal_unlocks (
  member_id INTEGER NOT NULL,
  house_slug TEXT NOT NULL,
  signal_slug TEXT NOT NULL,
  unlock_source TEXT NOT NULL DEFAULT 'system'
    CHECK(unlock_source IN ('cheat-code','owner','system','legacy-preview','discovery')),
  source_ref TEXT,
  unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  PRIMARY KEY(member_id,house_slug,signal_slug),
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY(house_slug) REFERENCES houses(slug) ON DELETE CASCADE,
  FOREIGN KEY(signal_slug) REFERENCES player_signals(signal_slug) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player_cheat_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  house_slug TEXT NOT NULL,
  signal_slug TEXT NOT NULL,
  code_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  max_redemptions INTEGER,
  expires_at TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(house_slug) REFERENCES houses(slug) ON DELETE CASCADE,
  FOREIGN KEY(signal_slug) REFERENCES player_signals(signal_slug) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player_cheat_redemptions (
  cheat_code_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  redeemed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(cheat_code_id,member_id),
  FOREIGN KEY(cheat_code_id) REFERENCES player_cheat_codes(id) ON DELETE CASCADE,
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_house_player_roster_visible
  ON house_player_roster(house_slug,visible_by_default,active,sort_order);

CREATE INDEX IF NOT EXISTS idx_member_signal_unlocks
  ON member_signal_unlocks(member_id,house_slug,active,unlocked_at);

CREATE INDEX IF NOT EXISTS idx_player_cheat_house
  ON player_cheat_codes(house_slug,active);

INSERT OR IGNORE INTO player_signals(
  signal_slug,artist_slug,display_name,canonical_house_slug,signal_label,
  represents_text,world_text,status_text,character_image_url,headshot_url,
  art_fit,art_position,destination,start_text,building_message,active
) VALUES
(
  'x-tha-god','x-tha-god','X THA GOD','the-crowd','ACTIVE SIGNAL',
  'THE CROWD // GBE','LEVEL X','ACTIVE // UNLOCKED',
  '/assets/x-tha-god-character.jpeg','/assets/x-tha-god-headshot.jpg',
  'cover','center center','/crown/crowd/level-x/',
  'PRESS START // ENTER LEVEL X',NULL,1
),
(
  'big-tali',NULL,'BIG TALI','the-crowd','ACTIVE SIGNAL',
  'THE CROWD // STARDOM','IN DEVELOPMENT','IDENTITY RECOGNIZED',
  NULL,NULL,NULL,NULL,NULL,NULL,'SIGNAL FOUND // ARTIST WORLD BUILDING',1
),
(
  'deejayy',NULL,'DEEJAYY','gbe','ACTIVE SIGNAL',
  'GBE','IN DEVELOPMENT','IDENTITY RECOGNIZED',
  '/assets/deejayy-character.png','/assets/deejayy-headshot.jpg',
  '100% 118%','left center',NULL,NULL,'SIGNAL FOUND // GBE WORLD BUILDING',1
);

INSERT OR IGNORE INTO house_player_roster(
  house_slug,signal_slug,relationship_status,visible_by_default,sort_order,active,note
) VALUES
(
  'the-crowd','x-tha-god','current',1,10,1,
  'X Tha God is a current CROWD signal and may also have GBE-linked content by media policy.'
),
(
  'the-crowd','big-tali','current',1,20,1,
  'Big Tali is a current CROWD signal; Stardom lineage is represented separately.'
),
(
  'gbe','deejayy','current',1,10,1,
  'DeeJayy is 100% GBE. His CROWD character-select appearance was a preview/test only.'
);

INSERT OR IGNORE INTO member_signal_unlocks(
  member_id,house_slug,signal_slug,unlock_source,source_ref,active
)
SELECT id,'the-crowd','deejayy','legacy-preview','2026-10-character-select-test',1
FROM members
WHERE aw_id='AWE-000001';
