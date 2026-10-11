PRAGMA foreign_keys=ON;

-- X Tha God external battle reconciliation.
-- Adds public-provider battles independently verified after the original 0008 seed.
-- Does not include pending first-party/CROWD leads or unverified provider records.

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','jKl0NU9K8hE','https://youtu.be/jKl0NU9K8hE',
       'DEEJAYY vs X THA GOD - iBattleTV','2024-06-15',
       'external-reconciled','crown',38,1,
       'YouTube','https://youtu.be/jKl0NU9K8hE','embed-source'
FROM artists
WHERE artist_slug='x-tha-god'
AND NOT EXISTS(
  SELECT 1 FROM artist_media
  WHERE provider='youtube' AND external_id='jKl0NU9K8hE'
);

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','twjhGe-nJCw','https://youtu.be/twjhGe-nJCw',
       'Tino vs X Tha God — Back 2 Business','2024-11-02',
       'external-reconciled','crown',39,1,
       'YouTube','https://youtu.be/twjhGe-nJCw','embed-source'
FROM artists
WHERE artist_slug='x-tha-god'
AND NOT EXISTS(
  SELECT 1 FROM artist_media
  WHERE provider='youtube' AND external_id='twjhGe-nJCw'
);

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','xgupv_oiIQ8','https://youtu.be/xgupv_oiIQ8',
       'Chuck Lucci vs X Tha God — Insidious','2023-09-30',
       'external-reconciled','crown',40,1,
       'YouTube','https://youtu.be/xgupv_oiIQ8','embed-source'
FROM artists
WHERE artist_slug='x-tha-god'
AND NOT EXISTS(
  SELECT 1 FROM artist_media
  WHERE provider='youtube' AND external_id='xgupv_oiIQ8'
);

INSERT OR IGNORE INTO media_access_policy(
  media_id,access_state,teaser_mode,cypherz_visible,active
)
SELECT id,'crown','locked',1,1
FROM artist_media
WHERE artist_id=(SELECT id FROM artists WHERE artist_slug='x-tha-god')
  AND external_id IN ('jKl0NU9K8hE','twjhGe-nJCw','xgupv_oiIQ8');
