PRAGMA foreign_keys=ON;

-- Competition + CYPHERZ interoperability foundation.
CREATE TABLE IF NOT EXISTS competitions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 slug TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL,
 competition_type TEXT NOT NULL DEFAULT 'battle',
 house_slug TEXT NOT NULL DEFAULT 'the-crowd',
 status TEXT NOT NULL DEFAULT 'draft',
 judging_opens_at TEXT,
 judging_closes_at TEXT,
 official_result_status TEXT NOT NULL DEFAULT 'pending',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competition_participants (
 competition_id INTEGER NOT NULL,
 artist_id INTEGER NOT NULL,
 side INTEGER NOT NULL,
 display_order INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(competition_id,artist_id),
 FOREIGN KEY(competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
 FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS judging_criteria (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 competition_id INTEGER NOT NULL,
 criterion_key TEXT NOT NULL,
 label TEXT NOT NULL,
 max_score REAL NOT NULL DEFAULT 10,
 weight REAL NOT NULL DEFAULT 1,
 display_order INTEGER NOT NULL DEFAULT 0,
 active INTEGER NOT NULL DEFAULT 1,
 FOREIGN KEY(competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
 UNIQUE(competition_id,criterion_key)
);

CREATE TABLE IF NOT EXISTS judging_ballots (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 competition_id INTEGER NOT NULL,
 member_id INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft',
 submitted_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
 UNIQUE(competition_id,member_id)
);

CREATE TABLE IF NOT EXISTS judging_scores (
 ballot_id INTEGER NOT NULL,
 artist_id INTEGER NOT NULL,
 criterion_id INTEGER NOT NULL,
 score REAL NOT NULL,
 PRIMARY KEY(ballot_id,artist_id,criterion_id),
 FOREIGN KEY(ballot_id) REFERENCES judging_ballots(id) ON DELETE CASCADE,
 FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE,
 FOREIGN KEY(criterion_id) REFERENCES judging_criteria(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS official_results (
 competition_id INTEGER PRIMARY KEY,
 winner_artist_id INTEGER,
 result_type TEXT NOT NULL DEFAULT 'decision',
 result_text TEXT,
 source_name TEXT,
 source_url TEXT,
 recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
 FOREIGN KEY(winner_artist_id) REFERENCES artists(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ranking_snapshots (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scope_key TEXT NOT NULL DEFAULT 'crowd',
 artist_id INTEGER NOT NULL,
 rank_position INTEGER NOT NULL,
 rating REAL,
 wins INTEGER NOT NULL DEFAULT 0,
 losses INTEGER NOT NULL DEFAULT 0,
 draws INTEGER NOT NULL DEFAULT 0,
 snapshot_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crown_app_clients (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 client_key TEXT NOT NULL UNIQUE,
 display_name TEXT NOT NULL,
 redirect_uri TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crown_app_links (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 member_id INTEGER NOT NULL,
 client_id INTEGER NOT NULL,
 scopes TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active',
 linked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 revoked_at TEXT,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
 FOREIGN KEY(client_id) REFERENCES crown_app_clients(id) ON DELETE CASCADE,
 UNIQUE(member_id,client_id)
);

CREATE TABLE IF NOT EXISTS crown_app_authorization_codes (
 code_digest TEXT PRIMARY KEY,
 member_id INTEGER NOT NULL,
 client_id INTEGER NOT NULL,
 scopes TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 used_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
 FOREIGN KEY(client_id) REFERENCES crown_app_clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_reactions (
 media_id INTEGER NOT NULL,
 member_id INTEGER NOT NULL,
 reaction_key TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(media_id,member_id,reaction_key),
 FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ballots_comp_status ON judging_ballots(competition_id,status);
CREATE INDEX IF NOT EXISTS idx_rankings_scope_time ON ranking_snapshots(scope_key,snapshot_at);
CREATE INDEX IF NOT EXISTS idx_app_links_member ON crown_app_links(member_id,status);

-- Default scorecard template is copied into each competition when activated:
-- WRITING / DELIVERY / PERFORMANCE / REBUTTALS / CROWD CONTROL / OVERALL.
-- Rankings remain distinct from official league/event results.
