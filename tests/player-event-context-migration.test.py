import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

db=sqlite3.connect(":memory:")
db.executescript("""
PRAGMA foreign_keys=ON;
CREATE TABLE artist_media(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT UNIQUE
);
INSERT INTO artist_media(external_id) VALUES
('2InJIUKuoZY'),
('4kHtN7my50A'),
('xo-TQJUhzJs'),
('bDgH8kdPbEA');
""")

sql=(ROOT/"migrations/0013_player_event_context.sql").read_text()
db.executescript(sql)
db.executescript(sql)

events=db.execute("""
SELECT event_slug,display_name,event_date,time_text,rights_status,evidence_status
FROM player_events
ORDER BY event_date,event_slug
""").fetchall()

assert len(events)==5, events
expected={
  "lost-in-space-2022-08-06":("Lost In Space","2022-08-06",None,"gbe-crowd-owned","high"),
  "elements-2022-10-15":("Elements","2022-10-15","9 PM EST (as printed on flyer)","gbe-crowd-owned","verified"),
  "post-elements-2022-10-16":("Post Elements","2022-10-16","5 PM PST / 8 PM EST (as printed on flyer)","gbe-crowd-owned","verified"),
  "unforeseen-circumstances-x-2022-10-20":("Unforeseen Circumstances X","2022-10-20","6 PM PST / 9 PM EST (as printed on event card)","gbe-crowd-owned","high"),
  "hostility-vol-1-2022-11-05":("Hostility Vol. 1","2022-11-05","9 PM EST (as printed on flyer)","gbe-crowd-owned","verified"),
}
for slug,name,date,time_text,rights,status in events:
    assert (name,date,time_text,rights,status)==expected[slug]

links=db.execute("""
SELECT e.event_slug,m.external_id,em.relation_role
FROM player_event_media em
JOIN player_events e ON e.id=em.event_id
JOIN artist_media m ON m.id=em.media_id
ORDER BY e.event_date
""").fetchall()
assert len(links)==5, links
assert all(role=="primary" for _,_,role in links)

artifacts=db.execute("""
SELECT a.external_id,a.artifact_type,a.rights_status
FROM player_event_artifacts a
ORDER BY a.external_id
""").fetchall()
assert len(artifacts)==6, artifacts
assert len({row[0] for row in artifacts})==6
assert all(row[2]=="gbe-crowd-owned" for row in artifacts)

assert db.execute("SELECT COUNT(*) FROM player_event_spaces").fetchone()[0]==0

print("PASS: Player event context 0013 is additive, idempotent, and seeds only verified X CROWD evidence")
