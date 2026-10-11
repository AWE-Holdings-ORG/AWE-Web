import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

db=sqlite3.connect(":memory:")
db.executescript("""
PRAGMA foreign_keys=ON;

CREATE TABLE houses(
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'general'
);

CREATE TABLE members(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aw_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  crown_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TEXT
);

CREATE TABLE access_events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER,
  event_type TEXT NOT NULL,
  house_slug TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO houses(slug,name,destination) VALUES
  ('the-crowd','The Crowd','/crown/crowd/'),
  ('gbe','Good Business Entertainment','/crown/gbe/');

INSERT INTO members(aw_id,email,crown_name,status) VALUES
  ('AWE-000001','owner@example.test','Nitti__Bo','active'),
  ('AWE-000002','x@example.test','X Tha God','active');
""")

sql=(ROOT/"migrations/0023_player_personal_rosters_and_cheat_codes.sql").read_text()
db.executescript(sql)
db.executescript(sql)

signals=db.execute("""
SELECT signal_slug,canonical_house_slug,display_name
FROM player_signals
ORDER BY signal_slug
""").fetchall()
assert signals==[
  ('big-tali','the-crowd','BIG TALI'),
  ('deejayy','gbe','DEEJAYY'),
  ('x-tha-god','the-crowd','X THA GOD'),
], signals

crowd=db.execute("""
SELECT signal_slug,relationship_status,visible_by_default,sort_order
FROM house_player_roster
WHERE house_slug='the-crowd'
ORDER BY sort_order
""").fetchall()
assert crowd==[
  ('x-tha-god','current',1,10),
  ('big-tali','current',1,20),
], crowd

gbe=db.execute("""
SELECT signal_slug,relationship_status,visible_by_default
FROM house_player_roster
WHERE house_slug='gbe'
""").fetchall()
assert gbe==[('deejayy','current',1)], gbe

legacy=db.execute("""
SELECT m.aw_id,u.house_slug,u.signal_slug,u.unlock_source
FROM member_signal_unlocks u
JOIN members m ON m.id=u.member_id
""").fetchall()
assert legacy==[
  ('AWE-000001','the-crowd','deejayy','legacy-preview')
], legacy

assert db.execute("SELECT COUNT(*) FROM player_cheat_codes").fetchone()[0]==0
assert db.execute("SELECT COUNT(*) FROM player_cheat_redemptions").fetchone()[0]==0

print("PASS: personalized Player roster foundation seeds CROWD=X/Tali, GBE=DeeJayy, owner-only DeeJayy legacy preview, and no invented Cheat Codes")
