# SCRYPT-CROWN-006 — Da CROWD Player Qualified View Law

Status: ACTIVE / IMPLEMENTING
Version: 1.0
Depends On: SCRYPT-CROWN-002, SCRYPT-CROWN-004
Environment: Da CROWD Player / LEVEL X

## Purpose
Define when a Player interaction becomes a qualified CROWD VIEW. A CROWD VIEW is a playback-engagement signal, not a page impression, queue selection, or idle dwell event.

## V1 Qualification Threshold
A playable media item qualifies after 10 cumulative seconds of active playback within the current Player session key.

Active playback means:
- YouTube: player state is PLAYING.
- Native video/audio: the media element is in a playing state.

Time does not accrue while:
- paused;
- buffering/waiting/stalled;
- ended;
- the media item is not the active Player selection;
- the browser has not actually started playback.

Switching to another media item cancels the unfinished qualification clock for the previous selection.

## Recording Rule
After qualification:
- POST /api/crown/player/view once for the active media/session key;
- rely on the server UNIQUE(media_id, session_key) constraint as the duplicate-write backstop;
- update the displayed CROWD VIEW count only after a successful server response.

A media item that cannot be played in the Player does not receive an automatic qualified view in V1.

## Authorization Rule
Qualification never bypasses SCRYPT-CROWN-002.
The server must re-resolve media authorization before recording the view.
Locked, encrypted, concealed, malformed-policy, or otherwise unauthorized media cannot earn a CROWD VIEW.

## Privacy / Identity
No raw IP address is stored.
The existing one-way visitor digest, Crown member ID when present, Player session key, media ID, and qualified timestamp remain the permitted V1 analytics fields.

## QA
For one authorized battle:
1. select it and do not press play for more than 10 seconds — view count must not change;
2. play for fewer than 10 seconds, then pause — view count must not change;
3. resume and reach 10 cumulative playing seconds — view count increments once;
4. continue playing — no second increment for the same media/session key;
5. switch media before qualification — the abandoned media does not increment;
6. verify an unauthorized media ID cannot record a view through the API.

## Promotion Gate
LEVEL X regression QA is not complete until qualified-view behavior passes this SCRYPT.
