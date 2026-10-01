# SCRYPT-CROWN-006 — Da CROWD Player Qualified View Law

Status: ACTIVE / IMPLEMENTING
Version: 1.1
Depends On: SCRYPT-CROWN-002, SCRYPT-CROWN-004
Environment: Da CROWD Player / LEVEL X

## Purpose
Define when a Player interaction becomes a qualified CROWD VIEW. A CROWD VIEW is a playback-engagement signal, not a page impression, queue selection, or idle dwell event.

## V1 Qualification Threshold
BATTLE media qualifies after **120 cumulative seconds (2:00)** of active playback within the current Player session key.

Non-battle playable media retains a provisional 10-second threshold until a category-specific SCRYPT supersedes it.

Active playback means:
- YouTube: the YouTube IFrame API reports PlayerState.PLAYING.
- Native video/audio: the media element is in a playing state.

The 120-second BATTLE threshold is an AWE first-party engagement standard. It is intentionally stricter than a provider's public view counter and must not be represented as YouTube's own view-count rule.

Time does not accrue while:
- paused;
- buffering/waiting/stalled;
- ended;
- the media item is not the active Player selection;
- the browser has not actually started playback.

Switching to another media item cancels the unfinished qualification clock for the previous selection.

## YouTube Provider Law
For YouTube-sourced battles:
- the embedded YouTube player remains the playback authority;
- Da CROWD Player must not autoplay or programmatically start playback merely to create provider traffic;
- the user initiates playback through the native YouTube player;
- Crown measures its own cumulative PLAYING-state time independently of YouTube's public view count;
- YouTube invalid/artificial-traffic detection remains YouTube's authority and is never bypassed or emulated by Crown;
- a YouTube public view and a qualified CROWD VIEW are separate metrics and may legitimately differ.

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
1. select it and do not press play for more than 120 seconds — view count must not change;
2. play for fewer than 120 cumulative seconds, then pause — view count must not change;
3. resume and reach 120 cumulative PLAYING-state seconds — view count increments once;
4. continue playing — no second increment for the same media/session key;
5. switch media before qualification — the abandoned media does not increment;
6. return to an already-qualified battle and play again in the same Player session — no second increment;
7. verify an unauthorized media ID cannot record a view through the API.

## Promotion Gate
LEVEL X regression QA is not complete until qualified-view behavior passes this SCRYPT.
