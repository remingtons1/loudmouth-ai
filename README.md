# Loudmouth 📢

AI-powered marketing automation. Analytics, SEO, content, and social - all from the command line.

## What it does

Loudmouth is an AI agent that handles your marketing workflows:

- **Analytics** → Pull GA4 traffic data, track conversions, monitor trends
- **SEO** → Search Console keyword rankings, find opportunities, track positions
- **Reporting** → Weekly performance reports with actionable insights
- **Content** → Generate blog posts, meta descriptions, social copy
- **Social** → Post to LinkedIn and Twitter/X

Talk to it naturally: *"What are my top performing pages this month?"* or *"Write a blog post targeting 'marketing automation' keyword"*

## Install

```bash
npm install -g loudmouth-ai
loudmouth onboard
```

## Quick Start

```bash
# Start the agent
loudmouth agent

# Or connect via your favorite messaging app
loudmouth gateway   # Then connect WhatsApp, Slack, Discord, etc.
```

## Marketing Skills

| Skill | What it does |
|-------|--------------|
| `ga4` | Google Analytics 4 - traffic, conversions, user behavior |
| `search-console` | Google Search Console - keywords, rankings, CTR |
| `marketing-reporter` | Weekly reports combining GA4 + Search Console |
| `content-writer` | Blog posts, briefs, meta descriptions, social copy |
| `social-posting` | LinkedIn and Twitter/X posting |

## Setup Credentials

### Google Analytics 4 & Search Console

```bash
# 1. Create service account at Google Cloud Console
# 2. Enable Analytics Data API and Search Console API
# 3. Download credentials JSON

mkdir -p ~/.config/ga4
cp ~/Downloads/credentials.json ~/.config/ga4/credentials.json
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/ga4/credentials.json

# 4. Add service account email to GA4 and Search Console properties
# 5. Store your property ID
echo "YOUR_GA4_PROPERTY_ID" > ~/.config/ga4/property_id
echo "https%3A%2F%2Fyoursite.com" > ~/.config/gsc/site_url
```

### LinkedIn

```bash
# 1. Create app at LinkedIn Developers
# 2. Add "Share on LinkedIn" product
# 3. Complete OAuth flow to get access token

mkdir -p ~/.config/linkedin
echo "YOUR_ACCESS_TOKEN" > ~/.config/linkedin/access_token
```

### Twitter/X

```bash
# 1. Create app at X Developer Portal
# 2. Generate API keys and tokens

mkdir -p ~/.config/twitter
echo "YOUR_BEARER_TOKEN" > ~/.config/twitter/bearer_token
```

## Example Conversations

**Analytics:**
> "How did organic traffic perform this week compared to last week?"

> "What are my top 10 landing pages by sessions?"

**SEO:**
> "What keywords am I ranking for positions 4-10 with high impressions?"

> "Show me pages with high impressions but low CTR"

**Reporting:**
> "Generate a weekly marketing report"

> "What's working and what's not?"

**Content:**
> "Write a blog post targeting 'email marketing best practices'"

> "Create a content brief for a post about marketing automation"

**Social:**
> "Post this to LinkedIn: [your content]"

> "Create a Twitter thread about our latest blog post"

## All Channels Supported

Connect via WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, Microsoft Teams, or WebChat. Run `loudmouth gateway` to set up.

## Built on Clawdbot

Loudmouth is a marketing-focused fork of [Clawdbot](https://github.com/clawdbot/clawdbot), the open-source AI assistant with 30k+ GitHub stars. It includes all of Clawdbot's capabilities (messaging, browser automation, scheduling, voice) plus specialized marketing skills.

## Requirements

- Node.js 22+
- Google Cloud account (for GA4/Search Console)
- LinkedIn Developer account (for social posting)
- Twitter/X Developer account (for social posting)

## License

MIT
