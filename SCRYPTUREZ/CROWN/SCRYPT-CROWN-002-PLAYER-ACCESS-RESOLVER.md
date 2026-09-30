# SCRYPT-CROWN-002 — Player Access Resolver Contract

Status: ACTIVE / IMPLEMENTING
Version: 1.0
Depends On: SCRYPT-CROWN-001

## Purpose
Define how Da CROWD Player, CYPHERZ, and Crown Network resolve one media record for different viewers without duplicating the Player or leaking protected sources.

## Viewer Context
The resolver may receive:
- anonymous/public visitor
- authenticated CYPHERZ profile
- authenticated Crown member
- linked CYPHERZ + Crown identity

A linked identity receives the union of valid non-revoked grants from both sides.

## Access Resolution
PUBLIC
- authorized for everyone.

HOUSE
- authorized when the viewer has an active grant for the required House.
- CYPHERZ House grants and Crown member_access are both valid sources.

UNLOCK
- authorized when the viewer holds a valid non-revoked grant for the media item/unlock condition.
- grant may belong to the CYPHERZ profile or Crown member.

CROWN
- authorized only with an active Crown session.
- CYPHERZ linkage alone is not a substitute for Crown authentication.

VAULT
- default denied.
- may be authorized only by an explicit qualifying grant/policy.
- CONCEALED Vault records are omitted entirely until authorized.

## Response Redaction
If unauthorized:
- canonical_url: remove
- provider/external_id: remove
- source_url: remove
- source_name: remove when it reveals a usable route
- rights/source internals: remove
- direct native media URLs: remove

Presentation-safe metadata may remain only when teaser_mode permits it.

## Teaser Handling
VISIBLE: return presentation metadata and normal public source when authorized.
LOCKED: return safe teaser metadata, locked=true, no usable media source.
ENCRYPTED: return reduced/obfuscated presentation metadata, no usable media source.
CONCEALED: return no record before authorization.

## Enforcement Boundary
Client UI is presentation only.
The server/API is the authority for access decisions.
CSS, JavaScript hiding, disabled buttons, obscured URLs, or route secrecy are never authorization.

## CYPHERZ Contract
CYPHERZ may render PUBLIC/HOUSE/UNLOCK normally when authorized.
CROWN and VAULT signals may be represented as mystery states, but the API must not reveal the Crown discovery path or protected source data.

## QA Matrix
Every media policy must be tested against:
1. anonymous visitor
2. CYPHERZ profile with no grants
3. CYPHERZ profile with matching House grant
4. CYPHERZ profile with matching Unlock grant
5. Crown member with no matching House grant
6. Crown member with matching House grant
7. Crown member with explicit media grant
8. linked CYPHERZ + Crown identity
9. revoked/expired grant
10. concealed Vault state

## Fail-Safe Law
Unknown access state, malformed policy, missing required House/unlock identifier, or resolver error defaults to DENY/REDACT, never PUBLIC.


## Implementation Map
- Policy schema: migrations/0009_player_access_states.sql
- Grant schema: migrations/0010_player_access_grants.sql
- Pure resolver/redaction module: lib/player-access.js
- Entitlement context builder: lib/player-viewer-context.js\n- Catalog authorization service: lib/player-catalog-service.js\n- Runtime API bridge: lib/player-api.js
- Acceptance matrix: tests/player-access-cases.md\n- Executable resolver tests: tests/player-access.test.mjs\n- CI gate: .github/workflows/player-access-tests.yml

Integration into the runtime Worker remains a separate controlled step. The module is designed so the Worker supplies viewer context and the resolver makes no authentication claims on its own.


## Runtime Wiring Rule
Authentication and credential handling remain in the Crown/CYPHERZ runtime boundary.
The runtime passes only already-authenticated identity IDs into lib/player-api.js.
PCK values, credential hashes, session secrets, and recovery credentials never enter the Player access modules.

Current integration target:
- Crown route resolves its Crown session first, then calls playerCatalogResponse with crownAuthenticated=true and crownMemberId.
- Future CYPHERZ route resolves its CYPHERZ session first, then calls playerCatalogResponse with cypherzProfileId and surface="cypherz".
