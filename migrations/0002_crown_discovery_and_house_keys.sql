PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS house_keys (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 key_slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
 house_slug TEXT NOT NULL,
 destination TEXT,
 kind TEXT NOT NULL DEFAULT 'house',
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(house_slug) REFERENCES houses(slug)
);

CREATE TABLE IF NOT EXISTS member_discoveries (
 member_id INTEGER NOT NULL,
 house_slug TEXT NOT NULL,
 discovery_key TEXT,
 discovered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 last_visited_at TEXT,
 PRIMARY KEY(member_id,house_slug),
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
 FOREIGN KEY(house_slug) REFERENCES houses(slug)
);

INSERT OR IGNORE INTO house_keys(key_slug,house_slug,destination,kind,active)
VALUES('crowdshyt','the-crowd','/crown/crowd/','house',1);

-- Preserve User 01's already-completed CROWD discovery from the preview vertical slice.
INSERT OR IGNORE INTO member_discoveries(member_id,house_slug,discovery_key,discovered_at,last_visited_at)
SELECT m.id,'the-crowd','crowdshyt',datetime('now'),datetime('now')
FROM members m
JOIN member_access a ON a.member_id=m.id AND a.house_slug='the-crowd' AND a.active=1
WHERE m.aw_id='AWE-000001';

CREATE INDEX IF NOT EXISTS idx_house_keys_house ON house_keys(house_slug);
CREATE INDEX IF NOT EXISTS idx_discoveries_member ON member_discoveries(member_id);
