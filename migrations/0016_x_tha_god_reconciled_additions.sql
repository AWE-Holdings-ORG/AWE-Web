PRAGMA foreign_keys=ON;

-- X Tha God reconciled additions beyond the historical 13-row CROWD seed
-- and the 0014 external reconciliation.
--
-- Adds:
-- 1) X Tha God vs OG Duggie — Super Readers
--    Distinct from the later championship battle already seeded in 0008.
--    Super Readers event ownership is represented separately by migration 0017.
--    This row preserves provider/source provenance. Release context is independently
--    corroborated as 2023-05-18, but the exact battle event date remains unknown
--    and is intentionally NULL.
-- 2) X Tha God vs Big Kannon — Training Day
--    First-party The CROWD Drive source plus recovered matchup card and
--    public Training Day Space chronology verify the event date 2024-01-07.

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','google-drive','1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks',
       'https://drive.google.com/file/d/1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks/view',
       'X Tha God vs Big Kannon — Training Day','2024-01-07',
       'crowd-reconciled','crown',14,1,
       'The CROWD Drive',
       'https://drive.google.com/file/d/1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks/view',
       'gbe-crowd-owned'
FROM artists
WHERE artist_slug='x-tha-god'
AND NOT EXISTS(
  SELECT 1 FROM artist_media
  WHERE provider='google-drive' AND external_id='1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks'
);

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','B3h9fKRPimI','https://youtu.be/B3h9fKRPimI',
       'X Tha God vs OG Duggie — Super Readers',NULL,
       'external-reconciled','crown',41,1,
       'YouTube','https://youtu.be/B3h9fKRPimI','embed-source'
FROM artists
WHERE artist_slug='x-tha-god'
AND NOT EXISTS(
  SELECT 1 FROM artist_media
  WHERE provider='youtube' AND external_id='B3h9fKRPimI'
);

INSERT OR IGNORE INTO media_access_policy(
  media_id,access_state,teaser_mode,cypherz_visible,active
)
SELECT id,'crown','locked',1,1
FROM artist_media
WHERE artist_id=(SELECT id FROM artists WHERE artist_slug='x-tha-god')
  AND external_id IN ('1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks','B3h9fKRPimI');

INSERT OR IGNORE INTO player_events(
  event_slug,display_name,event_date,time_text,platform,organizer,
  rights_status,evidence_status,evidence_note
) VALUES(
  'training-day-2024-01-07',
  'Training Day',
  '2024-01-07',
  NULL,
  'X/Twitter Spaces / CROWD battle event',
  'WE THE FANS × The CROWD',
  'gbe-crowd-owned',
  'verified-cross-source',
  'First-party The CROWD Drive contains XVSKannon.mp4; recovered Training Day card binds X Tha God vs Big Kannon; public Spaces archive records WE THE FANS x THE CROWD PRESENTS TRAINING DAY HOSTED BY JAYBLAC on Jan 7 2024. Exact Space URL/time remain pending.'
);

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.provider='google-drive'
  AND m.external_id='1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks'
WHERE e.event_slug='training-day-2024-01-07';

INSERT INTO player_event_artifacts(
  event_id,media_id,artifact_type,provider,external_id,source_url,title,
  rights_status,evidence_note
)
SELECT e.id,m.id,'battle-source','google-drive',
       '1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks',
       'https://drive.google.com/file/d/1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks/view',
       'XVSKannon.mp4','gbe-crowd-owned',
       'First-party The CROWD source asset for X Tha God vs Big Kannon — Training Day.'
FROM player_events e
JOIN artist_media m ON m.provider='google-drive'
  AND m.external_id='1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks'
WHERE e.event_slug='training-day-2024-01-07'
AND NOT EXISTS(
  SELECT 1 FROM player_event_artifacts a
  WHERE a.provider='google-drive'
    AND a.external_id='1oUWUKwCG8GFLxLuS3kH43pSqyGAb-cks'
);
