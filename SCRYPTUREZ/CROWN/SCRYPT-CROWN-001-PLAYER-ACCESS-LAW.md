# SCRYPT-CROWN-001 — Da CROWD Player Access Law

Status: ACTIVE
Version: 1.1
System: Da CROWD Player / Crown Network / CYPHERZ
Owner: AWE / Echo X Labs

## Purpose
Define one Player with multiple access states instead of separate public and exclusive players.

## Canonical Ladder
1. PUBLIC — normal internet-facing content.
2. HOUSE — content tied to authorized House access/discovery.
3. UNLOCK — content earned through a defined condition.
4. CROWN — authenticated Crown-member content.
5. VAULT — undiscovered/secret material; existence may itself be concealed.

## Rarity Relationship
PUBLIC = Common
HOUSE = Uncommon
UNLOCK = Rare
CROWN = pinnacle controlled identity/access
VAULT = highest mystery/concealment tier

## Pre-Crown Law
HOUSE and UNLOCK are intentionally reachable before Crown membership.
A person may spend their entire relationship with AWE inside PUBLIC, HOUSE, and UNLOCK without ever receiving a Crown.

CYPHERZ identities may therefore hold House access and earned media unlocks independently of an AW ID/Crown identity.

If a CYPHERZ profile is later linked to Crown, the access resolver may recognize the union of:
- CYPHERZ House grants
- CYPHERZ media unlock grants
- Crown House access
- Crown media unlock grants
- Crown-only content authorization

Linking does not expose or transfer the PCK.

## Discovery Is Not Authorization
Finding a hashtag, QR code, phrase, hidden comment, event signal, NFC target, or House Key may reveal a route or start a grant flow. Protected access is still resolved server-side.

## CYPHERZ Boundary
CYPHERZ may expose and interact with:
- PUBLIC
- HOUSE
- UNLOCK

CYPHERZ may display identifiers/signals for:
- CROWN
- VAULT

CYPHERZ must not expose a straightforward Crown-enrollment path, Crown Door instructions, PCK material, or protected Vault source data.

## Teaser Modes
VISIBLE — full discoverable presentation.
LOCKED — item may be shown but protected source is withheld.
ENCRYPTED — existence may be signaled while identity/details are reduced.
CONCEALED — item is not returned or advertised before authorization.

## Persistence
Crown membership can persist while Crown discovery/intake windows may appear, disappear, open in waves, or close entirely.

## Signal Routes
A QR/NFC/hashtag may route to an isolated look-but-don't-touch experience:
- no assumption of authentication
- no protected source leakage
- no required navigation back into Crown
- may expire
- may intentionally leave the visitor without an obvious return path

## Data Model
media_access_policy = what a media item requires.
cypherz_house_access = House access earned by a CYPHERZ identity before Crown.
media_unlock_grants = UNLOCK/exceptional grants earned by either a CYPHERZ profile or Crown member.
member_access = Crown-side House authorization.
Crown session = Crown authentication.

## Security Law
Protected media URLs, provider IDs, source URLs, or other usable source data must not be delivered to unauthorized clients merely because the UI hides them.
