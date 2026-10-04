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
  description TEXT,
  source_name TEXT,
  source_url TEXT,
  thumbnail_url TEXT,
  rights_status TEXT NOT NULL DEFAULT 'unverified',
  duration_seconds INTEGER,
  published_at TEXT,
  FOREIGN KEY(artist_id) REFERENCES artists(id)
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
INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,title,visibility,sort_order,rights_status
) VALUES
  (1,'battle','youtube','B3h9fKRPimI','X Tha God vs OG Duggie — Super Readers','crown',41,'embed-source'),
  (1,'photo','google-drive','photo-1','X portrait','crown',50,'gbe-crowd-owned'),
  (1,'interview','youtube','interview-1','X Interview 01','crown',51,'gbe-crowd-owned'),
  (1,'battle','youtube','battle-2','Another battle','crown',52,'embed-source');
""")

sql=(ROOT/"migrations/0017_da_x_filez_and_super_readers.sql").read_text()
db.executescript(sql)
db.executescript(sql)

collection=db.execute("""
SELECT c.collection_slug,c.display_name,c.description,COUNT(i.media_id)
FROM player_media_collections c
LEFT JOIN player_media_collection_items i
  ON i.collection_id=c.id AND i.active=1
WHERE c.artist_id=1 AND c.collection_slug='da-x-filez'
GROUP BY c.id
""").fetchone()

assert collection[0:2]==('da-x-filez','Da X Filez')
assert collection[3]==2, collection

members=db.execute("""
SELECT m.media_type,m.external_id
FROM player_media_collection_items i
JOIN player_media_collections c ON c.id=i.collection_id
JOIN artist_media m ON m.id=i.media_id
WHERE c.collection_slug='da-x-filez'
ORDER BY m.sort_order
""").fetchall()

assert members==[
  ('photo','photo-1'),
  ('interview','interview-1'),
], members

thumbs=dict(db.execute("""
SELECT external_id,thumbnail_url
FROM artist_media
WHERE provider='youtube'
""").fetchall())

assert thumbs['B3h9fKRPimI']=='https://i.ytimg.com/vi/B3h9fKRPimI/hqdefault.jpg'
assert thumbs['interview-1']=='https://i.ytimg.com/vi/interview-1/hqdefault.jpg'
assert thumbs['battle-2']=='https://i.ytimg.com/vi/battle-2/hqdefault.jpg'

event=db.execute("""
SELECT e.display_name,e.event_date,e.organizer,e.rights_status,e.evidence_status,m.external_id
FROM player_events e
JOIN player_event_media em ON em.event_id=e.id
JOIN artist_media m ON m.id=em.media_id
WHERE e.event_slug='super-readers-x-vs-og-duggie'
""").fetchone()

assert event==(
  'Super Readers',None,'Big Tali / The CROWD','gbe-crowd-owned','owner-confirmed','B3h9fKRPimI'
), event

print("PASS: Da X Filez collection is independent of access policy; YouTube thumbnails are staged as presentation metadata; Super Readers event ownership is encoded without inventing an event date")
