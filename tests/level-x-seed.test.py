import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXPECTED=[
    ("PbPnUWeZnEQ","Dapper Zay vs X Tha God - Earn Your Keep"),
    ("yFZVNjyiZag","TGE-VERSE THE EMCEE vs X THA GOD-#TSB2"),
    ("lmKO9edF-tw","TGE-SAINT VIC vs X THA GOD-#TSB3"),
    ("ui5-Dn7ngOA","Got Barz TV Presents Writers Block: X Tha God Vs D'Fazzo"),
    ("MskwuJ2wXtQ","X THA GOD vs PENEWYZE - iBattleTV (DEBUT BATTLE)"),
    ("YehpFMwcvhE","BIG HUNNIT vs X THA GOD - iBattleTV"),
    ("XhW9sRGVGGM","UNLIMITED BARZ vs X THA GOD - iBattleTV (QUALIFIERS)"),
    ("UhHZlqSwVxQ","KASH KIDD vs X THA GOD - iBattleTV (Captains Cup ROUND 1)"),
    ("aLPIc7UVtck","DEXTER vs X THA GOD - iBattleTV"),
    ("J6Mjv6VqBak","Got Barz TV Presents Kill Confirmed 2: Mega Man Vs X Tha God"),
    ("LFr3ZRzvlpE","KING BROOK vs X THA GOD - iBattleTV"),
    ("RfLsRaXN1AI","TGE-X THA GOD vs MELLO OZZY-#VALLEYVENGEANCE"),
    ("twPAmENF-fc","X Tha God vs Effex - T.O.Y.S Rap Battle League - Verbal Vendetta"),
    ("_ZfNssDEfEc","Conflickt vs X Tha God - T.O.Y.S Rap Battle League - Black Box 2"),
    ("QuJEFuUBGCk","DEEJAYY & X THA GOD vs J MAMBA & MARK HOLLOW - iBattleTV (Tag Team Battle)"),
    ("D9wG4i1pW-Q","X Tha God Vs Gas Jordon | GotBarz Tv Presents Neutral Groundz"),
    ("AeoEDYdnJzk","X Tha God Vs Og Duggie (Championship Battle) Battle In The Yo V: The Great War"),
    ("BMl9Au_6X6k","Foet Dev vs X Tha God - T.O.Y.S Rap Battle League - Names Know Bodies 2"),
]

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
INSERT INTO artists(id,artist_slug) VALUES(1,'x-tha-god');
""")

seed=(ROOT/"migrations/0008_x_tha_god_verified_media_seed.sql").read_text()
db.executescript(seed)
db.executescript(seed)

rows=db.execute("""
SELECT external_id,title,media_type,provider,visibility,sort_order,active,
       source_name,source_url,rights_status
FROM artist_media
ORDER BY sort_order,id
""").fetchall()

assert len(rows)==18, len(rows)
assert len({row[0] for row in rows})==18
assert [row[0] for row in rows]==[item[0] for item in EXPECTED]
assert [row[1] for row in rows]==[item[1] for item in EXPECTED]
assert [row[5] for row in rows]==list(range(10,28))
for external_id,title,media_type,provider,visibility,sort_order,active,source_name,source_url,rights_status in rows:
    assert media_type=="battle"
    assert provider=="youtube"
    assert visibility=="crown"
    assert active==1
    assert source_name=="YouTube"
    assert source_url==f"https://youtu.be/{external_id}"
    assert rights_status=="embed-source"

print("PASS: LEVEL X verified battle seed is 18/18, ordered, unique, CROWN, and idempotent")
