# SCRYPT-CROWN-002 — QA Record 001

Status: PASS (pure resolver)
Date: 2026-09-30
Scope: lib/player-access.js
Runtime Integration: NOT YET COMPLETE
Preview D1 Migrations 0009/0010: NOT YET RECORDED AS APPLIED

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
