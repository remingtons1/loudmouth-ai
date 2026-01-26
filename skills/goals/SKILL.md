---
name: goals
description: Set, track, and report on marketing goals. Powers the autonomous decision-making by providing clear targets to optimize toward.
metadata: {"clawdbot":{"emoji":"🎯"}}
---

# Goals - Marketing Objective Tracking

Set marketing goals and track progress autonomously.

## Goal Types

### Traffic Goals
```yaml
goal: traffic
metric: organic_sessions | total_sessions | page_views
target: 10000
period: monthly | quarterly | yearly
baseline: 7500  # starting point
```

### Conversion Goals
```yaml
goal: conversions
metric: signups | leads | purchases | downloads
target: 500
period: monthly
baseline: 320
```

### Content Goals
```yaml
goal: content
metric: posts_published | words_written
target: 8
period: monthly
baseline: 0  # resets each period
```

### SEO Goals
```yaml
goal: seo
metric: keywords_top_10 | keywords_top_3 | domain_authority
target: 50
period: quarterly
baseline: 35
```

### Engagement Goals
```yaml
goal: engagement
metric: social_followers | email_subscribers | avg_time_on_page
target: 5000
period: quarterly
baseline: 3200
```

## Setting Goals

Store goals in `~/.config/loudmouth/goals.yaml`:

```yaml
goals:
  - id: q1-organic-traffic
    type: traffic
    metric: organic_sessions
    target: 15000
    period: quarterly
    deadline: 2024-03-31
    baseline: 10000

  - id: monthly-content
    type: content
    metric: posts_published
    target: 8
    period: monthly
    baseline: 0

  - id: seo-rankings
    type: seo
    metric: keywords_top_10
    target: 100
    period: quarterly
    deadline: 2024-03-31
    baseline: 65
```

## Tracking Progress

### Daily Check
```bash
# Pull current metrics from GA4/Search Console
# Compare against goal targets
# Calculate progress percentage
# Determine if on-track, at-risk, or behind
```

### Progress Calculation
```
progress = (current - baseline) / (target - baseline) * 100

status:
  - on-track: progress >= expected_progress_for_date
  - at-risk: progress is 10-20% behind expected
  - behind: progress is >20% behind expected
  - ahead: progress exceeds expected
```

### Expected Progress
For a quarterly goal starting Jan 1, ending Mar 31:
- Jan 31: ~33% expected
- Feb 28: ~66% expected
- Mar 31: 100% expected

## Goal Commands

**Set a goal:**
```
"Set a goal to reach 15,000 organic sessions by end of Q1"
"I want to publish 8 blog posts per month"
"Goal: get 50 keywords ranking in top 10 by March"
```

**Check progress:**
```
"How are we doing on our goals?"
"Goal progress report"
"Are we on track for Q1?"
```

**Adjust goals:**
```
"Update the traffic goal to 12,000"
"Remove the social followers goal"
"Add a new goal: 500 newsletter signups by February"
```

## Reporting Format

### Goal Status Report
```
# Goal Progress Report - [DATE]

## 🎯 Q1 Organic Traffic
Target: 15,000 sessions/month
Current: 12,450 sessions
Progress: 83% of target
Status: ✅ ON TRACK
Trend: +8% week-over-week

## 📝 Monthly Content
Target: 8 posts
Current: 5 posts published
Progress: 62.5%
Status: ⚠️ AT RISK (need 3 more posts in 10 days)
Action: Drafting 2 posts today, 1 scheduled for Thursday

## 🔍 SEO Rankings
Target: 100 keywords in top 10
Current: 78 keywords
Progress: 78%
Status: ✅ ON TRACK
New this week: +4 keywords entered top 10
```

## Integration with Autopilot

Goals drive autonomous behavior:

1. **Prioritization** - Goals determine what actions matter most
2. **Resource allocation** - Spend more effort on at-risk goals
3. **Decision making** - When choosing between actions, pick what moves goals
4. **Reporting** - Always frame results in terms of goal progress

## Goal-Driven Actions

| Goal Status | Autonomous Action |
|-------------|-------------------|
| On track | Maintain current strategy |
| At risk | Increase activity, try new tactics |
| Behind | Alert user, propose recovery plan |
| Ahead | Document what's working, consider raising target |

## Notes

- Goals persist across sessions
- Review and adjust goals monthly
- Celebrate wins when goals are hit
- Learn from misses - what went wrong?
