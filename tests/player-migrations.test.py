import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

db=sqlite3.connect(":memory:")
db.executescript("""
PRAGMA foreign_keys=ON;
CREATE TABLE houses(slug TEXT PRIMARY KEY);
CREATE TABLE artist_media(id INTEGER PRIMARY KEY, visibility TEXT NOT NULL);
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE cypherz_profiles(id INTEGER PRIMARY KEY);

INSERT INTO houses(slug) VALUES ('the-crowd'),('gbe');
INSERT INTO artist_media(id,visibility) VALUES
  (1,'public'),
  (2,'crown'),
  (3,'vault'),
  (4,'legacy-unknown');
INSERT INTO members(id) VALUES (1);
INSERT INTO cypherz_profiles(id) VALUES (1);
""")

db.executescript((ROOT/"migrations/0009_player_access_states.sql").read_text())
db.executescript((ROOT/"migrations/0010_player_access_grants.sql").read_text())

rows=db.execute("""
SELECT media_id,access_state,teaser_mode,cypherz_visible
FROM media_access_policy ORDER BY media_id
""").fetchall()

assert rows == [
  (1,'public','visible',1),
  (2,'crown','locked',1),
  (3,'vault','concealed',0),
  (4,'crown','locked',1),
], rows

db.execute("""
INSERT INTO cypherz_house_access(profile_id,house_slug,source_type)
VALUES(1,'the-crowd','hashtag')
""")

db.execute("""
INSERT INTO media_unlock_grants(media_id,crown_member_id,source_type)
VALUES(2,1,'fragm3nt')
""")

db.execute("""
INSERT INTO media_unlock_grants(media_id,cypherz_profile_id,source_type)
VALUES(3,1,'qr')
""")

try:
  db.execute("""
  INSERT INTO media_unlock_grants(media_id,crown_member_id,cypherz_profile_id)
  VALUES(1,1,1)
  """)
  raise AssertionError("dual-owner unlock grant should fail")
except sqlite3.IntegrityError:
  pass

print("PASS: Player access migrations 0009 + 0010")
