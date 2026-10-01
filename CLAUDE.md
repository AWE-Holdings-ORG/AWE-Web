# AWE-Web Claude Code Instructions

Read AGENTS.md first, then SCRYPTUREZ/INDEX.md.

## Windows Bootstrap

If `claude` is not recognized in native Windows PowerShell, install Claude Code with Anthropic's recommended native installer:

```powershell
irm https://claude.ai/install.ps1 | iex
```

After installation, open a new PowerShell window and verify:

```powershell
claude --version
claude doctor
```

Alternative WinGet installation:

```powershell
winget install Anthropic.ClaudeCode
```

Then launch Claude Code from this repository root:

```powershell
cd "C:\Users\shaym\Documents\Codex\2026-09-28\a\work\AWE-Web"
claude
```

## Cloudflare

Use the installed Cloudflare plugin/Skills for current platform guidance.
Use Cloudflare MCP for account/API operations when appropriate.
Use Wrangler for Workers development, Preview deployments, D1 migrations, and logs.

Inside Claude Code, install the Cloudflare bundle:

```text
/plugin marketplace add cloudflare/skills
/plugin install cloudflare@cloudflare
```

After OAuth, verify Cloudflare MCP connectivity from PowerShell:

```powershell
claude mcp list
```

Current Preview D1:
- awe-crown-identity-preview
- d93128c2-d34d-4372-be01-72ae772a9230

Stay on feature/crown-door-v1 for current Crown/Player work unless explicitly told otherwise.

## AWE Law

THE SCRYPTUREZ is authoritative.
Do not invent product law from implementation details.
Do not merge to main or touch production resources without explicit approval.
Do not commit secrets.

For Player access work, read:
- SCRYPTUREZ/CROWN/SCRYPT-CROWN-001-PLAYER-ACCESS-LAW.md
- SCRYPTUREZ/CROWN/SCRYPT-CROWN-002-PLAYER-ACCESS-RESOLVER.md
- SCRYPTUREZ/CROWN/SCRYPT-CROWN-004-PLAYER-PREVIEW-PROMOTION.md
