# SCRYPT-CROWN-002 — QA Record 001

Status: PASS (resolver + schema + Preview identity health); AUTHENTICATED RUNTIME QA PENDING
Date: 2026-09-30
Scope: lib/player-access.js
Runtime Integration: DEPLOYED TO FEATURE PREVIEW; AUTHENTICATED CHECK PENDING
Preview D1 Migrations 0009/0010: APPLIED

## Checks Passed
- PUBLIC returns authorized media.
- Unauthorized HOUSE returns locked teaser without protected source fields.
- Matching House grant authorizes HOUSE.
- CONCEALED HOUSE returns no record.
- Matching media grant authorizes UNLOCK.
- ENCRYPTED UNLOCK reveals no protected source fields.
- CROWN remains locked without Crown authentication.
- Active Crown context authorizes CROWN.
- Crown authentication alone does not reveal CONCEALED VAULT.
- Explicit media grant can authorize VAULT.
- Unknown access state fails closed.
- HOUSE policy missing house_slug fails closed.

## Schema Review Finding
Before migration application, migration 0009 was corrected to reference the canonical House primary key:

houses(slug)

rather than the nonexistent:

houses(house_slug)

This was caught before recording 0009 as applied.

## Remaining Gate
The pure resolver is not sufficient by itself. Worker/API integration must supply verified viewer context and use the resolver/redaction result before protected media is returned. Runtime QA is required after migration application and integration.


## Preview Promotion Results
- Preview branch recreated so it inherited Preview Base secrets.
- Preview secret names present:
  - PCK_PEPPER
  - SESSION_PEPPER
- PREVIEW_RECOVERY_TOKEN is absent.
- Preview D1 migrations 0009 and 0010 remain applied.
- Required tables confirmed:
  - media_access_policy
  - cypherz_house_access
  - media_unlock_grants
- /api/crown/health returns HTTP 200 with:
  - ok=true
  - db=true
  - pckPepper=true
  - sessionPepper=true

## Remaining Authenticated Runtime Gate
1. Sign in through the Crown terminal on the active Preview host.
2. On the same hostname/session, request /api/crown/player/access-health.
3. Require:
   - ok=true
   - schemaReady=true
   - mode=SCRYPT-CROWN-002
   - required Player access tables present.
4. Run LEVEL X regression QA for catalog rendering, playback, qualified views, comments, and protected-source redaction.


## User 01 Preview Rekey
- User 01 / AWE-000001 / Nitti_Bo was re-keyed successfully in the feature Preview.
- The temporary recovery token workflow completed successfully.
- Cleanup completed successfully.
- PREVIEW_RECOVERY_TOKEN was removed after use.
- Normal Preview runtime secrets remain limited to PCK_PEPPER and SESSION_PEPPER.
- Next gate: authenticated Crown login, access-health verification, then removal of the temporary recovery endpoint from worker.js before merge.
