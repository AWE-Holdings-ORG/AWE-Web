# SCRYPT-INFRA-001 — Cloudflare Agent Setup & Operating Law

Status: ACTIVE
Version: 1.0
Domain: Infrastructure / Agent Tooling
Owner: AWE / Echo X Labs

## Purpose
Standardize how AWE coding agents interact with Cloudflare while keeping AWE
architecture, product law, identity, and operational knowledge inside THE SCRYPTUREZ.

## Official Agent Setup
Cloudflare's current agent guidance supports Codex and Claude Code through:
- Cloudflare Skills for persistent platform knowledge;
- Cloudflare MCP servers for live API/account operations;
- Wrangler for local Workers development, deployments, logs, bindings, and D1 migrations.

## Codex
Cloudflare's official Codex setup:
1. Run Codex from the project root containing wrangler.jsonc.
2. Install the Cloudflare plugin from Codex Plugins.
3. Complete Cloudflare OAuth when a Cloudflare MCP tool is first used.
4. Use Wrangler for Worker-specific local/deployment/migration operations.

Windows note: Cloudflare's current Codex CLI guide recommends WSL2 for the CLI.
The Codex desktop app can install the Cloudflare plugin through its Plugins UI.

## Claude Code
Cloudflare's official Claude Code setup:
1. Run Claude Code from the project root containing wrangler.jsonc.
2. Inside Claude Code:
   /plugin marketplace add cloudflare/skills
   /plugin install cloudflare@cloudflare
3. Complete OAuth when Cloudflare tools request authorization.
4. Verify MCP connectivity with:
   claude mcp list
5. Use Wrangler for Worker-specific local/deployment/migration operations.

## AWE Cloudflare Resource Canon
Cloudflare account currently authenticated through Wrangler:
- account id: 7832e14a605998cf972352828275a032

Preview D1:
- name: awe-crown-identity-preview
- id: d93128c2-d34d-4372-be01-72ae772a9230
- region observed: WNAM

Feature branch:
- feature/crown-door-v1

## Resource Separation
Cloudflare is infrastructure, not the owner of AWE identity or product law.

AWE/Echo X retains authority over:
- AW ID / Crown Identity
- SCRYPTUREZ
- Player access law
- CYPHERZ product law
- artist intake/provenance
- application data models and API contracts

## DNS Law
Cloudflare DNS is not currently the authoritative DNS layer for the public domain.
Do not change nameservers as part of Worker, Preview, D1, MCP, or agent setup unless
explicitly authorized under a revised infrastructure SCRYPT.

## Secret Law
Never commit or index:
- Cloudflare API tokens
- OAuth refresh/access tokens
- PCK values
- PCK/session peppers
- recovery tokens
- private keys or secret environment values

Wrangler OAuth/keyring/config storage and Cloudflare secret stores may hold secrets;
THE SCRYPTUREZ records only secret names/roles, never secret values.

## Preview Promotion Law
For current Player access work:
- use awe-crown-identity-preview only;
- apply migrations through wrangler.preview-migrations.jsonc;
- verify pending migrations before applying;
- verify access-health and LEVEL X after applying;
- do not merge to main until the governing QA gates pass.

## Agent Responsibility
Agents may execute Cloudflare operations only within the scope authorized by the
governing SCRYPT and current user instruction. When a destructive or production
operation is not clearly authorized, stop before mutation.
