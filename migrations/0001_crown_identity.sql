PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS members (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 aw_id TEXT NOT NULL UNIQUE,
 email TEXT NOT NULL UNIQUE,
 crown_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended','closed')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 verified_at TEXT
);
CREATE TABLE IF NOT EXISTS crown_credentials (
 member_id INTEGER PRIMARY KEY,
 pck_hash TEXT NOT NULL,
 pck_salt TEXT NOT NULL,
 rotated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS houses (
 slug TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 destination TEXT NOT NULL,
 audience TEXT NOT NULL DEFAULT 'general'
);
CREATE TABLE IF NOT EXISTS member_access (
 member_id INTEGER NOT NULL,
 house_slug TEXT NOT NULL,
 destination TEXT NOT NULL,
 active INTEGER NOT NULL DEFAULT 1,
 priority INTEGER NOT NULL DEFAULT 100,
 PRIMARY KEY(member_id,house_slug),
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
 FOREIGN KEY(house_slug) REFERENCES houses(slug)
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY,
 member_id INTEGER NOT NULL,
 expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS enrollment_requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 email TEXT NOT NULL,
 crown_name TEXT NOT NULL,
 verification_token TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL DEFAULT 'pending',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS access_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 member_id INTEGER,
 event_type TEXT NOT NULL,
 house_slug TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS loyalty_accounts (
 member_id INTEGER NOT NULL,
 unit_slug TEXT NOT NULL,
 balance INTEGER NOT NULL DEFAULT 0 CHECK(balance>=0),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(member_id,unit_slug),
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS loyalty_ledger (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 member_id INTEGER NOT NULL,
 unit_slug TEXT NOT NULL,
 amount INTEGER NOT NULL,
 reason TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);
INSERT OR IGNORE INTO houses(slug,name,destination,audience) VALUES
 ('crown-house','Crown House','/crown/','general'),
 ('the-crowd','The Crowd','/crown/crowd/','general'),
 ('echo-x-labs','Echo X Labs','/crown/echo-x/','general'),
 ('gbe','Good Business Entertainment','/crown/gbe/','general'),
 ('da-bay-chicz','Da Bay Chicz','/crown/dbc/','general'),
 ('awe-4-kids','AWE 4 Kids','/crown/awe-4-kids/','family');
CREATE INDEX IF NOT EXISTS idx_members_crown_name ON members(crown_name);
CREATE INDEX IF NOT EXISTS idx_sessions_member ON sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_events_member ON access_events(member_id);