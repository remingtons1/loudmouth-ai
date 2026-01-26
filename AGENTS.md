# Loudmouth - Repository Guidelines

Marketing automation AI agent built on Clawdbot.

## Project Structure

- `src/` - Core source code (inherited from Clawdbot)
- `skills/` - Agent skills (marketing skills are here)
  - `ga4/` - Google Analytics 4 integration
  - `search-console/` - Google Search Console integration
  - `marketing-reporter/` - Weekly performance reports
  - `content-writer/` - Content generation
  - `social-posting/` - LinkedIn and Twitter/X posting
- `extensions/` - Messaging channel plugins
- `docs/` - Documentation
- `dist/` - Built output

## Marketing Skills

When working on marketing features, focus on these skill files:

| Skill | File | Purpose |
|-------|------|---------|
| GA4 | `skills/ga4/SKILL.md` | Traffic, conversions, user behavior |
| Search Console | `skills/search-console/SKILL.md` | Keywords, rankings, CTR |
| Reporter | `skills/marketing-reporter/SKILL.md` | Weekly reports workflow |
| Content | `skills/content-writer/SKILL.md` | Blog posts, briefs, social copy |
| Social | `skills/social-posting/SKILL.md` | LinkedIn/Twitter posting |

## Adding New Skills

1. Create folder: `skills/skill-name/`
2. Create `SKILL.md` with:
   - YAML frontmatter (name, description, metadata)
   - Setup instructions
   - API/CLI examples
   - Common operations

Example frontmatter:
```yaml
---
name: skill-name
description: What this skill does
metadata: {"clawdbot":{"emoji":"📊","requires":{"env":["API_KEY"]}}}
---
```

## Development

```bash
# Install deps
pnpm install

# Build
pnpm build

# Run in dev mode
pnpm dev

# Run CLI
pnpm clawdbot agent
# or
pnpm loudmouth agent

# Test
pnpm test
```

## Naming

- Product name: **Loudmouth**
- CLI commands: `loudmouth` (primary), `clawdbot` (alias)
- npm package: `loudmouth-ai`

## Upstream Sync

This is a fork of [Clawdbot](https://github.com/clawdbot/clawdbot). To pull upstream changes:

```bash
git remote add upstream https://github.com/clawdbot/clawdbot.git
git fetch upstream
git merge upstream/main
```

Resolve conflicts carefully - preserve marketing skills and branding changes.
