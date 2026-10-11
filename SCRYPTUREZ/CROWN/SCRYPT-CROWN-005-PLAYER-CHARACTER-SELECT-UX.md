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
- The roster is member-specific; two authenticated members may legitimately see different discovered signals in the same House.
- Default House roster membership and member-specific unlocks are separate concepts.
- A Cheat Code may reveal a hidden signal to one member without changing the artist's canonical House.

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
- Selected preview uses the canonical X character artwork.
- X selected-art composition uses the canonical full poster inside the tall 4:5 Player stage so the trait list and hashtags remain readable instead of being sacrificed to a short landscape crop.

The 2026-09-30 headshot source is intended specifically for the compact roster box and does not replace the larger canonical character artwork.

## Current Recognized Artists

### The CROWD default roster
- X Tha God — world available.
- Big Tali / Big Taliban — identity recognized; world in development.

### GBE default roster
- DeeJayy — identity recognized; GBE; world in development.

### Member-specific preview exception
- AWE-000001 may see DeeJayy in The CROWD through the legacy preview unlock created during Player UX testing. This is a personal roster exception, not CROWD affiliation.

DeeJayy image canon:
- roster/headshot slot uses the user-supplied close-up car selfie;
- selected/hover preview uses the user-supplied full-body "DEEJAYY — Benton Harbor, Michigan" character artwork;
- DeeJayy selected-art composition uses controlled full-stage scaling at approximately 100% stage width and 118% stage height with left/center positioning so the portrait artwork reads with the same horizontal presence as X while retaining the intended poster composition;
- DeeJayy remains WORLD // IN DEVELOPMENT until a destination is canonically assigned.
- DeeJayy is not a default CROWD roster signal. His CROWD appearance was a development/test preview only.
- DeeJayy is a canonical GBE signal and seeds the future GBE House Player roster.
- AWE-000001 may continue seeing DeeJayy in The CROWD as a legacy preview unlock; that does not create CROWD affiliation.
- Remaining slots stay encrypted until canonically introduced.

## Visual Law
- Preserve the dark Crown/CROWD system with gold signal accents.
- Compact slots must read quickly as a roster grid.
- Selected state must be unmistakable.
- Headshots crop-to-fill inside the slot while preserving the face.
- Large preview may use fuller artwork.
- The selected poster stage should run substantially down the page ("to the floor") rather than force portrait artwork into a short landscape crop.
- Canonical desktop selected-poster geometry targets a tall 4:5 stage with approximately 960px minimum height at the current layout width.
- The right roster panel stretches to the same height and reserves its lower section for the Cheat Code terminal.
- X and other full poster assets should use the tall stage so titles, traits, hashtags, and lower-poster information are not unnecessarily cropped.
- A VS composition is not required.

## Selected Preview Image Law
- The compact roster box may crop a headshot to fill its square.
- The large selected-artist preview should preserve artwork proportions while giving each selected artist a comparable visual footprint.
- Landscape artwork may use full-height scaling when that fills the stage naturally.
- Portrait promotional artwork should use controlled overscan rather than full cover when cover would crop away too much of the composition. Moderate full-height scaling (roughly 110–125%) is preferred before aggressive crop.
- Per-artist focal positioning is allowed to protect important faces, titles, and composition.
- It is acceptable for the identity / PRESS START panel to overlap part of the artist artwork.
- Do not place a dark directional fade over selected artwork; artist artwork should remain visibly readable across the frame. The information card provides its own opaque/translucent contrast.
- Use contain-style presentation for full artwork, with a dark/blurred backfill when necessary to preserve the Player composition.
- Identity/status copy may overlay the preview, but should not unnecessarily obscure the artist's face or key artwork.
- Mobile may reposition the artwork and information panel while preserving the full-art intent.

## Artist-Specific Scaling Law
- Controlled non-uniform scaling is permitted for selected promotional artwork when needed to achieve comparable visual presence across differently shaped source art.
- Use this sparingly and per artist; do not globally distort all artwork.
- The goal is presentation parity inside the Player stage, not literal source-pixel geometry.

## Accessibility / Responsive Law
- Hover, keyboard focus, and touch selection must work.
- Selected artist uses aria-selected.
- PRESS START is a normal navigable link when available.
- Reduced-motion preferences are respected.
- Mobile preserves selection → preview → PRESS START.

## Authority
This SCRYPT governs the Da CROWD Player artist-selection lobby presentation. Access authorization remains governed by SCRYPT-CROWN-001 and SCRYPT-CROWN-002.


## Canonical Asset Pipeline
Player character artwork and roster headshots use direct files under /public/assets.

Canonical current assets:
- /assets/x-tha-god-character.jpeg
- /assets/x-tha-god-headshot.jpg
- /assets/deejayy-character.png
- /assets/deejayy-headshot.jpg

Temporary Base64 text assets and embedded headshot data URIs are not part of the production Player asset pipeline and must be removed once direct assets are available.
