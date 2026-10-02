PRAGMA foreign_keys=ON;

-- X Tha God: CROWD-owned battle catalog recovered from the official
-- @CrowdShyt battle tracker/source. Years are preserved exactly as supplied;
-- exact event dates are populated only when first-party flyer/event evidence resolves them; approximate tracker years remain NULL.
--
-- These are first-party GBE / The CROWD source records. Historical provider
-- view counts from the old tracker are intentionally NOT imported into
-- media_views; Da CROWD Player analytics remain first-party and begin clean.

-- Re-order the previously seeded external catalog behind the CROWD-owned set.
UPDATE artist_media
SET sort_order=CASE external_id
  WHEN 'PbPnUWeZnEQ' THEN 20
  WHEN 'yFZVNjyiZag' THEN 21
  WHEN 'lmKO9edF-tw' THEN 22
  WHEN 'ui5-Dn7ngOA' THEN 23
  WHEN 'MskwuJ2wXtQ' THEN 24
  WHEN 'YehpFMwcvhE' THEN 25
  WHEN 'XhW9sRGVGGM' THEN 26
  WHEN 'UhHZlqSwVxQ' THEN 27
  WHEN 'aLPIc7UVtck' THEN 28
  WHEN 'J6Mjv6VqBak' THEN 29
  WHEN 'LFr3ZRzvlpE' THEN 30
  WHEN 'RfLsRaXN1AI' THEN 31
  WHEN 'twPAmENF-fc' THEN 32
  WHEN '_ZfNssDEfEc' THEN 33
  WHEN 'QuJEFuUBGCk' THEN 34
  WHEN 'D9wG4i1pW-Q' THEN 35
  WHEN 'AeoEDYdnJzk' THEN 36
  WHEN 'BMl9Au_6X6k' THEN 37
  ELSE sort_order
END
WHERE artist_id=(SELECT id FROM artists WHERE artist_slug='x-tha-god')
  AND external_id IN (
    'PbPnUWeZnEQ','yFZVNjyiZag','lmKO9edF-tw','ui5-Dn7ngOA',
    'MskwuJ2wXtQ','YehpFMwcvhE','XhW9sRGVGGM','UhHZlqSwVxQ',
    'aLPIc7UVtck','J6Mjv6VqBak','LFr3ZRzvlpE','RfLsRaXN1AI',
    'twPAmENF-fc','_ZfNssDEfEc','QuJEFuUBGCk','D9wG4i1pW-Q',
    'AeoEDYdnJzk','BMl9Au_6X6k'
  );

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','TmwYVT_gI0Q','https://youtu.be/TmwYVT_gI0Q',
       'X Tha God vs Geminii — Members Only',NULL,'crowdshyt-era','crown',1,1,
       'The CROWD @CrowdShyt','https://youtu.be/TmwYVT_gI0Q','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='TmwYVT_gI0Q');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','7s82HgWmML0','https://youtu.be/7s82HgWmML0',
       'X Tha God vs Geminii (Da Rematch) — The Shootout',NULL,'crowdshyt-era','crown',2,1,
       'The CROWD @CrowdShyt','https://youtu.be/7s82HgWmML0','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='7s82HgWmML0');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','6JSDWKTBPxw','https://youtu.be/6JSDWKTBPxw',
       'X Tha God vs Whytboy — Unforeseen Circumstances',NULL,'crowdshyt-era','crown',3,1,
       'The CROWD @CrowdShyt','https://youtu.be/6JSDWKTBPxw','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='6JSDWKTBPxw');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','ms4r261sQ9c','https://youtu.be/ms4r261sQ9c',
       'X Tha God vs Jace — Lost In Space',NULL,'crowdshyt-era','crown',4,1,
       'The CROWD @CrowdShyt','https://youtu.be/ms4r261sQ9c','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='ms4r261sQ9c');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','aCyK8W8y5v0','https://youtu.be/aCyK8W8y5v0',
       'X Tha God vs Tieso — Crowd Control Vol. 2',NULL,'crowdshyt-era','crown',5,1,
       'The CROWD @CrowdShyt','https://youtu.be/aCyK8W8y5v0','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='aCyK8W8y5v0');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','dIENORIk-lU','https://youtu.be/dIENORIk-lU',
       'X Tha God vs Fuzhjin — Unforeseen Circumstances 7',NULL,'crowdshyt-era','crown',6,1,
       'The CROWD @CrowdShyt','https://youtu.be/dIENORIk-lU','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='dIENORIk-lU');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','ViOv-hJ4uOs','https://youtu.be/ViOv-hJ4uOs',
       'X Tha God vs Rari Lauren — Whyt Noise',NULL,'crowdshyt-era','crown',7,1,
       'The CROWD @CrowdShyt','https://youtu.be/ViOv-hJ4uOs','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='ViOv-hJ4uOs');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','2InJIUKuoZY','https://youtu.be/2InJIUKuoZY',
       'X Tha God vs Troiyt — Elements','2022-10-15','crowdshyt-era','crown',8,1,
       'The CROWD @CrowdShyt','https://youtu.be/2InJIUKuoZY','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='2InJIUKuoZY');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','4kHtN7my50A','https://youtu.be/4kHtN7my50A',
       'X Tha God vs Rahmir Henry — Post Elements','2022-10-16','crowdshyt-era','crown',9,1,
       'The CROWD @CrowdShyt','https://youtu.be/4kHtN7my50A','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='4kHtN7my50A');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','xo-TQJUhzJs','https://youtu.be/xo-TQJUhzJs',
       'X Tha God vs MDK — Unforeseen Circumstances X','2022-10-20','crowdshyt-era','crown',10,1,
       'The CROWD @CrowdShyt','https://youtu.be/xo-TQJUhzJs','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='xo-TQJUhzJs');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','bDgH8kdPbEA','https://youtu.be/bDgH8kdPbEA',
       'X Tha God vs Bearvan — Hostility','2022-11-05','crowdshyt-era','crown',11,1,
       'The CROWD @CrowdShyt','https://youtu.be/bDgH8kdPbEA','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='bDgH8kdPbEA');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','-RHWE4oHcFc','https://youtu.be/-RHWE4oHcFc',
       'X Tha God vs King TR — Don''t Die Vol. 1',NULL,'crowdshyt-era','crown',12,1,
       'The CROWD @CrowdShyt','https://youtu.be/-RHWE4oHcFc','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='-RHWE4oHcFc');

INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,source_name,source_url,rights_status
)
SELECT id,'battle','youtube','CyNwV5ir91A','https://youtu.be/CyNwV5ir91A',
       'X Tha God vs Luxry — Unforeseen Circumstances',NULL,'crowdshyt-era','crown',13,1,
       'The CROWD @CrowdShyt','https://youtu.be/CyNwV5ir91A','gbe-crowd-owned'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media WHERE provider='youtube' AND external_id='CyNwV5ir91A');

-- New rows were inserted after migration 0009, so give them explicit resolver policy.
INSERT OR IGNORE INTO media_access_policy(
  media_id,access_state,teaser_mode,cypherz_visible,active
)
SELECT id,'crown','locked',1,1
FROM artist_media
WHERE artist_id=(SELECT id FROM artists WHERE artist_slug='x-tha-god')
  AND external_id IN (
    'TmwYVT_gI0Q','7s82HgWmML0','6JSDWKTBPxw','ms4r261sQ9c',
    'aCyK8W8y5v0','dIENORIk-lU','ViOv-hJ4uOs','2InJIUKuoZY',
    '4kHtN7my50A','xo-TQJUhzJs','bDgH8kdPbEA','-RHWE4oHcFc',
    'CyNwV5ir91A'
  );
