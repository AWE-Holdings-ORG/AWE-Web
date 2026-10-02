# SCRYPT-CROWN-004 — Player Access Preview Promotion Runbook

Status: ACTIVE / READY FOR PREVIEW
Version: 1.0
Depends On: SCRYPT-CROWN-001, SCRYPT-CROWN-002
Environment: Cloudflare Preview only

## Purpose
Promote the Player access-state schema and runtime enforcement into the feature-branch Preview without disrupting the currently working Crown catalog.

## Runtime Composition
wrangler.jsonc uses worker-entry.js as the Preview/Worker entrypoint.

worker-entry.js:
1. delegates all existing Crown behavior to worker.js;
2. intercepts only the Player catalog/access-health routes;
3. reuses the existing Crown session through an internal atrium probe;
4. passes only the authenticated member ID into the Player access modules;
5. never passes PCK data, hashes, peppers, or recovery credentials into Player code.

## Safe Migration Rollout
The entrypoint checks for:
- media_access_policy
- cypherz_house_access
- media_unlock_grants

If all three tables exist, SCRYPT-CROWN-002 enforcement becomes active.
If the schema is not ready, the existing Crown Player catalog remains in LEGACY-FALLBACK mode.

No HOUSE or UNLOCK content should be published until schemaReady=true.

## Preview Migration Command
From the AWE-Web repository:

npx wrangler d1 migrations apply awe-crown-identity-preview --remote --config wrangler.preview-migrations.jsonc

Expected pending migrations:
- 0009_player_access_states.sql
- 0010_player_access_grants.sql

Run the migrations only against awe-crown-identity-preview during this phase.

## Verification
1. Confirm /api/crown/health remains healthy.
2. Authenticate through the Crown terminal.
3. Request /api/crown/player/access-health.
4. Require:
   - ok=true
   - schemaReady=true
   - mode=SCRYPT-CROWN-002
   - all three required tables present.
5. Load LEVEL X.
6. Confirm the existing X battle catalog still renders.
7. Play one battle for at least the qualified-view interval.
8. Confirm CROWD VIEW behavior still works.
9. Confirm Crown comments still load/post.
10. Confirm no protected source appears in a locked/encrypted response.

## Rollback
If the new entrypoint causes a runtime problem before schema promotion:
- restore wrangler.jsonc main to worker.js on the feature branch.
- do not modify production/main.
- do not delete Preview data as an initial rollback action.

If the schema is applied but enforcement has an application defect:
- worker-entry.js may be reverted to delegation while preserving the migrations and data.
- do not destructively roll back D1 without a specific migration/data recovery plan.

## Promotion Gate
Do not merge to main until:
- Player access CI passes;
- Preview schemaReady=true;
- LEVEL X regression QA passes;
- SCRYPT-CROWN-002 access/redaction checks pass;
- temporary User 01 recovery functionality has been removed through the approved cleanup workflow.


## Preview Secret Verification

Worker Previews have Preview-specific secrets. A healthy Wrangler login and a healthy
Preview D1 binding do not prove the active Preview deployment has its required secrets.

Before authenticated Crown runtime QA, check the current branch Preview:

    npx wrangler preview secret list --name feature-crown-door-v1 --json

Required Preview secret names for Crown identity runtime:
- PCK_PEPPER
- SESSION_PEPPER

Do not print or commit secret values.

If either secret is missing, restore both together to the branch Preview before runtime QA.
Prefer a bulk operation containing both required secrets so the Preview deployment is
created with a complete set:

    npx wrangler preview secret bulk <LOCAL_SECRET_FILE> --name feature-crown-door-v1

The local secret file must not be committed and should be deleted after use if it is only
a temporary staging file.

Do not restore PREVIEW_RECOVERY_TOKEN as part of normal runtime recovery. That token belongs
to the temporary User 01 recovery mechanism and remains scheduled for removal.

After restoring Preview secrets:
1. confirm both names with preview secret list;
2. confirm /api/crown/health reports pckPepper=true and sessionPepper=true;
3. authenticate through the Crown terminal;
4. confirm /api/crown/player/access-health reports schemaReady=true and mode=SCRYPT-CROWN-002.

A plain code upload is not considered a secret repair. Runtime QA does not proceed until
the active Preview deployment reports both required identity secrets.


## Verified Preview Milestones — 2026-10-01
Confirmed on feature-crown-door-v1 Preview:
- D1 migrations 0009 and 0010 are applied.
- /api/crown/health reports ok=true, db=true, pckPepper=true, sessionPepper=true.
- Authenticated /api/crown/player/access-health reports:
  - ok=true
  - schemaReady=true
  - mode=SCRYPT-CROWN-002
  - media_access_policy present
  - cypherz_house_access present
  - media_unlock_grants present
- User 01 re-key is complete and normal PCK authentication is working.
- PREVIEW_RECOVERY_TOKEN is absent from the Preview secrets.
- Temporary runtime recovery code was removed from worker.js in commit 950561a3923efe5ae5d573e116e81be14e3bdc9a.

Remaining promotion work:
- from an authenticated Preview browser, POST the retired /api/crown/preview-recover-user01 path and confirm it returns only a non-recovery/static-miss response;
- re-confirm normal Crown/PCK login and /api/crown/player/access-health against the latest Preview deployment;
- confirm LEVEL X renders the full 31-battle X Tha God queue (13 CROWD-owned + 18 external) and each intended embed starts playback;
- execute SCRYPT-CROWN-006 qualified-view QA against real playback;
- verify Crown comments load and post against an authorized battle;
- execute one runtime unauthorized-media engagement/redaction test using an already-existing restricted Preview record if one exists; do not mutate Preview D1 solely to fabricate a test case;
- do not merge to main until all promotion gates pass.

## Continuation Verification — 2026-10-01

Code/build facts verified on feature-crown-door-v1:
- The current executable branch source contains no occurrence of the retired route string `preview-recover-user01`.
- The current executable branch source contains no occurrence of `PREVIEW_RECOVERY_TOKEN`.
- The recovery mechanism therefore has no executable handler/token reference in the branch source. A direct HTTP smoke request remains required only to record the final runtime response behavior.
- Player media engagement authorization was extended to qualified-view and comment GET/POST routes in commit `6014c08bd52feb2709e1ba08ef72eae07756c9f5`.
- The `6014c08` SCRYPT-CROWN-002 GitHub access gate passed and the Cloudflare Workers Preview build completed successfully.
- SCRYPT-CROWN-006 now defines BATTLE qualified CROWD VIEW as 120 cumulative seconds (2:00) of actual playback rather than idle selection; non-battle media retains a provisional 10-second default.
- LEVEL X playback qualification was implemented in `e8059a8fbec6ffc330a021d14a9a33fdc82c9a36`.
- YouTube public views and CROWD VIEW are intentionally separate metrics; Crown never treats a provider play-start alone as a qualified CROWD VIEW.
- Duplicate same-media/session qualification POST attempts were suppressed in `76243283f01b38cecdc162b1e91ed4d1b3a374e2`.
- The `7624328` SCRYPT-CROWN-002 GitHub access gate passed and the Cloudflare Workers Preview build completed successfully.
- The LEVEL X inline Player script parses successfully after the qualification changes.
- Migration 0008 contains exactly 18 X Tha God battle seed INSERTs with 18 distinct YouTube external IDs; all remain CROWN visibility records.
- No repository migration seeds a disposable VAULT/locked QA media record. Preview D1 must not be mutated merely to manufacture one.



## Engagement Analytics Preview Rollout

SCRYPT-CROWN-007 adds migration `0011_player_engagement_analytics.sql`.

This migration creates:
- `media_playback_sessions` — one monotonic first-party playback ledger row per media/session key;
- `player_analytics_access` — explicit operator/viewer grants for aggregate analytics reporting.

It also grants the founding operator identity `AWE-000001` analytics operator access when that member exists.

Apply to Preview D1 only:

    npx wrangler d1 migrations apply awe-crown-identity-preview --remote --config wrangler.preview-migrations.jsonc

Expected new pending migration for this phase:
- 0011_player_engagement_analytics.sql

Do not run this command against production D1.

Before 0011 is applied, the Player remains usable: playback telemetry fails closed with `PLAYER_ANALYTICS_SCHEMA_MISSING` and the client does not interrupt media playback.

After applying 0011, verify:
1. normal Crown/PCK login still passes;
2. LEVEL X loads normally;
3. first actual PLAYING state creates one playback ledger row;
4. active playback time grows while PLAYING and not while paused/buffering;
5. a BATTLE still requires 120 cumulative seconds for CROWD VIEW;
6. duration produces completion percentage;
7. `/api/crown/player/analytics?artist=x-tha-god&days=30` succeeds for an explicitly granted operator;
8. the same endpoint returns 403 for a Crown member without an analytics grant;
9. `/crown/crowd/level-x/analytics/` renders aggregate metrics without member-level/raw-IP/PCK data.

Production D1 remains untouched until a separate approved promotion step.


## Analytics Preview Activation — 2026-10-01

Verified continuation state:
- Local branch was fast-forwarded to `be4a7ca961c016c94cb1c973c58c9a45a4d05408`.
- Preview D1 migration `0011_player_engagement_analytics.sql` was reviewed as additive-only and applied to `awe-crown-identity-preview`.
- No Preview migrations remain pending after 0011.
- `media_playback_sessions` and `player_analytics_access` exist in Preview D1.
- `AWE-000001` holds the analytics operator grant.
- The playback ledger was empty immediately after migration, providing a clean analytics launch baseline.
- Pre-apply local QA passed for runtime syntax, Player access, Preview security, LEVEL X client wiring, Player analytics, LEVEL X seed integrity, analytics migration, and Player access migrations.
- GitHub `SCRYPT-CROWN-002 access gate` passed at `be4a7ca`.
- Cloudflare Workers Preview build `b1c9f7e1-2ab3-4454-99d4-c6fe2b63d7c4` completed successfully for `be4a7ca`.
- A separate manual Preview deploy is therefore not required for this SHA.
- Production D1, main, DNS, nameservers, and secrets remain untouched.

The next required phase is authenticated browser/runtime QA against the latest Preview:
1. normal PCK login;
2. read-only Crown/access-health/recovery smoke;
3. LEVEL X 31-battle embed pass;
4. 120-second qualified CROWD VIEW;
5. SCRYPT-CROWN-007 PLAY START / active-watch / pause / resume / completion telemetry;
6. operator analytics dashboard;
7. comments persistence;
8. restricted-media runtime redaction when a legitimate restricted record exists.

Do not merge to main until those runtime gates pass.


## X Tha God CROWD-Owned Battle Expansion

**0012 STATUS: HOLD FOR EVENT RECONCILIATION.**

Do not apply migration 0012 to Preview D1 until the CROWD event evidence registry has reconciled the known flyer-derived event dates and removed approximate historical year assumptions. Pending dates may remain NULL; they must not be guessed.

Migration `0012_x_tha_god_crowd_owned_battles.sql` adds the 13 GBE / The CROWD-owned battles recovered from the official @CrowdShyt tracker source and reorders the existing 18 external embeds behind them.

Expected LEVEL X battle total after 0012:
- 13 CROWD-owned / GBE source battles;
- 18 previously seeded external league battles;
- 31 total authorized battle records.

Historical YouTube/provider view counts from the old tracker are not imported into Da CROWD Player first-party `media_views`.


## Player Event Context Rollout

SCRYPT-CROWN-008 adds migration `0013_player_event_context.sql`.

**0013 STATUS: HOLD WITH 0012 UNTIL CROWD EVENT RECONCILIATION IS READY.**

Migration 0013 is additive and creates:
- `player_events`;
- `player_event_media`;
- `player_event_artifacts`;
- `player_event_spaces`.

The initial seed includes only first-party X Tha God CROWD event evidence already verified from Drive artifacts:
- Elements — 2022-10-15 — 9 PM EST as printed;
- Post Elements — 2022-10-16 — 5 PM PST / 8 PM EST as printed;
- Unforeseen Circumstances X — 2022-10-20 — 6 PM PST / 9 PM EST as printed;
- Hostility Vol. 1 — 2022-11-05 — 9 PM EST as printed.

Do not use rough historical tracker years as exact event dates.
Do not infer Space IDs/URLs.
Do not apply 0013 before 0012 because its initial media links depend on the CROWD-owned battle records added by 0012.

When reconciliation is complete, Preview rollout order is:
1. apply 0012 to `awe-crown-identity-preview`;
2. apply 0013 to `awe-crown-identity-preview`;
3. verify 31 X battle records;
4. verify the four seeded event-context links and artifacts;
5. keep unresolved event dates/Spaces absent until evidenced.

Production D1 remains untouched.
