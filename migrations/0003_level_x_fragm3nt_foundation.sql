PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS artists (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 artist_slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
 display_name TEXT NOT NULL,
 artist_number INTEGER UNIQUE,
 status TEXT NOT NULL DEFAULT 'active',
 primary_house_slug TEXT,
 label_house_slug TEXT,
 public_bio TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(primary_house_slug) REFERENCES houses(slug),
 FOREIGN KEY(label_house_slug) REFERENCES houses(slug)
);

CREATE TABLE IF NOT EXISTS artist_media (
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
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fragm3nt_definitions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 fragm3nt_slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
 serial_code TEXT UNIQUE,
 name TEXT NOT NULL,
 classification TEXT NOT NULL DEFAULT 'standard',
 rarity TEXT NOT NULL DEFAULT 'common',
 description TEXT,
 house_slug TEXT,
 artist_id INTEGER,
 parent_fragm3nt_id INTEGER,
 parts_required INTEGER,
 hidden INTEGER NOT NULL DEFAULT 0,
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(house_slug) REFERENCES houses(slug),
 FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE SET NULL,
 FOREIGN KEY(parent_fragm3nt_id) REFERENCES fragm3nt_definitions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS member_fragm3ntz (
 member_id INTEGER NOT NULL,
 fragm3nt_id INTEGER NOT NULL,
 acquired_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 source_type TEXT,
 source_ref TEXT,
 serial_number TEXT,
 metadata_json TEXT,
 PRIMARY KEY(member_id,fragm3nt_id),
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
 FOREIGN KEY(fragm3nt_id) REFERENCES fragm3nt_definitions(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO artists(artist_slug,display_name,artist_number,status,primary_house_slug,label_house_slug)
VALUES('x-tha-god','X Tha God',1,'the-crowd','gbe');

CREATE INDEX IF NOT EXISTS idx_artist_media_artist ON artist_media(artist_id,active,sort_order);
CREATE INDEX IF NOT EXISTS idx_fragm3nt_artist ON fragm3nt_definitions(artist_id);
CREATE INDEX IF NOT EXISTS idx_member_fragm3ntz_member ON member_fragm3ntz(member_id,acquired_at);
