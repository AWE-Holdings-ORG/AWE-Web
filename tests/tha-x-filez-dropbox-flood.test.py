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

migrations=[
  "0017_tha_x_filez_and_super_readers.sql",
  "0018_tha_x_filez_initial_public_images.sql",
  "0019_tha_x_filez_dropbox_01.sql",
  "0020_tha_x_filez_dropbox_02.sql",
  "0021_tha_x_filez_dropbox_03.sql",
  "0022_tha_x_filez_dropbox_04.sql",
  "0024_tha_x_filez_drive_completion.sql",
]

for name in migrations:
    db.executescript((ROOT/"migrations"/name).read_text())

# Entire intake stack must be idempotent.
for name in migrations:
    db.executescript((ROOT/"migrations"/name).read_text())

totals=db.execute("""
SELECT COUNT(*),COUNT(DISTINCT m.provider || ':' || m.external_id)
FROM artist_media m
JOIN player_media_collection_items i ON i.media_id=m.id
JOIN player_media_collections c ON c.id=i.collection_id
WHERE c.collection_slug='tha-x-filez'
""").fetchone()
assert totals==(1230,1230), totals

providers=dict(db.execute("""
SELECT m.provider,COUNT(*)
FROM artist_media m
JOIN player_media_collection_items i ON i.media_id=m.id
JOIN player_media_collections c ON c.id=i.collection_id
WHERE c.collection_slug='tha-x-filez'
GROUP BY m.provider
""").fetchall())
assert providers=={'google-drive':218,'dropbox':1012}, providers

dropbox_types=dict(db.execute("""
SELECT media_type,COUNT(*)
FROM artist_media
WHERE provider='dropbox' AND era_slug='tha-x-filez-dropbox'
GROUP BY media_type
""").fetchall())
assert dropbox_types=={'photo':809,'video':203}, dropbox_types

dropbox_access=db.execute("""
SELECT COUNT(*)
FROM artist_media m
JOIN media_access_policy p ON p.media_id=m.id
WHERE m.provider='dropbox'
  AND m.era_slug='tha-x-filez-dropbox'
  AND m.visibility='public'
  AND p.access_state='public'
  AND p.teaser_mode='visible'
  AND p.cypherz_visible=1
  AND p.active=1
""").fetchone()[0]
assert dropbox_access==1012, dropbox_access

codes=[r[0] for r in db.execute("""
SELECT i.file_code
FROM player_media_collection_items i
JOIN player_media_collections c ON c.id=i.collection_id
WHERE c.collection_slug='tha-x-filez'
ORDER BY i.file_code
""").fetchall()]
assert len(codes)==1230
assert len(set(codes))==1230
assert codes[0]=='DXF-0001'
assert codes[-1]=='DXF-1230'

dropbox_urls=db.execute("""
SELECT COUNT(*)
FROM artist_media
WHERE provider='dropbox'
  AND era_slug='tha-x-filez-dropbox'
  AND source_url LIKE 'https://www.dropbox.com/%'
  AND canonical_url=source_url
  AND thumbnail_url IS NULL
""").fetchone()[0]
assert dropbox_urls==1012, dropbox_urls

unclassified_video=db.execute("""
SELECT COUNT(*)
FROM artist_media
WHERE provider='dropbox'
  AND era_slug='tha-x-filez-dropbox'
  AND media_type='video'
  AND description LIKE '%unclassified X video%'
""").fetchone()[0]
assert unclassified_video==203, unclassified_video

print("PASS: Tha X Filez holds 1,230 unique records = 218 Drive + 1,012 Dropbox; DXF-0001 through DXF-1230; intake is PUBLIC-first and raw videos remain unclassified")
