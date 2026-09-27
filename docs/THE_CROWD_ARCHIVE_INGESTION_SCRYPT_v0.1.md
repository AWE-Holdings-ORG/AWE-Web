# THE CROWD ARCHIVE INGESTION SCRYPT v0.1

## Scope
The archive goal is not a 10–20 battle sample. The target is the complete recoverable Crowd competition history.

Known source classes include:
- official CrowdShyt YouTube uploads (50+ battles and related video material)
- archived battles not present on YouTube
- X / Twitter Spaces battles, including audio-only events
- battles that were held but never recorded
- event flyers and promotional graphics
- social posts and announcements
- participant-provided audio/video
- Crowd and GBE crossover history
- external battle-stage appearances connected to the lineage

## Record states
Each competition record may be:
- VIDEO_VERIFIED
- AUDIO_VERIFIED
- METADATA_VERIFIED
- EVENT_VERIFIED_NO_MEDIA
- PARTIAL
- RECOVERY_NEEDED
- DUPLICATE
- DISPUTED

## Required record fields
- crowd_battle_id
- title
- competitor_a
- competitor_b
- event
- platform/source
- format
- round_count
- date or best-known date
- media_url(s)
- media_type
- upload/source metadata
- description
- judging_profile
- archive_status
- provenance notes

## Ingestion law
Do not discard a battle because media is missing.
A historically verified battle with no recording is still an archive record.
Do not overwrite original source metadata; preserve it and add normalized fields separately.
Duplicate uploads should map to one canonical battle record with multiple media/source references.
Unknown data should remain unknown rather than being guessed.

## Scale
The first migration milestone is ALL currently recoverable official YouTube battles, not a capped sample.
After YouTube, ingest X Spaces/audio-only, offline/unrecorded records, and external historical evidence.
