PRAGMA foreign_keys=ON;

-- Verified seed titles/YouTube links supplied in XTG Battles (The CROWD Drive).
-- Dates are intentionally NULL until event/release dates are independently resolved.

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','PbPnUWeZnEQ','https://youtu.be/PbPnUWeZnEQ','Dapper Zay vs X Tha God - Earn Your Keep',NULL,'battle-archive','crown',10,1,'YouTube','https://youtu.be/PbPnUWeZnEQ','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='PbPnUWeZnEQ');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','yFZVNjyiZag','https://youtu.be/yFZVNjyiZag','TGE-VERSE THE EMCEE vs X THA GOD-#TSB2',NULL,'battle-archive','crown',11,1,'YouTube','https://youtu.be/yFZVNjyiZag','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='yFZVNjyiZag');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','lmKO9edF-tw','https://youtu.be/lmKO9edF-tw','TGE-SAINT VIC vs X THA GOD-#TSB3',NULL,'battle-archive','crown',12,1,'YouTube','https://youtu.be/lmKO9edF-tw','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='lmKO9edF-tw');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','ui5-Dn7ngOA','https://youtu.be/ui5-Dn7ngOA','Got Barz TV Presents Writers Block: X Tha God Vs D''Fazzo',NULL,'battle-archive','crown',13,1,'YouTube','https://youtu.be/ui5-Dn7ngOA','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='ui5-Dn7ngOA');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','MskwuJ2wXtQ','https://youtu.be/MskwuJ2wXtQ','X THA GOD vs PENEWYZE - iBattleTV (DEBUT BATTLE)',NULL,'battle-archive','crown',14,1,'YouTube','https://youtu.be/MskwuJ2wXtQ','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='MskwuJ2wXtQ');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','YehpFMwcvhE','https://youtu.be/YehpFMwcvhE','BIG HUNNIT vs X THA GOD - iBattleTV',NULL,'battle-archive','crown',15,1,'YouTube','https://youtu.be/YehpFMwcvhE','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='YehpFMwcvhE');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','XhW9sRGVGGM','https://youtu.be/XhW9sRGVGGM','UNLIMITED BARZ vs X THA GOD - iBattleTV (QUALIFIERS)',NULL,'battle-archive','crown',16,1,'YouTube','https://youtu.be/XhW9sRGVGGM','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='XhW9sRGVGGM');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','UhHZlqSwVxQ','https://youtu.be/UhHZlqSwVxQ','KASH KIDD vs X THA GOD - iBattleTV (Captains Cup ROUND 1)',NULL,'battle-archive','crown',17,1,'YouTube','https://youtu.be/UhHZlqSwVxQ','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='UhHZlqSwVxQ');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','aLPIc7UVtck','https://youtu.be/aLPIc7UVtck','DEXTER vs X THA GOD - iBattleTV',NULL,'battle-archive','crown',18,1,'YouTube','https://youtu.be/aLPIc7UVtck','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='aLPIc7UVtck');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','J6Mjv6VqBak','https://youtu.be/J6Mjv6VqBak','Got Barz TV Presents Kill Confirmed 2: Mega Man Vs X Tha God',NULL,'battle-archive','crown',19,1,'YouTube','https://youtu.be/J6Mjv6VqBak','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='J6Mjv6VqBak');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','LFr3ZRzvlpE','https://youtu.be/LFr3ZRzvlpE','KING BROOK vs X THA GOD - iBattleTV',NULL,'battle-archive','crown',20,1,'YouTube','https://youtu.be/LFr3ZRzvlpE','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='LFr3ZRzvlpE');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','RfLsRaXN1AI','https://youtu.be/RfLsRaXN1AI','TGE-X THA GOD vs MELLO OZZY-#VALLEYVENGEANCE',NULL,'battle-archive','crown',21,1,'YouTube','https://youtu.be/RfLsRaXN1AI','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='RfLsRaXN1AI');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','twPAmENF-fc','https://youtu.be/twPAmENF-fc','X Tha God vs Effex - T.O.Y.S Rap Battle League - Verbal Vendetta',NULL,'battle-archive','crown',22,1,'YouTube','https://youtu.be/twPAmENF-fc','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='twPAmENF-fc');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','_ZfNssDEfEc','https://youtu.be/_ZfNssDEfEc','Conflickt vs X Tha God - T.O.Y.S Rap Battle League - Black Box 2',NULL,'battle-archive','crown',23,1,'YouTube','https://youtu.be/_ZfNssDEfEc','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='_ZfNssDEfEc');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','QuJEFuUBGCk','https://youtu.be/QuJEFuUBGCk','DEEJAYY & X THA GOD vs J MAMBA & MARK HOLLOW - iBattleTV (Tag Team Battle)',NULL,'battle-archive','crown',24,1,'YouTube','https://youtu.be/QuJEFuUBGCk','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='QuJEFuUBGCk');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','D9wG4i1pW-Q','https://youtu.be/D9wG4i1pW-Q','X Tha God Vs Gas Jordon | GotBarz Tv Presents Neutral Groundz',NULL,'battle-archive','crown',25,1,'YouTube','https://youtu.be/D9wG4i1pW-Q','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='D9wG4i1pW-Q');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','AeoEDYdnJzk','https://youtu.be/AeoEDYdnJzk','X Tha God Vs Og Duggie (Championship Battle) Battle In The Yo V: The Great War',NULL,'battle-archive','crown',26,1,'YouTube','https://youtu.be/AeoEDYdnJzk','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='AeoEDYdnJzk');

INSERT INTO artist_media(artist_id,media_type,provider,external_id,canonical_url,title,event_date,era_slug,visibility,sort_order,active,source_name,source_url,rights_status)
SELECT id,'battle','youtube','BMl9Au_6X6k','https://youtu.be/BMl9Au_6X6k','Foet Dev vs X Tha God - T.O.Y.S Rap Battle League - Names Know Bodies 2',NULL,'battle-archive','crown',27,1,'YouTube','https://youtu.be/BMl9Au_6X6k','embed-source'
FROM artists WHERE artist_slug='x-tha-god'
AND NOT EXISTS(SELECT 1 FROM artist_media m WHERE m.provider='youtube' AND m.external_id='BMl9Au_6X6k');
