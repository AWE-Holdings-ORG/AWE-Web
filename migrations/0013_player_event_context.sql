PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS player_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  event_date TEXT,
  time_text TEXT,
  platform TEXT,
  organizer TEXT,
  rights_status TEXT NOT NULL DEFAULT 'unverified',
  evidence_status TEXT NOT NULL DEFAULT 'pending',
  evidence_note TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);

CREATE TABLE IF NOT EXISTS player_event_media (
  event_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  relation_role TEXT NOT NULL DEFAULT 'primary',
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(event_id,media_id),
  FOREIGN KEY(event_id) REFERENCES player_events(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player_event_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  media_id INTEGER,
  artifact_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT,
  source_url TEXT NOT NULL,
  title TEXT,
  rights_status TEXT NOT NULL DEFAULT 'unverified',
  evidence_note TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  FOREIGN KEY(event_id) REFERENCES player_events(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS player_event_spaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  space_id TEXT,
  space_url TEXT,
  display_time_text TEXT,
  host_handle TEXT,
  source_post_url TEXT,
  replay_status TEXT,
  evidence_note TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  FOREIGN KEY(event_id) REFERENCES player_events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_player_event_media_media
  ON player_event_media(media_id);

CREATE INDEX IF NOT EXISTS idx_player_event_artifacts_event
  ON player_event_artifacts(event_id);

CREATE INDEX IF NOT EXISTS idx_player_event_spaces_event
  ON player_event_spaces(event_id);

-- Verified X Tha God CROWD event context only.
INSERT OR IGNORE INTO player_events(
  event_slug,display_name,event_date,time_text,platform,organizer,
  rights_status,evidence_status,evidence_note
) VALUES
(
  'elements-2022-10-15',
  'Elements',
  '2022-10-15',
  '9 PM EST (as printed on flyer)',
  'X/Twitter Spaces / CROWD battle event',
  'The CROWD',
  'gbe-crowd-owned',
  'verified',
  'First-party The CROWD Drive flyer ElementsPoster.heic prints X Tha God vs Troiyt, October 15th, 9 PM EST.'
),
(
  'post-elements-2022-10-16',
  'Post Elements',
  '2022-10-16',
  '5 PM PST / 8 PM EST (as printed on flyer)',
  'X/Twitter Spaces / CROWD battle event',
  'The CROWD',
  'gbe-crowd-owned',
  'verified',
  'First-party The CROWD Drive flyer IMG_3817.JPG prints X Tha God vs Rahmir, Sunday Oct 16, 5 PM PST / 8 PM EST.'
),
(
  'unforeseen-circumstances-x-2022-10-20',
  'Unforeseen Circumstances X',
  '2022-10-20',
  '6 PM PST / 9 PM EST (as printed on event card)',
  'X/Twitter Spaces / CROWD battle event',
  'The CROWD',
  'gbe-crowd-owned',
  'high',
  'First-party UCX Drive event card prints Oct 20th, 6 PM PST / 9 PM EST. X vs MDK is established by first-party xVmdk.mp4 plus official @CrowdShyt upload title.'
),
(
  'hostility-vol-1-2022-11-05',
  'Hostility Vol. 1',
  '2022-11-05',
  '9 PM EST (as printed on flyer)',
  'X/Twitter Spaces / CROWD battle event',
  'The CROWD',
  'gbe-crowd-owned',
  'verified',
  'First-party Hostility Vol 1 Drive flyer IMG_3822.JPG prints X Tha God vs Bearvan, Saturday 11/5, 9 PM EST.'
);

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.external_id='2InJIUKuoZY'
WHERE e.event_slug='elements-2022-10-15';

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.external_id='4kHtN7my50A'
WHERE e.event_slug='post-elements-2022-10-16';

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.external_id='xo-TQJUhzJs'
WHERE e.event_slug='unforeseen-circumstances-x-2022-10-20';

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.external_id='bDgH8kdPbEA'
WHERE e.event_slug='hostility-vol-1-2022-11-05';

INSERT INTO player_event_artifacts(
  event_id,media_id,artifact_type,provider,external_id,source_url,title,rights_status,evidence_note
)
SELECT e.id,m.id,'matchup-flyer','google-drive','1kzpnev6I6YY7DJWbVpbwYkKrbI9jL7qq',
       'https://drive.google.com/file/d/1kzpnev6I6YY7DJWbVpbwYkKrbI9jL7qq/view',
       'ElementsPoster.heic','gbe-crowd-owned',
       'Prints X Tha God vs Troiyt and October 15th, 9 PM EST.'
FROM player_events e
JOIN artist_media m ON m.external_id='2InJIUKuoZY'
WHERE e.event_slug='elements-2022-10-15'
AND NOT EXISTS(
  SELECT 1 FROM player_event_artifacts a
  WHERE a.provider='google-drive' AND a.external_id='1kzpnev6I6YY7DJWbVpbwYkKrbI9jL7qq'
);

INSERT INTO player_event_artifacts(
  event_id,media_id,artifact_type,provider,external_id,source_url,title,rights_status,evidence_note
)
SELECT e.id,m.id,'matchup-flyer','google-drive','1fyAeYhvDZ6hwWg5eSViQt8wFDXiXqfgT',
       'https://drive.google.com/file/d/1fyAeYhvDZ6hwWg5eSViQt8wFDXiXqfgT/view',
       'IMG_3817.JPG','gbe-crowd-owned',
       'Prints X Tha God vs Rahmir and Sunday Oct 16, 5 PM PST / 8 PM EST.'
FROM player_events e
JOIN artist_media m ON m.external_id='4kHtN7my50A'
WHERE e.event_slug='post-elements-2022-10-16'
AND NOT EXISTS(
  SELECT 1 FROM player_event_artifacts a
  WHERE a.provider='google-drive' AND a.external_id='1fyAeYhvDZ6hwWg5eSViQt8wFDXiXqfgT'
);

INSERT INTO player_event_artifacts(
  event_id,media_id,artifact_type,provider,external_id,source_url,title,rights_status,evidence_note
)
SELECT e.id,m.id,'event-card','google-drive','1SjQXLlghCHmCOfCMkuzGTsq0TwjrSGLF',
       'https://drive.google.com/file/d/1SjQXLlghCHmCOfCMkuzGTsq0TwjrSGLF/view',
       'IMG_3863.JPG','gbe-crowd-owned',
       'General UCX event card prints Oct 20th, 6 PM PST / 9 PM EST; matchup established by separate first-party battle asset.'
FROM player_events e
JOIN artist_media m ON m.external_id='xo-TQJUhzJs'
WHERE e.event_slug='unforeseen-circumstances-x-2022-10-20'
AND NOT EXISTS(
  SELECT 1 FROM player_event_artifacts a
  WHERE a.provider='google-drive' AND a.external_id='1SjQXLlghCHmCOfCMkuzGTsq0TwjrSGLF'
);

INSERT INTO player_event_artifacts(
  event_id,media_id,artifact_type,provider,external_id,source_url,title,rights_status,evidence_note
)
SELECT e.id,m.id,'battle-source','google-drive','1haau5t7eoN_YwsH5iIwGu0PCig_5SHQe',
       'https://drive.google.com/file/d/1haau5t7eoN_YwsH5iIwGu0PCig_5SHQe/view',
       'xVmdk.mp4','gbe-crowd-owned',
       'First-party UCX battle source asset for X Tha God vs MDK.'
FROM player_events e
JOIN artist_media m ON m.external_id='xo-TQJUhzJs'
WHERE e.event_slug='unforeseen-circumstances-x-2022-10-20'
AND NOT EXISTS(
  SELECT 1 FROM player_event_artifacts a
  WHERE a.provider='google-drive' AND a.external_id='1haau5t7eoN_YwsH5iIwGu0PCig_5SHQe'
);

INSERT INTO player_event_artifacts(
  event_id,media_id,artifact_type,provider,external_id,source_url,title,rights_status,evidence_note
)
SELECT e.id,m.id,'matchup-flyer','google-drive','1EDyEmLfHwy-XeTWCcFCWTDyAyL0ILWN6',
       'https://drive.google.com/file/d/1EDyEmLfHwy-XeTWCcFCWTDyAyL0ILWN6/view',
       'IMG_3822.JPG','gbe-crowd-owned',
       'Prints X Tha God vs Bearvan, Saturday 11/5, 9 PM EST.'
FROM player_events e
JOIN artist_media m ON m.external_id='bDgH8kdPbEA'
WHERE e.event_slug='hostility-vol-1-2022-11-05'
AND NOT EXISTS(
  SELECT 1 FROM player_event_artifacts a
  WHERE a.provider='google-drive' AND a.external_id='1EDyEmLfHwy-XeTWCcFCWTDyAyL0ILWN6'
);

INSERT INTO player_event_artifacts(
  event_id,media_id,artifact_type,provider,external_id,source_url,title,rights_status,evidence_note
)
SELECT e.id,m.id,'battle-source','google-drive','1tk8to-vUEA9REsZsMRn3RTmSVxap5SEL',
       'https://drive.google.com/file/d/1tk8to-vUEA9REsZsMRn3RTmSVxap5SEL/view',
       'xVbear.mp4','gbe-crowd-owned',
       'First-party Hostility Vol 1 battle source asset for X Tha God vs Bearvan.'
FROM player_events e
JOIN artist_media m ON m.external_id='bDgH8kdPbEA'
WHERE e.event_slug='hostility-vol-1-2022-11-05'
AND NOT EXISTS(
  SELECT 1 FROM player_event_artifacts a
  WHERE a.provider='google-drive' AND a.external_id='1tk8to-vUEA9REsZsMRn3RTmSVxap5SEL'
);
