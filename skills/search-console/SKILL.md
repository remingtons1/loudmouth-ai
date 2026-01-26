---
name: search-console
description: Google Search Console API for keyword rankings, impressions, CTR, and organic search performance data.
homepage: https://developers.google.com/webmaster-tools
metadata: {"clawdbot":{"emoji":"🔍","requires":{"env":["GOOGLE_APPLICATION_CREDENTIALS"],"bins":["gcloud"]},"primaryEnv":"GOOGLE_APPLICATION_CREDENTIALS"}}
---

# Google Search Console

Query Search Console for keyword rankings, impressions, clicks, CTR, and search performance data.

## Setup

### 1. Enable the API
Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/searchconsole.googleapis.com) and enable the **Google Search Console API**.

### 2. Create Service Account (or reuse GA4 one)
```bash
# If you already have a GA4 service account, skip to step 3
gcloud iam service-accounts create gsc-reader --display-name="Search Console Reader"

gcloud iam service-accounts keys create ~/.config/gsc/credentials.json \
  --iam-account=gsc-reader@YOUR_PROJECT.iam.gserviceaccount.com

export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gsc/credentials.json
```

### 3. Grant Search Console Access
1. Go to [Search Console](https://search.google.com/search-console)
2. Select your property → Settings → Users and permissions
3. Add user → enter service account email
4. Grant **Full** or **Restricted** permission

### 4. Store Site URL
```bash
mkdir -p ~/.config/gsc
# URL-encoded site URL (https://example.com becomes https%3A%2F%2Fexample.com)
echo "https%3A%2F%2Fexample.com" > ~/.config/gsc/site_url

# Or for domain property (sc-domain:example.com)
echo "sc-domain%3Aexample.com" > ~/.config/gsc/site_url
```

## API Basics

```bash
SITE_URL=$(cat ~/.config/gsc/site_url)
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{...}'
```

## Common Reports

### Top Keywords (Queries)
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["query"],
    "rowLimit": 50
  }'
```

### Top Pages by Clicks
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["page"],
    "rowLimit": 50
  }'
```

### Keywords + Pages Combined
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["query", "page"],
    "rowLimit": 100
  }'
```

### High Impression, Low CTR (Optimization Opportunities)
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["query"],
    "dimensionFilterGroups": [{
      "filters": [{
        "dimension": "query",
        "operator": "notContains",
        "expression": "brand_name"
      }]
    }],
    "rowLimit": 100
  }'
```
Then filter results where `impressions > 1000` and `ctr < 0.02` (2%).

### Position 4-10 Keywords (Quick Win Opportunities)
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["query", "page"],
    "rowLimit": 500
  }'
```
Then filter results where `position >= 4` and `position <= 10` — these are on page 1 but not top 3.

### Daily Performance Trend
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["date"],
    "rowLimit": 31
  }'
```

### Performance by Country
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["country"],
    "rowLimit": 25
  }'
```

### Performance by Device
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["device"]
  }'
```

### Search Appearance (Rich Results, FAQ, etc.)
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["searchAppearance"],
    "rowLimit": 25
  }'
```

### Filter by Specific Page
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["query"],
    "dimensionFilterGroups": [{
      "filters": [{
        "dimension": "page",
        "operator": "equals",
        "expression": "https://example.com/blog/my-post"
      }]
    }],
    "rowLimit": 100
  }'
```

### Filter by Query Contains
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://www.googleapis.com/webmasters/v3/sites/$SITE_URL/searchAnalytics/query" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "dimensions": ["query", "page"],
    "dimensionFilterGroups": [{
      "filters": [{
        "dimension": "query",
        "operator": "contains",
        "expression": "how to"
      }]
    }],
    "rowLimit": 100
  }'
```

## Response Format

Every response includes these metrics for each row:
```json
{
  "rows": [
    {
      "keys": ["keyword or page"],
      "clicks": 150,
      "impressions": 5000,
      "ctr": 0.03,
      "position": 4.2
    }
  ]
}
```

| Metric | Description |
|--------|-------------|
| `clicks` | Times users clicked to your site |
| `impressions` | Times your URL appeared in results |
| `ctr` | Click-through rate (clicks/impressions) |
| `position` | Average ranking position (1 = top) |

## Dimensions

| Dimension | Description |
|-----------|-------------|
| `query` | Search keyword/phrase |
| `page` | URL that appeared in results |
| `country` | 3-letter country code (USA, GBR, etc.) |
| `device` | DESKTOP, MOBILE, TABLET |
| `date` | YYYY-MM-DD |
| `searchAppearance` | Rich result type (FAQ, VIDEO, etc.) |

## Filter Operators

| Operator | Description |
|----------|-------------|
| `equals` | Exact match |
| `notEquals` | Exclude exact match |
| `contains` | Substring match |
| `notContains` | Exclude substring |
| `includingRegex` | Regex match |
| `excludingRegex` | Exclude regex match |

## Notes

- Data is delayed 2-3 days (not realtime)
- Max 16 months of historical data
- Max 50,000 rows per request (use `startRow` for pagination)
- Rate limit: 1,200 requests/minute
- Position is averaged — a page ranking #1 and #10 for same query = position 5.5
- Anonymous queries (rare/private) are aggregated and excluded from query dimension
