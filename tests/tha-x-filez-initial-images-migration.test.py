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
  sort_order INTEGER NOT NULL DEFAULT 100,
  active INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  source_name TEXT,
  source_url TEXT,
  thumbnail_url TEXT,
  rights_status TEXT NOT NULL DEFAULT 'unverified',
  duration_seconds INTEGER,
  published_at TEXT,
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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE
);

CREATE TABLE player_events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  event_date TEXT,
  time_text TEXT,
  platform TEXT,
  organizer TEXT,
  rights_status TEXT NOT NULL DEFAULT 'unverified',
  evidence_status TEXT NOT NULL DEFAULT 'pending',
  evidence_note TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE player_event_media(
  event_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  relation_role TEXT NOT NULL DEFAULT 'primary',
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(event_id,media_id),
  FOREIGN KEY(event_id) REFERENCES player_events(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE
);

INSERT INTO artists(id,artist_slug) VALUES(1,'x-tha-god');
""")

db.executescript((ROOT/"migrations/0017_tha_x_filez_and_super_readers.sql").read_text())
sql=(ROOT/"migrations/0018_tha_x_filez_initial_public_images.sql").read_text()
db.executescript(sql)
db.executescript(sql)

count=db.execute("""
SELECT COUNT(*),COUNT(DISTINCT external_id)
FROM artist_media
WHERE artist_id=1 AND era_slug='tha-x-filez'
""").fetchone()
assert count==(92,92), count

sources=dict(db.execute("""
SELECT source_name,COUNT(*)
FROM artist_media
WHERE artist_id=1 AND era_slug='tha-x-filez'
GROUP BY source_name
""").fetchall())

assert sources=={
  'The CROWD Drive — Hype3Wear / X Tha God':5,
  'The CROWD Drive — Grizz Exams / X Tha God':87,
}, sources

bad=db.execute("""
SELECT COUNT(*)
FROM artist_media m
JOIN media_access_policy p ON p.media_id=m.id
WHERE m.artist_id=1 AND m.era_slug='tha-x-filez'
  AND (
    m.media_type<>'photo'
    OR m.provider<>'google-drive'
    OR m.visibility<>'public'
    OR p.access_state<>'public'
    OR p.teaser_mode<>'visible'
    OR p.cypherz_visible<>1
    OR m.thumbnail_url NOT LIKE 'https://drive.google.com/thumbnail?id=%&sz=w1600'
  )
""").fetchone()[0]
assert bad==0, bad

linked=db.execute("""
SELECT COUNT(*)
FROM player_media_collection_items i
JOIN player_media_collections c ON c.id=i.collection_id
JOIN artist_media m ON m.id=i.media_id
WHERE c.collection_slug='tha-x-filez'
  AND m.era_slug='tha-x-filez'
""").fetchone()[0]
assert linked==92, linked

codes=db.execute("""
SELECT i.file_code
FROM player_media_collection_items i
JOIN player_media_collections c ON c.id=i.collection_id
JOIN artist_media m ON m.id=i.media_id
WHERE c.collection_slug='tha-x-filez'
  AND m.era_slug='tha-x-filez'
ORDER BY i.file_code
""").fetchall()
codes=[row[0] for row in codes]
assert len(codes)==92
assert len(set(codes))==92
assert codes[0]=='DXF-0001'
assert codes[-1]=='DXF-0092'

assert db.execute("""
SELECT COUNT(*) FROM artist_media
WHERE era_slug='tha-x-filez' AND description LIKE '%.MOV%'
""").fetchone()[0]==0

assert db.execute("""
SELECT default_access_state
FROM player_media_collections
WHERE collection_slug='tha-x-filez'
""").fetchone()[0]=='public'

print("PASS: 92 first-party X still images seed idempotently into public Tha X Filez; raw MOV files remain unclassified")
