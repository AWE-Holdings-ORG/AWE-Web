# SCRYPT-CROWN-009 — Player Media Collections / Da X Filez

Status: ACTIVE / READY FOR PREVIEW DATA APPLY
Version: 1.1
Depends On: SCRYPT-CROWN-002, SCRYPT-CROWN-008
Environment: Da CROWD Player / LEVEL X

## Purpose

Separate **collection identity** from **access control**.

A collection answers:
- what archive a media item belongs to;
- how it is grouped and presented.

Access policy answers:
- who can see the item;
- whether an unauthorized viewer sees a visible teaser, locked teaser, encrypted signal, or nothing.

These are independent concepts.

## Da X Filez

Canonical collection:
- slug: `da-x-filez`
- display name: **Da X Filez**
- artist: X Tha God
- initial scope: X images/photos/portraits and interviews

Do not create separate top-level Photo and Interview brands for X when the content belongs in this collection.

Behind-the-scenes content may remain its own lane unless explicitly assigned to Da X Filez.

## Access Tiers

Da X Filez uses the existing SCRYPT-CROWN-002 ladder:

1. PUBLIC
2. HOUSE
3. UNLOCK
4. CROWN
5. VAULT

LEVEL X may present these as:
- PUBLIC FILE
- HOUSE FILE
- UNLOCK FILE
- CROWN FILE
- VAULT FILE

The presentation labels do not change the underlying access semantics.

Da X Filez launch rule:
- initial Da X Filez images/interviews launch as PUBLIC;
- X Tha God is the primary artist curator for the first review pass;
- X may designate any individual file as PUBLIC / HOUSE / UNLOCK / CROWN / VAULT;
- an individual X decision overrides the collection launch default and must persist;
- VAULT remains closed unless an explicit media grant exists;
- encrypted teasers do not expose collection identity;
- visible/locked teasers may expose the safe collection label while source URLs remain redacted;
- collection membership never grants access by itself.

This PUBLIC-first rule is specific to Da X Filez and must not be generalized to unrelated collections without an explicit directive.

## Intake & Artist Review Rule

New X images/interviews should be:
1. identified and de-duplicated;
2. assigned to Da X Filez;
3. launched PUBLIC unless X has already supplied a more restrictive classification;
4. presented to X for the artist review pass;
5. reclassified individually when X specifies HOUSE / UNLOCK / CROWN / VAULT.

The public review surface is `/crowd/x/`.
It is intentionally noindex during the initial artist-review phase.

Do not auto-import ambiguous raw video clips as interviews. Classify them first.

## @CrowdShyt Thumbnail / Flyer Rule

Historical first-party @CrowdShyt battle uploads commonly use the battle flyer as the YouTube thumbnail/video presentation art.

Therefore:
- provider thumbnail URLs may be stored as presentation metadata;
- official @CrowdShyt thumbnails are valid **flyer-evidence candidates**;
- visually confirm the thumbnail before promoting it to `player_event_artifacts` as a matchup flyer or event card;
- printed matchup/date/time text on a confirmed thumbnail may be used as event evidence;
- a YouTube upload/publish date must never be converted into an event date merely because the thumbnail is a flyer.

Migration 0017 stores YouTube provider thumbnails for X media so the Player and reconciliation workflow can surface that art.

## Big Tali / Stardom / Super Readers

Big Tali runs **Stardom**, formerly **Demon Time Battle League**.

Super Readers is an owned battle-event series in the CROWD ecosystem and is held by Big Tali.

For X Tha God vs OG Duggie:
- event: Super Readers;
- event ownership: GBE / The CROWD;
- organizer/holder context: Big Tali / Stardom / The CROWD;
- exact battle event date: still pending;
- 2023-05-18 remains release context, not the event date;
- the YouTube source/provider relationship remains separate from event ownership.

Migration 0017 represents that distinction at the event layer.

## Initial Public Batch

Migration 0018 stages the first Da X Filez public image batch:
- Hype3Wear / X Tha God — 5 still images;
- Grizz Exams / X Tha God — 87 still images;
- total — 92 still images;
- raw Grizz Exam `.MOV` files remain unclassified and are not imported as interviews/BTS yet.

## Runtime

Public `/crowd/x/`:
- requires no Crown session;
- consumes only the PUBLIC Player surface;
- displays only PUBLIC Da X Filez records;
- automatically stops displaying a file when its access state changes away from PUBLIC;
- exposes no Crown comments or analytics controls.

LEVEL X:
- renders `DA X FILEZ` as a collection lane;
- prioritizes collection identity before generic media-type categories;
- shows thumbnail art in the media queue when access law permits it;
- shows per-file access tier labels;
- keeps concealed/encrypted source data protected.

## Promotion Gate

Before production promotion:
- migrations 0017 and 0018 pass;
- collection schema remains optional/schema-safe before migration;
- locked/encrypted redaction tests pass;
- LEVEL X client parsing passes;
- Preview D1 applies migrations in numeric order;
- production D1 remains untouched until separately approved.
