PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS crown_keys (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked')),
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  last_used_at TEXT
);

CREATE TABLE IF NOT EXISTS crown_key_entitlements (
  key_id TEXT NOT NULL,
  entitlement TEXT NOT NULL,
  PRIMARY KEY (key_id,entitlement),
  FOREIGN KEY (key_id) REFERENCES crown_keys(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crown_sessions (
  id TEXT PRIMARY KEY,
  key_id TEXT,
  session_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (key_id) REFERENCES crown_keys(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS crown_session_entitlements (
  session_id TEXT NOT NULL,
  entitlement TEXT NOT NULL,
  PRIMARY KEY (session_id,entitlement),
  FOREIGN KEY (session_id) REFERENCES crown_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_crown_sessions_hash ON crown_sessions(session_hash);
CREATE INDEX IF NOT EXISTS idx_crown_sessions_expiry ON crown_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_crown_key_hash ON crown_keys(key_hash);
