# SCRYPT-CROWN-008 — Da CROWD Player Event Context & Artifact Law

Status: ACTIVE / READY FOR PREVIEW DATA APPLY
Version: 1.0
Depends On: SCRYPT-CROWN-002
Environment: Da CROWD Player

## Purpose
Preserve event context around Player media without forcing event metadata into a media title.

Canonical relationship:

MEDIA ↔ EVENT ↔ ARTIFACTS ↔ LIVE/SPACE CONTEXT

The same event may contain multiple battles/media records. One battle/media record may belong to one primary event in V1.

## Event Data
Permitted event fields:
- canonical event slug;
- display name;
- exact event date when verified;
- printed/supplied time text;
- platform/format (for example X/Twitter Spaces, in-person, hybrid, stream);
- organizer/promoter;
- rights/provenance status;
- source/evidence note;
- verification confidence.

Do not manufacture:
- exact dates from upload dates;
- UTC conversions when a flyer only supplies colloquial timezone text;
- opponent/event relationships from filenames alone;
- venue/location when not evidenced.

## Event Artifacts
Artifacts may include:
- matchup flyer;
- full event card;
- promo graphic;
- event logo;
- teaser/trailer;
- Space promo;
- schedule card;
- first-party event photo.

Every artifact must preserve:
- source provider;
- source identifier/URL when available;
- artifact type;
- rights/provenance status;
- whether it is event-level or matchup-specific.

## Spaces / Live Context
X/Twitter Spaces data is stored separately from event metadata because one event may have multiple Spaces/promos.

Capture when verified:
- Space ID;
- Space URL;
- scheduled/display time;
- host/co-host handles;
- source post URL;
- replay/recording state.

Do not infer a Space ID from an event hashtag or from a different matchup on the same event series.

## Evidence Priority
Strongest to weakest:
1. first-party flyer/card;
2. first-party organizer/participant post;
3. first-party Drive event folder;
4. official provider upload title/description;
5. historical internal tracker;
6. inference.

Higher-strength evidence supersedes lower-strength approximate metadata.

## Player Behavior
Customer-facing Player may show:
- event name;
- verified date;
- verified time text;
- related flyer/card;
- related first-party artifacts.

Unverified fields remain absent rather than showing placeholders that look factual.

Operator/admin surfaces may show evidence status and pending fields.

## Rights
First-party CROWD / GBE artifacts must remain distinguishable from externally sourced embeds.

Historical provider view counts are provenance only and must never be imported as first-party CROWD VIEW analytics.

## Promotion Gate
Do not apply event-context migrations to production until:
- schema tests pass;
- verified seed evidence is documented;
- Preview D1 migration succeeds;
- LEVEL X renders event context without breaking existing media access law.

## Runtime Integration — 2026-10-03

LEVEL X event-context rendering is staged on `feature/crown-door-v1`.

Implemented:
- `lib/player-catalog-service.js` detects the event schema before querying it;
- when migrations 0013–0016 are not present, the current Player catalog remains operational and returns `event: null`;
- event context is attached only after media authorization succeeds;
- locked media never receives event artifact or Space source URLs;
- authorized media may receive verified event name, date, printed time text, organizer, platform, related artifacts, and verified Space/replay links;
- internal evidence notes are not exposed through the customer-facing catalog;
- LEVEL X renders a verified event panel and artifact links beneath the active media;
- queue rows prefer linked event name/date when available.

Additional staged verified event context:
- Training Day — 2024-01-07 — X Tha God vs Big Kannon — first-party CROWD battle source + recovered matchup card + public Training Day Space chronology; exact Space URL/time pending.

Current gate:
- migrations 0012–0016 are READY FOR PREVIEW DATA APPLY in numeric order;
- unresolved historical dates remain NULL rather than blocking Preview;
- production D1, main, DNS, nameservers, and secrets remain untouched;
- the event UI remains schema-safe until the Preview migration stack is applied, then becomes active for linked verified events.

Verification:
- Player Access Tests passed for the event-context runtime integration;
- the full 36-battle staged migration stack through 0016 passed both push and pull-request CI at `936e1285dd9bafa924670d5b7623576a9f634813`.

