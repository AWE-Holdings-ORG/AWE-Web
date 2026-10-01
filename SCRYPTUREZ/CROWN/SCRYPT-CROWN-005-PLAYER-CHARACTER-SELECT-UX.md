# SCRYPT-CROWN-005 — Da CROWD Player Character Select UX

Status: ACTIVE / IMPLEMENTING
Date: 2026-09-30
Domain: Crown / Da CROWD Player
Branch: feature/crown-door-v1

## Purpose
Da CROWD Player artist selection must feel like an original character-select experience rather than a conventional artist-card directory.

The experience may draw from the broad visual language of fighting-game and character-selection interfaces, but it must remain an original AWE/CROWD presentation and must not copy another game's specific UI assets, logos, artwork, or versus composition.

## Core Interaction Law
- Open on SELECT YOUR SIGNAL.
- Artists use compact portrait/headshot slots.
- Hover, keyboard focus, or tap selects a discovered artist.
- Selection updates a larger preview with identity, affiliation, world, and status.
- An available artist world exposes PRESS START.
- PRESS START enters that artist world.
- Mobile uses tap-to-select.
- Locked identities remain encrypted.

## Slot Law

### Discovered / Active
May show:
- portrait/headshot
- artist number
- artist name
- active/unlocked state

### Discovered / Building
An artist can be recognized before their world is ready.
The slot remains selectable, but PRESS START is withheld and the preview reports WORLD BUILDING or IN DEVELOPMENT.

### Locked / Unknown
Canonical language:
- UNKNOWN SIGNAL
- IDENTITY // ENCRYPTED
- REPRESENTS // UNKNOWN
- WORLD // UNDISCOVERED
- SIGNAL LOCKED

Locked slots must not reveal a normal route into the artist or Crown architecture.

## X Tha God / Artist 001
- Slot: 01
- Name: X THA GOD
- Represents: THE CROWD // GBE
- World: LEVEL X
- State: ACTIVE // UNLOCKED
- PRESS START destination: /crown/crowd/level-x/
- Roster slot uses the user-supplied close headshot.
- Selected preview may use the larger canonical X character artwork.

The 2026-09-30 headshot source is intended specifically for the compact roster box and does not replace the larger canonical character artwork.

## Current Recognized Artists
- 01 — X Tha God — world available.
- 02 — Big Tali / Big Taliban — identity recognized; world in development.
- 03 — DeeJayy — identity recognized; GBE; no automatic CROWD affiliation; world in development.

DeeJayy image canon:
- roster/headshot slot uses the user-supplied close-up car selfie;
- selected/hover preview uses the user-supplied full-body "DEEJAYY — Benton Harbor, Michigan" character artwork;
- DeeJayy remains WORLD // IN DEVELOPMENT until a destination is canonically assigned.
- Remaining slots stay encrypted until canonically introduced.

## Visual Law
- Preserve the dark Crown/CROWD system with gold signal accents.
- Compact slots must read quickly as a roster grid.
- Selected state must be unmistakable.
- Headshots crop-to-fill inside the slot while preserving the face.
- Large preview may use fuller artwork.
- A VS composition is not required.

## Selected Preview Image Law
- The compact roster box may crop a headshot to fill its square.
- The large selected-artist preview should preserve the full canonical artwork by default rather than aggressively crop it.
- Do not place a dark directional fade over selected artwork; artist artwork should remain visibly readable across the frame. The information card provides its own opaque/translucent contrast.
- Use contain-style presentation for full artwork, with a dark/blurred backfill when necessary to preserve the Player composition.
- Identity/status copy may overlay the preview, but should not unnecessarily obscure the artist's face or key artwork.
- Mobile may reposition the artwork and information panel while preserving the full-art intent.

## Accessibility / Responsive Law
- Hover, keyboard focus, and touch selection must work.
- Selected artist uses aria-selected.
- PRESS START is a normal navigable link when available.
- Reduced-motion preferences are respected.
- Mobile preserves selection → preview → PRESS START.

## Authority
This SCRYPT governs the Da CROWD Player artist-selection lobby presentation. Access authorization remains governed by SCRYPT-CROWN-001 and SCRYPT-CROWN-002.
