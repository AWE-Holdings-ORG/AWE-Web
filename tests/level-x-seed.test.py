import sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

CROWD_EXPECTED=[
    ("TmwYVT_gI0Q","X Tha God vs Geminii — Members Only",None),
    ("7s82HgWmML0","X Tha God vs Geminii (Da Rematch) — The Shootout",None),
    ("6JSDWKTBPxw","X Tha God vs Whytboy — Unforeseen Circumstances",None),
    ("ms4r261sQ9c","X Tha God vs Jace — Lost In Space",None),
    ("aCyK8W8y5v0","X Tha God vs Tieso — Crowd Control Vol. 2",None),
    ("dIENORIk-lU","X Tha God vs Fuzhjin — Unforeseen Circumstances 7",None),
    ("ViOv-hJ4uOs","X Tha God vs Rari Lauren — Whyt Noise",None),
    ("2InJIUKuoZY","X Tha God vs Troiyt — Elements","2022-10-15"),
    ("4kHtN7my50A","X Tha God vs Rahmir Henry — Post Elements","2022-10-16"),
    ("xo-TQJUhzJs","X Tha God vs MDK — Unforeseen Circumstances X","2022-10-20"),
    ("bDgH8kdPbEA","X Tha God vs Bearvan — Hostility","2022-11-05"),
    ("-RHWE4oHcFc","X Tha God vs King TR — Don't Die Vol. 1",None),
    ("CyNwV5ir91A","X Tha God vs Luxry — Unforeseen Circumstances",None),
]

EXTERNAL_EXPECTED=[
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

seed_external=(ROOT/"migrations/0008_x_tha_god_verified_media_seed.sql").read_text()
seed_crowd=(ROOT/"migrations/0012_x_tha_god_crowd_owned_battles.sql").read_text()

# Apply each twice to enforce idempotence.
db.executescript(seed_external)
db.executescript(seed_crowd)
db.executescript(seed_external)
db.executescript(seed_crowd)

rows=db.execute("""
SELECT external_id,title,event_date,era_slug,media_type,provider,visibility,sort_order,active,
       source_name,source_url,rights_status
FROM artist_media
ORDER BY sort_order,id
""").fetchall()

assert len(rows)==31, len(rows)
assert len({row[0] for row in rows})==31

crowd_rows=rows[:13]
external_rows=rows[13:]

assert [row[0] for row in crowd_rows]==[item[0] for item in CROWD_EXPECTED]
assert [row[1] for row in crowd_rows]==[item[1] for item in CROWD_EXPECTED]
assert [row[2] for row in crowd_rows]==[item[2] for item in CROWD_EXPECTED]
assert [row[7] for row in crowd_rows]==list(range(1,14))
assert all(row[3]=="crowdshyt-era" for row in crowd_rows)

for external_id,title,event_date,era_slug,media_type,provider,visibility,sort_order,active,source_name,source_url,rights_status in crowd_rows:
    assert media_type=="battle"
    assert provider=="youtube"
    assert visibility=="crown"
    assert active==1
    assert source_name=="The CROWD @CrowdShyt"
    assert source_url==f"https://youtu.be/{external_id}"
    assert rights_status=="gbe-crowd-owned"

assert [row[0] for row in external_rows]==[item[0] for item in EXTERNAL_EXPECTED]
assert [row[1] for row in external_rows]==[item[1] for item in EXTERNAL_EXPECTED]
assert [row[7] for row in external_rows]==list(range(20,38))

for external_id,title,event_date,era_slug,media_type,provider,visibility,sort_order,active,source_name,source_url,rights_status in external_rows:
    assert media_type=="battle"
    assert provider=="youtube"
    assert visibility=="crown"
    assert active==1
    assert source_name=="YouTube"
    assert source_url==f"https://youtu.be/{external_id}"
    assert rights_status=="embed-source"

policies=db.execute("""
SELECT m.external_id,p.access_state,p.teaser_mode,p.cypherz_visible,p.active
FROM media_access_policy p
JOIN artist_media m ON m.id=p.media_id
WHERE m.external_id IN (
  'TmwYVT_gI0Q','7s82HgWmML0','6JSDWKTBPxw','ms4r261sQ9c',
  'aCyK8W8y5v0','dIENORIk-lU','ViOv-hJ4uOs','2InJIUKuoZY',
  '4kHtN7my50A','xo-TQJUhzJs','bDgH8kdPbEA','-RHWE4oHcFc',
  'CyNwV5ir91A'
)
ORDER BY m.sort_order
""").fetchall()

assert len(policies)==13, len(policies)
for external_id,access_state,teaser_mode,cypherz_visible,active in policies:
    assert access_state=="crown"
    assert teaser_mode=="locked"
    assert cypherz_visible==1
    assert active==1

print("PASS: LEVEL X battle catalog is 31/31 = 13 CROWD-owned + 18 external; CROWD dates are verified-only, ordered, CROWN, and idempotent")
