# AWE-Web Agent Instructions

## Authority
THE SCRYPTUREZ is the product and infrastructure canon for this repository.
Read the relevant SCRYPT before changing architecture, access policy, identity,
Cloudflare resources, Crown behavior, CYPHERZ behavior, or artist intake.

Primary index:
- SCRYPTUREZ/INDEX.md

Code is not canonical merely because it exists. If implementation and a SCRYPT
conflict, stop and reconcile the governing SCRYPT first.

## Cloudflare Tooling
Use Cloudflare tooling in this order:

1. Cloudflare Skills / current Cloudflare documentation for product-specific guidance.
2. Cloudflare MCP for Cloudflare account/API operations when available.
3. Wrangler for Workers development, Preview deployments, logs, D1 migrations,
   bindings, and Worker-specific operations.

Use current Cloudflare documentation instead of assuming old Wrangler behavior.

## Environment Law
Current Cloudflare Preview database:
- Name: awe-crown-identity-preview
- D1 ID: d93128c2-d34d-4372-be01-72ae772a9230
- Region observed: WNAM

Current feature branch:
- feature/crown-door-v1

Production/main is NOT the default target for Crown/Player development.

Do not:
- merge to main without explicit approval;
- apply Crown/Player schema changes to a production D1 database without explicit approval;
- change authoritative nameservers as part of Worker/Preview work;
- commit API tokens, PCKs, peppers, recovery credentials, OAuth secrets, or session secrets.

Authoritative DNS remains outside Cloudflare DNS activation unless a governing
SCRYPT and explicit approval change that law.

## Player Access
Governing SCRYPTZ:
- SCRYPT-CROWN-001
- SCRYPT-CROWN-002
- SCRYPT-CROWN-004

Canonical ladder:
PUBLIC -> HOUSE -> UNLOCK -> CROWN -> VAULT

Access decisions must be enforced server-side. UI hiding is not authorization.

## Required QA Before Player Promotion
Run:
- npm run check:player-runtime
- npm run test:player-access
- python tests/player-migrations.test.py

For Preview schema work, follow:
- SCRYPTUREZ/CROWN/SCRYPT-CROWN-004-PLAYER-PREVIEW-PROMOTION.md

## Cloudflare Agent Setup
Codex should use the Cloudflare plugin/Skills and Cloudflare MCP when installed.
Claude Code should use the Cloudflare plugin/Skills and Cloudflare MCP when installed.

Wrangler remains the preferred local tool for:
- D1 migrations
- Worker deploy/preview
- tail/log inspection
- Worker-specific bindings and configuration

Never paste or persist secret token values into prompts, SCRYPTUREZ, commits, or logs.
