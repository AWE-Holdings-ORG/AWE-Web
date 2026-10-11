import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
db=sqlite3.connect(":memory:")
db.executescript("""
PRAGMA foreign_keys=ON;
CREATE TABLE members(
  id INTEGER PRIMARY KEY,
  aw_id TEXT NOT NULL UNIQUE
);
CREATE TABLE artist_media(
  id INTEGER PRIMARY KEY
);
INSERT INTO members(id,aw_id) VALUES(1,'AWE-000001'),(2,'AWE-000002');
INSERT INTO artist_media(id) VALUES(10);
""")

db.executescript((ROOT/"migrations/0011_player_engagement_analytics.sql").read_text())

grant=db.execute("""
SELECT member_id,access_level,revoked_at
FROM player_analytics_access
ORDER BY member_id
""").fetchall()
assert grant == [(1,'operator',None)], grant

db.execute("""
INSERT INTO media_playback_sessions(
  media_id,crown_member_id,session_key,active_ms,duration_ms,completion_pct
) VALUES(10,1,'1234567890abcdef',120000,600000,20)
""")

try:
  db.execute("""
  INSERT INTO media_playback_sessions(
    media_id,crown_member_id,session_key,active_ms,duration_ms,completion_pct
  ) VALUES(10,1,'1234567890abcdef',130000,600000,21.6)
  """)
  raise AssertionError("duplicate media/session playback ledger should fail")
except sqlite3.IntegrityError:
  pass

try:
  db.execute("""
  INSERT INTO media_playback_sessions(
    media_id,crown_member_id,session_key,active_ms,duration_ms,completion_pct
  ) VALUES(10,1,'fedcba0987654321',1000,600000,101)
  """)
  raise AssertionError("completion percentage above 100 should fail")
except sqlite3.IntegrityError:
  pass

print("PASS: Player analytics migration 0011")
