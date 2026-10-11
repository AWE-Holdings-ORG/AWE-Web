# SCRYPT-CROWN-011 — Personalized Player Rosters & Cheat Codes

Status: ACTIVE / IMPLEMENTING
Version: 1.0
Domain: Crown / Player / House Discovery
Depends On: SCRYPT-CROWN-001, SCRYPT-CROWN-002, SCRYPT-CROWN-005

## Purpose

Define Da CROWD Player and future House Players as personalized discovery boards rather than universal static rosters.

Two members may open the same House Player and see different discovered signals.

## Canonical Separation

A signal has a **canonical House relationship**.

A member may separately receive a **personal roster unlock** for that signal in another House.

A personal unlock does not rewrite the artist's real affiliation.

Examples:
- DeeJayy is canonically GBE.
- DeeJayy may remain visible to AWE-000001 in The CROWD as a legacy preview unlock.
- X Tha God may later receive GBE-specific media or become a GBE Cheat Code without ceasing to be a CROWD signal.
- A former CROWD member may be hidden from the default CROWD roster while remaining revealable through a Cheat Code.

## Current Canonical Rosters

### The CROWD
Default visible signals:
- X Tha God
- Big Tali

### GBE
Default visible signals:
- DeeJayy

DeeJayy is 100% GBE. His previous CROWD character-select appearance was for UX testing and does not establish CROWD membership.

## Personalized Roster Law

A House Player roster is composed from:
1. active default-visible signals assigned to that House;
2. active member-specific signal unlocks for that House.

Member-specific unlock sources may include:
- cheat-code
- owner
- system
- legacy-preview
- discovery

The UI may still reserve a fixed visual capacity (currently 12 slots), but which identities occupy those slots may differ by member.

Unknown capacity remains encrypted.

## Cheat Code Law

A Cheat Code is a House-scoped signal discovery mechanism.

A valid Cheat Code:
- requires an authenticated Crown session;
- requires access to the House where the code is being entered;
- resolves server-side;
- stores only a SHA-256 hash of the normalized code in the database;
- unlocks the mapped signal only for the redeeming member;
- records the redemption;
- may be limited by expiration or redemption count;
- must not alter the signal's canonical House.

No real Cheat Code is considered canon until an explicit code + signal + House mapping is approved.

Do not invent production Cheat Codes merely to demonstrate the feature.

## Former-Member / Hidden-Signal Law

A person may be:
- current
- former
- affiliate
- guest
- test

A former CROWD member may be removed from the default roster while remaining available as a hidden signal.

This allows historical identity and discovery mechanics without falsely presenting the person as current CROWD.

## Cross-House Media Law

Artist identity and media placement are not identical.

A person may appear as a signal in one House while specific media belongs to another House.

Example:
- X Tha God may remain a CROWD signal;
- later X battles may be assigned to GBE through media access/House policy;
- X may also be revealable as a GBE Player signal through a future GBE Cheat Code.

Each media item's House requirement remains governed by `media_access_policy.house_slug`.

## Data Model

`player_signals`
- canonical signal identity and Player presentation metadata.

`house_player_roster`
- House-to-signal relationship;
- default visibility;
- current/former/affiliate/guest/test status.

`member_signal_unlocks`
- member-specific House roster exceptions.

`player_cheat_codes`
- hashed House-scoped code-to-signal mapping.

`player_cheat_redemptions`
- member redemption history.

## UX Law

The Player must include a Cheat Code terminal at the bottom of the roster panel.

The selected poster stage should extend deep enough down the page to:
- preserve full artist poster composition;
- align the roster column to the same floor;
- reserve intentional space for the terminal.

The terminal language may use:
- CHEAT CODE // HIDDEN SIGNAL
- ENTER CHEAT CODE
- EXECUTE
- CHEAT ACCEPTED // [SIGNAL] UNLOCKED
- CHEAT CODE // NO SIGNAL FOUND

## Security

- Cheat Code resolution occurs server-side.
- Roster API requires authenticated Crown identity.
- House-specific roster/cheat access requires active `member_access` for that House.
- A client must not be able to reveal hidden signals merely by editing DOM or query parameters.
- Cheat Code hashes are not returned to clients.

## Migration

Migration 0023 establishes this foundation.

Initial seed:
- The CROWD default: X Tha God, Big Tali.
- GBE default: DeeJayy.
- AWE-000001: DeeJayy legacy CROWD preview unlock.
- no real Cheat Codes seeded.
