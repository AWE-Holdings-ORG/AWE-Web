import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
db=sqlite3.connect(":memory:")
db.executescript("""
PRAGMA foreign_keys=ON;

CREATE TABLE members(
  id INTEGER PRIMARY KEY,
  aw_id TEXT NOT NULL UNIQUE,
  crown_name TEXT NOT NULL UNIQUE
);

CREATE TABLE artist_media(
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE media_comments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO members(id,aw_id,crown_name) VALUES
  (1,'AWE-000001','Nitti__Bo'),
  (2,'AWE-000002','X Tha God');

INSERT INTO artist_media(id,title) VALUES
  (121,'Photo Apr 04 2026, 11 07 08 PM.jpg');
""")

sql=(ROOT/"migrations/0025_archivez_social_public_meta.sql").read_text()
db.executescript(sql)
db.executescript(sql)

db.execute("""
INSERT INTO archive_media_public_meta(
  media_id,public_title,public_caption,updated_by_member_id
) VALUES(121,'X & Guest at High Alert','Backstage at High Alert.',1)
""")
db.execute("INSERT INTO media_likes(media_id,member_id) VALUES(121,1)")
db.execute("INSERT INTO media_likes(media_id,member_id) VALUES(121,2)")

raw=db.execute("SELECT title FROM artist_media WHERE id=121").fetchone()[0]
meta=db.execute("SELECT public_title,public_caption,updated_by_member_id FROM archive_media_public_meta WHERE media_id=121").fetchone()
likes=db.execute("SELECT COUNT(*) FROM media_likes WHERE media_id=121").fetchone()[0]

assert raw=='Photo Apr 04 2026, 11 07 08 PM.jpg'
assert meta==('X & Guest at High Alert','Backstage at High Alert.',1)
assert likes==2

try:
    db.execute("INSERT INTO media_likes(media_id,member_id) VALUES(121,1)")
    raise AssertionError("duplicate like unexpectedly allowed")
except sqlite3.IntegrityError:
    pass

print("PASS: Archivez social layer preserves raw filename, overlays public metadata, and enforces one like per member")
