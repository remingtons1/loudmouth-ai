# Loudmouth 📢

## You sleep. It markets. You wake up to results.

Loudmouth is not a marketing tool. It's an **autonomous marketing department** that runs 24/7 without you.

Set goals. Connect your accounts. Go to sleep. Wake up to published content, optimized pages, and growth.

---

## What Makes This Different

| Traditional Tools | Loudmouth |
|-------------------|-----------|
| You log in | It messages you |
| You make decisions | It makes decisions |
| You execute | It executes |
| Dashboard | Conversation |
| Monthly reports | Real-time action |
| Assists | **Replaces** |

---

## What It Does While You Sleep

- **Watches** your analytics 24/7 — spots trends, anomalies, opportunities
- **Writes** blog posts, social content, meta descriptions — autonomously
- **Publishes** to your CMS and social channels — no approval needed
- **Optimizes** underperforming pages — finds and fixes problems
- **Reports** what it did — not dashboards, actual updates in Slack
- **Learns** your brand voice — gets better over time

---

## The Stack

```
┌─────────────────────────────────────────────┐
│              AUTOPILOT BRAIN                │
│   Analyzes → Decides → Acts → Reports       │
├─────────────────────────────────────────────┤
│  GA4  │  Search Console  │  Goals Tracker   │
├───────┴──────────────────┴──────────────────┤
│  Content Writer  │  WordPress  │  Social    │
├──────────────────┴─────────────┴────────────┤
│          Slack / Discord Integration        │
└─────────────────────────────────────────────┘
```

---

## Install

```bash
npm install -g loudmouth-ai
loudmouth onboard
```

---

## Setup

### 1. Connect Analytics
```bash
# Google Analytics 4 + Search Console
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/ga4/credentials.json
echo "YOUR_GA4_PROPERTY_ID" > ~/.config/ga4/property_id
```

### 2. Connect Publishing
```bash
# WordPress
echo "https://yoursite.com" > ~/.config/wordpress/url
echo "username" > ~/.config/wordpress/username
echo "app_password" > ~/.config/wordpress/app_password

# Social (LinkedIn, Twitter)
echo "token" > ~/.config/linkedin/access_token
echo "token" > ~/.config/twitter/bearer_token
```

### 3. Connect Slack
```bash
loudmouth channels add slack
```

### 4. Set Goals
```
"Set goal: 15,000 organic sessions by end of Q1"
"Goal: publish 8 blog posts per month"
"I want 50 keywords in the top 10 by March"
```

### 5. Go Autonomous
```
"Start autopilot"
```

---

## What You'll See

**Daily (in Slack):**
```
Morning. Quick update:
• Traffic yesterday: 1,247 sessions (+5% vs last week)
• Published: "10 Email Marketing Tips"
• Noticed: Ranking dropped for "marketing automation" - already optimizing
• Today: Writing 2 posts, scheduling social for the week
```

**Weekly:**
```
# Week of Jan 20 - Marketing Autopilot Report

## What I Did
- Published 3 blog posts
- Posted 12 social updates
- Optimized 4 pages for SEO
- Fixed broken links on /pricing

## Results
- Organic traffic: +15% week-over-week
- 3 new keywords entered top 10
- Goal progress: 67% toward Q1 target

## Next Week
- Publishing: "Complete Guide to X", "How to Y"
- Optimizing: /features page (high impressions, low CTR)
- Testing: New CTA on homepage
```

---

## Skills

| Skill | What It Does |
|-------|--------------|
| `autopilot` | The brain. Analyzes, decides, acts autonomously |
| `goals` | Tracks your marketing objectives |
| `ga4` | Google Analytics 4 integration |
| `search-console` | Keyword rankings and SEO data |
| `content-writer` | Writes blog posts, briefs, social copy |
| `wordpress` | Auto-publishes to your site |
| `social-posting` | Posts to LinkedIn and Twitter/X |

---

## Pricing Comparison

| Option | Cost | Availability |
|--------|------|--------------|
| Junior Marketer | $5,000/mo | Sleeps, takes vacation |
| Marketing Agency | $10,000/mo | Has other clients |
| **Loudmouth** | **$0** (open source) | **24/7, fully dedicated** |

---

## This Is Not For Everyone

Loudmouth is for founders and small teams who:
- Know marketing matters but don't have time
- Want results, not another tool to learn
- Trust AI to make decisions
- Value their sleep

If you need approval workflows, committees, and "alignment meetings" — this isn't for you.

---

## FAQ

**Is it really autonomous?**
Yes. It will publish content without asking. That's the point.

**What if it makes a mistake?**
It logs everything. You can review, adjust, course-correct. But mostly, you'll be surprised how good it is.

**Can I still give it instructions?**
Yes. Chat with it anytime in Slack. It's a conversation, not a dashboard.

**What if I want to approve content first?**
You can set it to draft-only mode. But you're missing the point.

---

## Built on Clawdbot

Loudmouth is built on [Clawdbot](https://github.com/clawdbot/clawdbot), stripped down and focused entirely on autonomous marketing.

---

## License

MIT

---

*Stop doing marketing. Start having marketing done.*
