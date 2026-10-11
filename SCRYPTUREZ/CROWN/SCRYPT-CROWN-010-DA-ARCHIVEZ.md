# SCRYPT-CROWN-010 — Da Archivez

Status: ACTIVE / PREVIEW BUILD
Version: 1.0
Depends On: SCRYPT-CROWN-002
Environment: The CROWD / Crown Network

## Purpose

Da Archivez is a first-class CROWD system and a sibling of Da CROWD Player.

Canonical CROWD directory relationship:

- 02 // DA CROWD PLAYER -> watch / battle / playable media worlds
- 06 // DA ARCHIVEZ -> preserved file rooms and historical records

Do not collapse Da Archivez into Da CROWD Player.

## Navigation

Canonical path:

THE CROWD
-> 06 // DA ARCHIVEZ
-> archive directory
-> artist/person/era file room
-> Archive Player

Current active file room:
- 001 // Tha X Filez
- artist: X Tha God
- path: `/crown/crowd/archivez/tha-x-filez/`

## Archive Player

The Archive Player may visually inherit interaction patterns from Da CROWD Player:
- primary viewing screen;
- media queue;
- filters;
- next/previous navigation;
- access-state labels;
- source/provenance controls.

But its job is different.

Da CROWD Player answers:
**What do you want to watch?**

Da Archivez answers:
**What record do you want to open?**

## Data Architecture

Da Archivez has dedicated API surfaces:
- Crown: `/api/crown/archivez/catalog`
- Public: `/api/archivez/catalog`

The Archivez API may reuse the shared media/access engine internally, but:
- Archivez frontends do not call the Da CROWD Player catalog endpoint;
- collection scope is applied server-side;
- public Archivez responses are PUBLIC-only;
- Crown Archivez responses respect the existing access ladder.

## Security

The existing Crown asset gate protects `/crown/crowd/archivez/*`.

Public mirrors may exist for specific collections when explicitly approved.

A public mirror does not expose:
- HOUSE;
- UNLOCK;
- CROWN;
- VAULT;
- protected source URLs from unauthorized teasers;
- Crown comments;
- Crown analytics.

## Scale

Da Archivez must support additional file rooms later without redesigning Tha X Filez.

Future rooms may represent:
- another artist;
- a CROWD personality;
- an event era;
- a league;
- a campaign;
- a historical collection.

Each room should retain its own collection identity and access policy.

## Current UX Law

The CROWD page button 06 must read:
**06 // DA ARCHIVEZ**

Button 06 opens:
`/crown/crowd/archivez/`

The directory currently exposes Tha X Filez and leaves future rooms encrypted until ready.

LEVEL X must not render Tha X Filez collection media.
