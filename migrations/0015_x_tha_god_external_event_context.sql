PRAGMA foreign_keys=ON;

-- Event context for verified external X Tha God battles introduced by 0014.
-- Event date is distinct from provider release/publication date.

INSERT OR IGNORE INTO player_events(
  event_slug,display_name,event_date,time_text,platform,organizer,
  rights_status,evidence_status,evidence_note
) VALUES
(
  'insidious-2023-09-30',
  'Insidious',
  '2023-09-30',
  NULL,
  'battle event',
  'Stardom (formerly Demon Time Battle League)',
  'external',
  'verified-public-index',
  'Rap Verdict identifies event Sep 30 2023 and provider release Oct 4 2023 for Chuck Lucci vs X Tha God; YouTube ID xgupv_oiIQ8. Enterprise owner confirms Demon Time Battle League was renamed Stardom and is run by Big Tali. Provider/source rights remain separately classified.'
),
(
  'sunfall-2024-06-15',
  'Sunfall',
  '2024-06-15',
  NULL,
  'battle event',
  'iBattleTV',
  'external',
  'verified-public-index',
  'VerseTracker event page dates Sunfall June 15 2024; Deejayy vs X Tha God provider release is July 24 2024; YouTube ID jKl0NU9K8hE.'
),
(
  'back-2-business-2024-11-02',
  'Back 2 Business',
  '2024-11-02',
  NULL,
  'battle event',
  'The Grizz Exam Battles',
  'external',
  'verified-public-index',
  'Rap Verdict identifies event Nov 2 2024 and provider release Dec 2 2024 for Tino vs X Tha God; YouTube ID twjhGe-nJCw.'
);

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.external_id='xgupv_oiIQ8'
WHERE e.event_slug='insidious-2023-09-30';

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.external_id='jKl0NU9K8hE'
WHERE e.event_slug='sunfall-2024-06-15';

INSERT OR IGNORE INTO player_event_media(event_id,media_id,relation_role,sort_order)
SELECT e.id,m.id,'primary',0
FROM player_events e
JOIN artist_media m ON m.external_id='twjhGe-nJCw'
WHERE e.event_slug='back-2-business-2024-11-02';
