PRAGMA foreign_keys=ON;

-- Da CROWD Player first-party engagement analytics.
-- One monotonic playback ledger row per media + Player session key.
-- No raw IP, PCK, credential hash, salt, pepper, or provider credential data.

CREATE TABLE IF NOT EXISTS media_playback_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_id INTEGER NOT NULL,
  crown_member_id INTEGER,
  session_key TEXT NOT NULL,
  first_played_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_signal_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active_ms INTEGER NOT NULL DEFAULT 0 CHECK(active_ms >= 0),
  duration_ms INTEGER CHECK(duration_ms IS NULL OR duration_ms > 0),
  completion_pct REAL NOT NULL DEFAULT 0 CHECK(completion_pct >= 0 AND completion_pct <= 100),
  ended_at TEXT,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE,
  FOREIGN KEY(crown_member_id) REFERENCES members(id) ON DELETE SET NULL,
  UNIQUE(media_id,session_key)
);

CREATE TABLE IF NOT EXISTS player_analytics_access (
  member_id INTEGER PRIMARY KEY,
  access_level TEXT NOT NULL DEFAULT 'viewer'
    CHECK(access_level IN ('viewer','operator')),
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_playback_media_time
  ON media_playback_sessions(media_id,first_played_at);

CREATE INDEX IF NOT EXISTS idx_media_playback_member_time
  ON media_playback_sessions(crown_member_id,first_played_at);

CREATE INDEX IF NOT EXISTS idx_media_playback_last_signal
  ON media_playback_sessions(last_signal_at);

-- Founding operator grant. Authorization lives in data, not hard-coded runtime logic.
INSERT OR IGNORE INTO player_analytics_access(member_id,access_level)
SELECT id,'operator'
FROM members
WHERE aw_id='AWE-000001';
