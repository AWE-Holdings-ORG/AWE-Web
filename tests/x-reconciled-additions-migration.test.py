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
    "0016_x_tha_god_reconciled_additions.sql",
):
    db.executescript((ROOT/"migrations"/migration).read_text())

# 0016 must be idempotent.
db.executescript((ROOT/"migrations/0016_x_tha_god_reconciled_additions.sql").read_text())

media=db.execute("""
SELECT provider,external_id,title,event_date,era_slug,sort_order,source_name,rights_status
FROM artist_media
WHERE external_id IN ('1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks','B3h9fKRPimI')
ORDER BY sort_order
""").fetchall()

assert media==[
  ('google-drive','1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks',
   'X Tha God vs Big Kannon — Training Day','2024-01-07',
   'crowd-reconciled',14,'The CROWD Drive','gbe-crowd-owned'),
  ('youtube','B3h9fKRPimI',
   'X Tha God vs OG Duggie — Super Readers',None,
   'external-reconciled',41,'YouTube','embed-source'),
], media

policies=db.execute("""
SELECT m.external_id,p.access_state,p.teaser_mode,p.cypherz_visible,p.active
FROM media_access_policy p
JOIN artist_media m ON m.id=p.media_id
WHERE m.external_id IN ('1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks','B3h9fKRPimI')
ORDER BY m.sort_order
""").fetchall()
assert policies==[
  ('1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks','crown','locked',1,1),
  ('B3h9fKRPimI','crown','locked',1,1),
], policies

event=db.execute("""
SELECT e.event_slug,e.display_name,e.event_date,e.organizer,m.external_id
FROM player_events e
JOIN player_event_media em ON em.event_id=e.id
JOIN artist_media m ON m.id=em.media_id
WHERE e.event_slug='training-day-2024-01-07'
""").fetchone()
assert event==(
  'training-day-2024-01-07','Training Day','2024-01-07',
  'WE THE FANS × The CROWD','1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks'
), event

artifacts=db.execute("""
SELECT artifact_type,provider,external_id,rights_status
FROM player_event_artifacts
WHERE external_id='1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks'
""").fetchall()
assert artifacts==[
  ('battle-source','google-drive','1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks','gbe-crowd-owned')
], artifacts

assert db.execute("""
SELECT COUNT(DISTINCT external_id)
FROM artist_media
WHERE media_type='battle'
""").fetchone()[0]==36

print("PASS: 0016 stages Big Kannon/Training Day + OG Duggie/Super Readers and brings the reconciled X battle set to 36")
