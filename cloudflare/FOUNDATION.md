# AWE Cloudflare Foundation v0.1

## Architecture
GitHub remains the source of truth. Cloudflare Pages becomes the production delivery layer.

- Public AWE site: static assets
- Crown terminal: public entry surface
- Crown Houses: server-protected routes
- Crown authentication: Pages Functions
- Crown state / revocation / entitlements: D1
- Session cookie: __Host-awe_crown (Secure + HttpOnly + SameSite=Strict)
- Unauthorized protected-route requests: generic 404
- Public Crowd video playback: YouTube-first
- Private source vault media: not exposed by URL in frontend data

## Required Cloudflare setup
1. Create or use an AWE Cloudflare account.
2. Add awenterprisesholdings.com as a Cloudflare zone.
3. Create a Pages project connected to AWE-Holdings-ORG/AWE-Web.
4. Set the production branch only after the Cloudflare foundation branch passes preview testing.
5. Create a D1 database named awe-crown.
6. Bind it to Pages Functions as CROWN_DB for preview and production.
7. Apply migrations/0001_crown_core.sql.
8. Insert Crown keys directly into D1. Do not commit plaintext keys or seed SQL containing them.
9. Set Pages Functions to FAIL CLOSED.
10. Add awenterprisesholdings.com as the Pages custom domain only after preview validation.
11. Update the registrar nameservers to the Cloudflare-assigned nameservers when ready to cut over.

## First Crown key
Current key: #CrowdShyt
SHA-256: 6403968b08c4301e5d18f12d391287961d57b49d4c4304657cd9501f003b8b5c

Example D1 bootstrap (run in Cloudflare, do not commit a plaintext key):
INSERT INTO crown_keys (id,key_hash,label,status,created_at)
VALUES ('key-crowd-001','6403968b08c4301e5d18f12d391287961d57b49d4c4304657cd9501f003b8b5c','Crowd Foundation Key','active',datetime('now'));

INSERT INTO crown_key_entitlements (key_id,entitlement)
VALUES ('key-crowd-001','crowd');

## Security law
- URLs are not security boundaries.
- Knowing /crown/crowd/ must never grant access.
- No Crown key validation in browser JavaScript.
- No Crown key hashes in production client JavaScript.
- No private Drive URLs or IDs in frontend datasets.
- All protected routes require a valid server-side session entitlement.
- A leaked URL returns 404 without a valid session.
- Revoked keys stop issuing new sessions.
- Revoked sessions stop working immediately.
- Production session lifetime starts at 24 hours and can be shortened by House later.
- Secrets never go in Git.
