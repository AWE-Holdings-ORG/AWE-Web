import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

db=sqlite3.connect(":memory:")
db.executescript("""
PRAGMA foreign_keys=ON;
CREATE TABLE members(
  id INTEGER PRIMARY KEY,
  aw_id TEXT NOT NULL UNIQUE,
  crown_name TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE houses(
  slug TEXT PRIMARY KEY,
  name TEXT,
  destination TEXT,
  audience TEXT
);
INSERT INTO members(id,aw_id,crown_name,status) VALUES
  (1,'AWE-000001','Nitti_Bo','active'),
  (2,'AWE-000002','X Tha God','active'),
  (3,'AWE-000003','OTHER','active');
INSERT INTO houses(slug,name,destination,audience) VALUES
  ('the-crowd','The Crowd','/crown/crowd/','general'),
  ('gbe','Good Business Entertainment','/crown/gbe/','general');
""")

sql=(ROOT/"migrations/0026_house_media_admin_grants.sql").read_text()
db.executescript(sql)
db.executescript(sql)

rows=db.execute("""
SELECT m.aw_id,g.house_slug,g.role_slug,
       g.can_edit_public_meta,g.can_view_source_title,
       g.can_manage_access,g.can_moderate_comments,
       o.aw_id,g.active,g.revoked_at
FROM house_admin_grants g
JOIN members m ON m.id=g.member_id
LEFT JOIN members o ON o.id=g.granted_by_member_id
ORDER BY m.aw_id,g.house_slug
""").fetchall()

assert rows == [
  ('AWE-000002','the-crowd','media-admin',1,1,0,0,'AWE-000001',1,None)
], rows

print("PASS: X Tha God receives only scoped The CROWD media-admin naming authority")
