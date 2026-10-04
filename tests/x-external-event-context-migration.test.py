import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

db=sqlite3.connect(":memory:")
db.executescript("""
PRAGMA foreign_keys=ON;
CREATE TABLE artists(
  id INTEGER PRIMARY KEY,
  artist_slug TEXT NOT NULL UNIQUE
);
CREATE TABLE artist_media(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  media_type TEXT NOT NULL,
  provider TEXT,
  external_id TEXT,
  canonical_url TEXT,
  title TEXT NOT NULL,
  event_date TEXT,
  era_slug TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  source_name TEXT,
  source_url TEXT,
  rights_status TEXT NOT NULL DEFAULT 'unverified',
  FOREIGN KEY(artist_id) REFERENCES artists(id)
);
CREATE TABLE media_access_policy(
  media_id INTEGER PRIMARY KEY,
  access_state TEXT NOT NULL,
  house_slug TEXT,
  unlock_slug TEXT,
  teaser_mode TEXT NOT NULL,
  cypherz_visible INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE
);
INSERT INTO artists(id,artist_slug) VALUES(1,'x-tha-god');
""")

for migration in (
    "0008_x_tha_god_verified_media_seed.sql",
    "0012_x_tha_god_crowd_owned_battles.sql",
    "0013_player_event_context.sql",
    "0014_x_tha_god_verified_external_reconciliation.sql",
    "0015_x_tha_god_external_event_context.sql",
):
    db.executescript((ROOT/"migrations"/migration).read_text())

# 0015 must be idempotent.
db.executescript((ROOT/"migrations/0015_x_tha_god_external_event_context.sql").read_text())

rows=db.execute("""
SELECT e.event_slug,e.display_name,e.event_date,e.organizer,m.external_id
FROM player_events e
JOIN player_event_media em ON em.event_id=e.id
JOIN artist_media m ON m.id=em.media_id
WHERE e.event_slug IN (
  'insidious-2023-09-30',
  'sunfall-2024-06-15',
  'back-2-business-2024-11-02'
)
ORDER BY e.event_date
""").fetchall()

expected=[
  ('insidious-2023-09-30','Insidious','2023-09-30','Stardom (formerly Demon Time Battle League)','xgupv_oiIQ8'),
  ('sunfall-2024-06-15','Sunfall','2024-06-15','iBattleTV','jKl0NU9K8hE'),
  ('back-2-business-2024-11-02','Back 2 Business','2024-11-02','The Grizz Exam Battles','twjhGe-nJCw'),
]
assert rows==expected, rows

assert db.execute("""
SELECT COUNT(*) FROM player_events
WHERE event_slug IN (
  'insidious-2023-09-30',
  'sunfall-2024-06-15',
  'back-2-business-2024-11-02'
)
""").fetchone()[0]==3

print("PASS: reconciled X external battles link idempotently to verified event context")
