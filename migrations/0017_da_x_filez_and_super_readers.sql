PRAGMA foreign_keys=ON;

-- Da X Filez collection foundation + X archive presentation metadata.
--
-- Collection identity and access policy are intentionally separate:
-- collection answers WHAT a media item belongs to;
-- media_access_policy answers WHO may see it.
--
-- Existing access ladder remains:
-- PUBLIC -> HOUSE -> UNLOCK -> CROWN -> VAULT.

CREATE TABLE IF NOT EXISTS player_media_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  collection_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  default_access_state TEXT NOT NULL DEFAULT 'public'
    CHECK(default_access_state IN ('public','house','unlock','crown','vault')),
  sort_order INTEGER NOT NULL DEFAULT 100,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  UNIQUE(artist_id,collection_slug),
  FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player_media_collection_items (
  collection_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  file_code TEXT,
  is_primary INTEGER NOT NULL DEFAULT 1 CHECK(is_primary IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 100,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  PRIMARY KEY(collection_id,media_id),
  FOREIGN KEY(collection_id) REFERENCES player_media_collections(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_player_media_primary_collection
  ON player_media_collection_items(media_id)
  WHERE is_primary=1 AND active=1;

CREATE INDEX IF NOT EXISTS idx_player_media_collection_items
  ON player_media_collection_items(collection_id,active,sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS ux_player_media_collection_code
  ON player_media_collection_items(collection_id,file_code)
  WHERE file_code IS NOT NULL AND active=1;

INSERT OR IGNORE INTO player_media_collections(
  artist_id,collection_slug,display_name,description,default_access_state,sort_order,active
)
SELECT id,'da-x-filez','Da X Filez',
       'X Tha God image and interview archive. Launch default is PUBLIC; X may reclassify individual files through the existing Player access ladder.',
       'public',20,1
FROM artists
WHERE artist_slug='x-tha-god';

-- Existing and future imported X photos/images/portraits/interviews default into
-- Da X Filez unless a primary collection assignment already exists.
INSERT OR IGNORE INTO player_media_collection_items(
  collection_id,media_id,is_primary,sort_order,active
)
SELECT c.id,m.id,1,m.sort_order,1
FROM player_media_collections c
JOIN artist_media m ON m.artist_id=c.artist_id
WHERE c.collection_slug='da-x-filez'
  AND lower(m.media_type) IN ('image','photo','portrait','interview')
  AND NOT EXISTS(
    SELECT 1 FROM player_media_collection_items pci
    WHERE pci.media_id=m.id AND pci.is_primary=1 AND pci.active=1
  );

-- Da X Filez launches PUBLIC-first by owner direction.
-- This is an initial/default classification, not a permanent override.
-- X may later reclassify any individual file to HOUSE / UNLOCK / CROWN / VAULT.
INSERT OR IGNORE INTO media_access_policy(
  media_id,access_state,teaser_mode,cypherz_visible,active
)
SELECT i.media_id,'public','visible',1,1
FROM player_media_collection_items i
JOIN player_media_collections c ON c.id=i.collection_id
WHERE c.collection_slug='da-x-filez' AND i.active=1;

UPDATE media_access_policy
SET access_state='public',
    house_slug=NULL,
    unlock_slug=NULL,
    teaser_mode='visible',
    cypherz_visible=1,
    active=1,
    updated_at=CURRENT_TIMESTAMP
WHERE media_id IN (
  SELECT i.media_id
  FROM player_media_collection_items i
  JOIN player_media_collections c ON c.id=i.collection_id
  WHERE c.collection_slug='da-x-filez' AND i.active=1
);

UPDATE artist_media
SET visibility='public'
WHERE id IN (
  SELECT i.media_id
  FROM player_media_collection_items i
  JOIN player_media_collections c ON c.id=i.collection_id
  WHERE c.collection_slug='da-x-filez' AND i.active=1
);

-- Provider thumbnails are presentation metadata, not event-date evidence.
-- For YouTube records, preserve the standard provider thumbnail URL so LEVEL X
-- can visually surface the same art viewers see on the source video.
UPDATE artist_media
SET thumbnail_url='https://i.ytimg.com/vi/' || external_id || '/hqdefault.jpg'
WHERE artist_id=(SELECT id FROM artists WHERE artist_slug='x-tha-god')
  AND provider='youtube'
  AND external_id IS NOT NULL
  AND TRIM(external_id)<>''
  AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');

-- Super Readers is an owned battle-event series in the CROWD ecosystem.
-- The specific B3h9fKRPimI YouTube source remains source-provenance data;
-- event ownership is represented at the event layer instead of being conflated
-- with upload/provider ownership. Exact battle event date remains unknown.
INSERT OR IGNORE INTO player_events(
  event_slug,display_name,event_date,time_text,platform,organizer,
  rights_status,evidence_status,evidence_note
) VALUES(
  'super-readers-x-vs-og-duggie',
  'Super Readers',
  NULL,
  NULL,
  'battle event',
  'Big Tali / Stardom / The CROWD',
  'gbe-crowd-owned',
  'owner-confirmed',
  'Enterprise owner confirmed Super Readers is a battle-event series held by Big Tali and belongs to The CROWD ecosystem. Big Tali also runs Stardom, formerly Demon Time Battle League. The 2023-05-18 date remains provider release context only; exact battle event date is still pending.'
);

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.provider='youtube' AND m.external_id='B3h9fKRPimI'
WHERE e.event_slug='super-readers-x-vs-og-duggie';
