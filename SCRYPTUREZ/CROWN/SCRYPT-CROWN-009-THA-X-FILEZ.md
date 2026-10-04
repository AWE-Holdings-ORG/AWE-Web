# SCRYPT-CROWN-009 — Tha X Filez

Status: ACTIVE / READY FOR PREVIEW DATA APPLY
Version: 2.1
Depends On: SCRYPT-CROWN-002, SCRYPT-CROWN-010
Environment: Da Archivez / Tha X Filez

## Canon

Canonical name: **Tha X Filez**

Reason:
- X's artist identity is **X Tha God**;
- "Tha" is part of the artist's established naming language;
- the archive must follow the artist brand rather than generic CROWD naming.

Canonical collection:
- slug: `tha-x-filez`
- display name: **Tha X Filez**
- artist: X Tha God
- archive room: `/crown/crowd/archivez/tha-x-filez/`
- public artist-review mirror: `/crowd/x/`

Tha X Filez is NOT a lane inside LEVEL X or Da CROWD Player.

## Scope

Initial content classes:
- images;
- photos;
- portraits;
- interviews.

Future eligible classes:
- behind-the-scenes material;
- promos;
- documents;
- archival clips;
- other X-specific history approved for the archive.

Ambiguous raw video must be classified before import.

## Access

Tha X Filez uses the existing SCRYPT-CROWN-002 access ladder:

1. PUBLIC
2. HOUSE
3. UNLOCK
4. CROWN
5. VAULT

Archive presentation labels may read:
- PUBLIC FILE
- HOUSE FILE
- UNLOCK FILE
- CROWN FILE
- VAULT FILE

Collection membership never grants access by itself.

## Public-First Launch

Owner direction:
- initial Tha X Filez images/interviews launch PUBLIC;
- X Tha God is the primary artist curator for the first review pass;
- X may reclassify any individual file to PUBLIC / HOUSE / UNLOCK / CROWN / VAULT;
- an individual X classification overrides the launch default and persists;
- moving a file away from PUBLIC automatically removes it from the public review mirror;
- the Crown Archive Player continues to evaluate the same file through normal access law.

This PUBLIC-first rule is specific to Tha X Filez unless explicitly extended elsewhere.

## Review Codes

Each imported file receives a stable review code:
- `DXF-0001`
- `DXF-0002`
- etc.

The review-code ranges are now:
- Drive image batch: `DXF-0001` through `DXF-0092`;
- Dropbox flood batch: `DXF-0093` through `DXF-1104`.

X may curate by code instead of gallery position, for example:
- `DXF-0017 -> HOUSE`
- `DXF-0042 -> VAULT`
- `DXF-0088 -> PUBLIC`

## Public Intake Batches

Migration 0018 stages the first Drive batch:
- Hype3Wear / X Tha God — 5 still images;
- Grizz Exams / X Tha God — 87 still images;
- total — 92 still images;
- original Drive file retained as provenance;
- web-safe Drive thumbnail used for browser rendering.

Migrations 0019–0022 stage the Dropbox flood:
- source folder: `/X Tha God`;
- 809 images;
- 203 videos;
- total — 1,012 Dropbox records;
- Dropbox preview URL retained as provenance/source link;
- all records launch PUBLIC-first;
- videos remain generic `video` until X classifies them;
- Dropbox records intentionally do not fake a thumbnail URL when a durable browser image source is unavailable.

Combined staged archive:
- **1,104 Tha X Filez**
- **DXF-0001 through DXF-1104**

The earlier Grizz Exam raw `.MOV` files remain separate from the Dropbox flood and are still not auto-classified as interviews/BTS.

## Runtime

### Crown Archive Room
`/crown/crowd/archivez/tha-x-filez/`
- requires The CROWD Crown access through the normal Crown asset gate;
- uses the dedicated Crown Archivez API;
- shows authorized files and permitted teasers according to SCRYPT-CROWN-002;
- provides archive filters, a paged 60-file queue, stable DXF codes, access-state labels and original-file provenance where authorized;
- Dropbox files without a durable inline thumbnail render a safe DBX placeholder and an Original File link instead of a broken embed.

### Public Review Mirror
`/crowd/x/`
- requires no Crown session;
- uses the dedicated public Archivez API;
- receives PUBLIC files only;
- renders 60 records initially and progressively loads more to keep 1,000+ Filez usable on mobile;
- remains `noindex,nofollow` during the initial artist review phase;
- exposes no Crown comments, analytics or restricted media.

## @CrowdShyt Thumbnail / Flyer Evidence

Historical first-party @CrowdShyt battle uploads commonly use the battle flyer as the YouTube thumbnail/video presentation art.

Therefore:
- provider thumbnail URLs may be stored as presentation metadata;
- official @CrowdShyt thumbnails are valid flyer-evidence candidates;
- visually confirm the thumbnail before promoting it to an event artifact;
- printed matchup/date/time text on a confirmed thumbnail may support event evidence;
- YouTube upload/publication date never becomes an event date merely because the thumbnail is a flyer.

## Big Tali / Stardom / Super Readers

Big Tali runs **Stardom**, formerly **Demon Time Battle League**.

Super Readers is an owned battle-event series held by Big Tali in the CROWD ecosystem.

For X Tha God vs OG Duggie:
- event: Super Readers;
- event ownership: GBE / The CROWD;
- organizer/holder context: Big Tali / Stardom / The CROWD;
- exact battle event date: pending;
- 2023-05-18 remains provider release context only;
- provider/source provenance remains separate from event ownership.

## Promotion Gate

Before production promotion:
- migrations 0017 through 0022 pass;
- Da Archivez route/API isolation tests pass;
- LEVEL X test proves Tha X Filez is excluded;
- public review surface proves PUBLIC-only delivery;
- Archive Player script parses;
- Preview D1 applies migrations in numeric order;
- production D1 remains untouched until separately approved.
