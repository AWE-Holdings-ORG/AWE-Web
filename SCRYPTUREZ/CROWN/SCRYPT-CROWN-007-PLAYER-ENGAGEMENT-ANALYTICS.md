# SCRYPT-CROWN-007 — Da CROWD Player Engagement Analytics Law

Status: ACTIVE / IMPLEMENTING
Version: 1.0
Depends On: SCRYPT-CROWN-002, SCRYPT-CROWN-006
Environment: Da CROWD Player / LEVEL X

## Purpose
Measure meaningful first-party playback engagement inside Da CROWD Player without confusing AWE metrics with provider metrics or weakening media authorization.

The canonical funnel is:

PLAY START → ACTIVE WATCH TIME → CROWD VIEW → COMPLETION

A provider view (including YouTube) is never treated as equivalent to a CROWD VIEW.

## Metric Law

### Play Start
A PLAY START is created only when the active media player reports actual playback:
- YouTube: IFrame API state PLAYING.
- Native audio/video: the media element emits playing.

Selecting a queue item, loading an embed, idling on the page, buffering, or merely exposing a thumbnail does not create a PLAY START.

A media/session key may create only one PLAY START record.

### Active Watch Time
ACTIVE WATCH TIME is cumulative wall-clock time while the selected media is actually playing.

Time does not accrue while:
- paused;
- buffering/waiting/stalled;
- ended;
- playback has not begun;
- the media is no longer the active Player selection.

Client progress is reported periodically and at meaningful stop/switch/page-exit boundaries. Server persistence is monotonic: retries or duplicate signals must not reduce or double-count previously reported cumulative time.

### CROWD VIEW
SCRYPT-CROWN-006 remains authoritative.

For BATTLE media, a CROWD VIEW requires 120 cumulative seconds of qualifying playback under the current qualified-view session law.

The analytics ledger does not create or bypass CROWD VIEW qualification.

### Completion
Completion percentage is first-party consumption:

    min(100, cumulative active watch time / known media duration × 100)

It measures actual playback time consumed, not the seek position on the provider timeline.

Canonical completion milestones:
- 25%
- 50%
- 75%
- 90% — near-complete
- 100%

Unknown-duration sessions may accumulate watch time and PLAY STARTS but do not enter completion-rate denominators until duration is known.

## Data Model
Persist one aggregate playback ledger row per media ID + Player session key.

Permitted fields:
- media ID;
- Crown member ID;
- opaque Player session key;
- first-play timestamp;
- last-signal timestamp;
- cumulative active playback milliseconds;
- known duration milliseconds;
- derived completion percentage;
- optional ended timestamp.

Do not store raw IP addresses.
Do not store PCK values, credential hashes, salts, peppers, or provider account credentials.

## Reporting Cadence
The Player should report:
- immediately on first actual PLAYING state;
- approximately every 15 seconds while actively playing;
- on pause/buffer/stall/end;
- on media switch;
- on page exit when feasible.

The heartbeat exists for analytics durability. It must not trigger provider playback or manufacture provider traffic.

## Authorization
Playback telemetry is accepted only for media the active viewer is authorized to consume under SCRYPT-CROWN-002.

Unauthorized, concealed, malformed-policy, or inactive media must not create analytics records.

Analytics reporting is an internal/operator surface. Access requires an explicit Player analytics grant; Crown authentication alone is insufficient.

## Operator Analytics
The V1 operator response should support a bounded date window and expose aggregate—not member-level—reporting:

Top-line:
- PLAY STARTS;
- CROWD VIEWS;
- CROWD VIEW conversion rate;
- total ACTIVE WATCH HOURS;
- average active watch time;
- average completion percentage for sessions with known duration;
- 25/50/75/90/100% completion milestone counts.

Per-media:
- title/media ID;
- PLAY STARTS;
- CROWD VIEWS;
- active watch time;
- average watch time;
- average completion;
- completion milestone counts.

Trend:
- daily PLAY STARTS;
- daily CROWD VIEWS;
- daily active watch time.

## Privacy / Product Separation
Da CROWD Player analytics are AWE first-party signals.
YouTube/provider counters remain provider-owned signals and may differ legitimately.

No AWE metric should be described as a YouTube view, watch-hour, monetization metric, or provider-certified statistic.

## QA
1. Selecting/idling creates no PLAY START.
2. First PLAYING state creates exactly one PLAY START for that media/session.
3. Pause/buffer time does not increase active watch time.
4. Resume continues cumulative active watch time.
5. Duplicate/retried reports never decrease or double-count the cumulative total.
6. Duration produces a completion percentage capped at 100%.
7. A BATTLE still requires 120 seconds before CROWD VIEW increments.
8. Switching media flushes analytics progress but preserves the prior media/session ledger.
9. Unauthorized media cannot create telemetry.
10. Operator analytics are denied without an explicit analytics grant.
11. Dashboard/reporting contains aggregates only and no raw member/PCK/IP data.

## Promotion Gate
Do not promote the engagement analytics layer until:
- migration/schema tests pass;
- client telemetry wiring tests pass;
- server authorization tests/gates pass;
- Preview migration is applied to Preview D1 only;
- real Preview playback demonstrates PLAY START, watch-time growth, 120-second CROWD VIEW, and completion calculations;
- no production D1 change occurs without a separate approved promotion step.
