# SCRYPT-CROWN-012 — ARCHIVEZ SOCIAL & PUBLIC PRESENTATION LAW

Status: ACTIVE / PREVIEW
Version: 1.0
Domain: Crown / Archivez / Social
Depends On: SCRYPT-CROWN-002, SCRYPT-CROWN-009, SCRYPT-CROWN-010

## Purpose

Define the public-presentation and social-interaction layer for Da Archivez.

Archive source records may retain raw provider filenames internally while presenting curated public titles, captions, likes, comments, and shareable deep links through AWE-owned surfaces.

## Source Name vs Public Name

Raw source filenames are immutable infrastructure metadata unless an explicit source migration is approved.

For Dropbox-backed archive records, the raw filename in `artist_media.title` remains intact because file delivery depends on exact source-name resolution.

Public presentation may override that raw filename through `archive_media_public_meta.public_title`.

Examples:
- source: `Photo Apr 04 2026, 11 07 08 PM.jpg`
- public: `X & Rico at High Alert`

The public title must never be used as the storage-provider lookup key.

## Admin Naming Law

Only an authorized Archivez administrator may edit public title/caption metadata.

Preview owner authority:
- `AWE-000001`

Public viewers and ordinary Crown members cannot rename archive records.

An empty public title/caption reset removes the presentation override and falls back to source defaults.

## Social Law

Each archive file may expose:
- Likes
- Comments
- Share

### Likes
- Require an authenticated Crown member.
- One active like per member per media item.
- Pressing Like again removes the member's like.
- Public viewers may see like counts.

### Comments
- Posting requires an authenticated Crown member.
- Public viewers may read visible comments.
- Comments display Crown Name, comment body, and time.
- Email, credential data, and internal identifiers are not public comment metadata.
- Existing `media_comments.status` remains the moderation gate.

### Share
- Sharing is available to public and Crown viewers.
- Preferred path: native Web Share API.
- Fallback: copy a stable public deep link.
- Shared links resolve to the public Tha X Filez mirror, not Drive or Dropbox.

## Deep-Link Law

Tha X Filez public shares use stable collection file codes:

`/crowd/x/?file=DXF-####`

The public surface should automatically open the referenced archive item when the file code is valid and public.

Provider URLs, storage IDs, and credentials must never appear in shared links.

## Data Model

`archive_media_public_meta`
- `media_id`
- `public_title`
- `public_caption`
- `updated_by_member_id`
- `updated_at`

`media_likes`
- `media_id`
- `member_id`
- `created_at`
- unique by `media_id + member_id`

`media_comments`
- existing engagement table from migration 0004
- reused as the Archivez comment ledger

## Security

- Public metadata editing is server-authorized.
- Owner/admin checks occur server-side.
- Likes/comments require Crown identity.
- Public comment reads only expose Crown Name, body, and timestamps.
- Dropbox/Drive provenance remains hidden from non-admin viewers.
- Public deep links resolve through AWE media delivery, not provider storage.

## Preview Migration

Migration:
- `0025_archivez_social_public_meta.sql`

The runtime must fail gracefully when the migration is not yet applied.
