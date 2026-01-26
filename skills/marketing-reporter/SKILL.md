---
name: marketing-reporter
description: Generate weekly marketing performance reports combining GA4 traffic data and Search Console keyword insights. Use when asked for marketing reports, performance summaries, or weekly reviews.
homepage: null
metadata: {"clawdbot":{"emoji":"📈","requires":{"skills":["ga4","search-console"]}}}
---

# Marketing Reporter

Generate actionable marketing performance reports by combining GA4 and Search Console data.

## When to Use

- "Give me a weekly marketing report"
- "How did we perform this week/month?"
- "What's working and what's not?"
- "Marketing performance summary"
- "Weekly review"

## Report Workflow

### Step 1: Pull GA4 Traffic Data

Get overall traffic metrics for the period:
```bash
# Traffic overview (current period)
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [
      {"startDate": "7daysAgo", "endDate": "yesterday", "name": "current"},
      {"startDate": "14daysAgo", "endDate": "8daysAgo", "name": "previous"}
    ],
    "metrics": [
      {"name": "activeUsers"},
      {"name": "sessions"},
      {"name": "screenPageViews"},
      {"name": "bounceRate"},
      {"name": "averageSessionDuration"},
      {"name": "conversions"}
    ]
  }'
```

### Step 2: Pull Traffic by Source

Understand where traffic is coming from:
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "7daysAgo", "endDate": "yesterday"}],
    "dimensions": [{"name": "sessionSource"}, {"name": "sessionMedium"}],
    "metrics": [
      {"name": "sessions"},
      {"name": "activeUsers"},
      {"name": "conversions"}
    ],
    "orderBys": [{"metric": {"metricName": "sessions"}, "desc": true}],
    "limit": 10
  }'
```

### Step 3: Pull Top Pages

Identify best performing content:
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "7daysAgo", "endDate": "yesterday"}],
    "dimensions": [{"name": "pagePath"}, {"name": "pageTitle"}],
    "metrics": [
      {"name": "screenPageViews"},
      {"name": "activeUsers"},
      {"name": "averageSessionDuration"}
    ],
    "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": true}],
    "limit": 10
  }'
```

### Step 4: Pull Search Console Keywords

Get organic search performance:
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-07",
    "dimensions": ["query"],
    "rowLimit": 20
  }'
```

### Step 5: Find Opportunities

Keywords ranking 4-10 (page 1, not top 3):
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-07",
    "dimensions": ["query", "page"],
    "rowLimit": 100
  }'
```
Filter for position >= 4 and position <= 10 with impressions > 100.

## Report Template

After gathering data, format the report as follows:

---

## Weekly Marketing Report: [DATE RANGE]

### Traffic Summary

| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Users | X | Y | +/-Z% |
| Sessions | X | Y | +/-Z% |
| Page Views | X | Y | +/-Z% |
| Bounce Rate | X% | Y% | +/-Z pp |
| Avg Session | Xm Ys | Ym Ys | +/-Z% |
| Conversions | X | Y | +/-Z% |

### Traffic Sources (Top 5)

| Source / Medium | Sessions | Users | Conversions |
|-----------------|----------|-------|-------------|
| google / organic | X | Y | Z |
| direct / (none) | X | Y | Z |
| ... | ... | ... | ... |

### Top Content

| Page | Views | Users | Avg Time |
|------|-------|-------|----------|
| /blog/post-1 | X | Y | Zm Ys |
| /features | X | Y | Zm Ys |
| ... | ... | ... | ... |

### Organic Search Performance

| Keyword | Clicks | Impressions | CTR | Position |
|---------|--------|-------------|-----|----------|
| keyword 1 | X | Y | Z% | N.N |
| keyword 2 | X | Y | Z% | N.N |
| ... | ... | ... | ... | ... |

### Quick Win Opportunities

Keywords ranking 4-10 with high impressions (could push to top 3):

| Keyword | Page | Position | Impressions | Action |
|---------|------|----------|-------------|--------|
| "keyword" | /page | 5.2 | 2,400 | Optimize title/content |
| ... | ... | ... | ... | ... |

### Key Insights

1. **What's working:** [Summarize top performing channels/content]
2. **What's declining:** [Flag any significant drops]
3. **Opportunities:** [List actionable next steps]

### Recommended Actions

- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3

---

## Interpreting the Data

### Good Signs
- Week-over-week traffic growth > 5%
- Bounce rate < 50%
- Organic traffic growing faster than paid
- Conversions increasing
- Top keywords maintaining or improving position

### Warning Signs
- Traffic declining > 10% week-over-week
- Bounce rate increasing
- High-traffic pages losing rankings
- CTR below 2% for non-branded keywords
- Top keywords losing position

### Opportunity Signals
- Keywords at position 4-10 with 500+ impressions → optimize for top 3
- High impression, low CTR queries → improve titles/meta descriptions
- Pages with good traffic but low conversion → add CTAs
- New keywords appearing in top 50 → create dedicated content

## Frequency

- **Weekly:** Quick performance check, spot issues early
- **Monthly:** Deeper analysis, trend identification, planning
- **Quarterly:** Strategic review, goal setting, major pivots

## Notes

- Search Console data is delayed 2-3 days
- Compare same day-of-week ranges to account for weekly patterns
- Exclude brand keywords when analyzing SEO opportunity
- Look at 4-week trends, not just week-over-week, for true patterns
