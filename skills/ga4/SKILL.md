---
name: ga4
description: Google Analytics 4 Data API for traffic reports, conversions, audience insights, and marketing performance metrics.
homepage: https://developers.google.com/analytics/devguides/reporting/data/v1
metadata: {"clawdbot":{"emoji":"📊","requires":{"env":["GOOGLE_APPLICATION_CREDENTIALS"],"bins":["gcloud"]},"primaryEnv":"GOOGLE_APPLICATION_CREDENTIALS"}}
---

# Google Analytics 4 (GA4)

Query GA4 properties for traffic, conversions, user behavior, and marketing performance data.

## Setup

### 1. Enable the API
Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com) and enable the **Google Analytics Data API**.

### 2. Create Service Account
```bash
# Create service account
gcloud iam service-accounts create ga4-reader --display-name="GA4 Reader"

# Download key
gcloud iam service-accounts keys create ~/.config/ga4/credentials.json \
  --iam-account=ga4-reader@YOUR_PROJECT.iam.gserviceaccount.com

# Set env var
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/ga4/credentials.json
```

### 3. Grant GA4 Access
1. Go to [Google Analytics](https://analytics.google.com) → Admin → Property Access Management
2. Click **+** → **Add users**
3. Enter service account email (e.g., `ga4-reader@your-project.iam.gserviceaccount.com`)
4. Grant **Viewer** role

### 4. Get Property ID
Find your GA4 Property ID in Analytics Admin → Property Settings. It's a 9-digit number (e.g., `123456789`).

```bash
# Store property ID
echo "123456789" > ~/.config/ga4/property_id
```

## API Basics

All requests use the Data API v1beta endpoint:

```bash
GA4_PROPERTY_ID=$(cat ~/.config/ga4/property_id)
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{...}'
```

## Common Reports

### Traffic Overview (Last 7 Days)
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
    "metrics": [
      {"name": "activeUsers"},
      {"name": "sessions"},
      {"name": "screenPageViews"},
      {"name": "bounceRate"},
      {"name": "averageSessionDuration"}
    ]
  }'
```

### Top Pages by Traffic
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "pagePath"}, {"name": "pageTitle"}],
    "metrics": [
      {"name": "screenPageViews"},
      {"name": "activeUsers"},
      {"name": "averageSessionDuration"}
    ],
    "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": true}],
    "limit": 20
  }'
```

### Traffic by Source/Medium
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "sessionSource"}, {"name": "sessionMedium"}],
    "metrics": [
      {"name": "sessions"},
      {"name": "activeUsers"},
      {"name": "conversions"},
      {"name": "bounceRate"}
    ],
    "orderBys": [{"metric": {"metricName": "sessions"}, "desc": true}],
    "limit": 20
  }'
```

### Organic Search Performance
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "landingPage"}],
    "metrics": [
      {"name": "sessions"},
      {"name": "activeUsers"},
      {"name": "conversions"},
      {"name": "engagementRate"}
    ],
    "dimensionFilter": {
      "filter": {
        "fieldName": "sessionMedium",
        "stringFilter": {"value": "organic"}
      }
    },
    "orderBys": [{"metric": {"metricName": "sessions"}, "desc": true}],
    "limit": 25
  }'
```

### Conversions by Event
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "eventName"}],
    "metrics": [
      {"name": "eventCount"},
      {"name": "conversions"},
      {"name": "totalUsers"}
    ],
    "dimensionFilter": {
      "filter": {
        "fieldName": "eventName",
        "inListFilter": {
          "values": ["purchase", "sign_up", "lead", "add_to_cart", "begin_checkout"]
        }
      }
    }
  }'
```

### Daily Traffic Trend
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "date"}],
    "metrics": [
      {"name": "activeUsers"},
      {"name": "sessions"},
      {"name": "conversions"}
    ],
    "orderBys": [{"dimension": {"dimensionName": "date"}, "desc": false}]
  }'
```

### Geographic Performance
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "country"}, {"name": "region"}],
    "metrics": [
      {"name": "activeUsers"},
      {"name": "sessions"},
      {"name": "conversions"}
    ],
    "orderBys": [{"metric": {"metricName": "activeUsers"}, "desc": true}],
    "limit": 25
  }'
```

### Device/Platform Breakdown
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
    "dimensions": [{"name": "deviceCategory"}, {"name": "operatingSystem"}],
    "metrics": [
      {"name": "activeUsers"},
      {"name": "sessions"},
      {"name": "bounceRate"},
      {"name": "conversions"}
    ]
  }'
```

### Compare Periods (This Month vs Last Month)
```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runReport" \
  -d '{
    "dateRanges": [
      {"startDate": "30daysAgo", "endDate": "today", "name": "current"},
      {"startDate": "60daysAgo", "endDate": "31daysAgo", "name": "previous"}
    ],
    "metrics": [
      {"name": "activeUsers"},
      {"name": "sessions"},
      {"name": "conversions"},
      {"name": "engagementRate"}
    ]
  }'
```

## Key Dimensions

| Dimension | Description |
|-----------|-------------|
| `date` | YYYYMMDD format |
| `pagePath` | URL path |
| `pageTitle` | Page title |
| `landingPage` | First page of session |
| `sessionSource` | Traffic source (google, facebook, etc) |
| `sessionMedium` | Traffic medium (organic, cpc, referral, email) |
| `sessionCampaignName` | UTM campaign name |
| `eventName` | GA4 event name |
| `country`, `region`, `city` | Geographic |
| `deviceCategory` | desktop, mobile, tablet |
| `browser`, `operatingSystem` | Tech stack |

## Key Metrics

| Metric | Description |
|--------|-------------|
| `activeUsers` | Users with engaged sessions |
| `sessions` | Total sessions |
| `screenPageViews` | Page views |
| `bounceRate` | Single-page session rate |
| `averageSessionDuration` | Avg session length (seconds) |
| `engagementRate` | Engaged sessions / total sessions |
| `conversions` | Total conversion events |
| `eventCount` | Total events fired |
| `newUsers` | First-time users |
| `totalRevenue` | E-commerce revenue |

## Realtime Data

For live/current data (last 30 minutes):

```bash
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://analyticsdata.googleapis.com/v1beta/properties/$GA4_PROPERTY_ID:runRealtimeReport" \
  -d '{
    "dimensions": [{"name": "country"}],
    "metrics": [{"name": "activeUsers"}]
  }'
```

## Notes

- Date formats: Use `YYYY-MM-DD`, `today`, `yesterday`, `NdaysAgo`
- Rate limits: 10 requests/second per property, 10,000 requests/day
- Response format: Rows array with `dimensionValues` and `metricValues`
- Max dimensions per request: 9
- Max metrics per request: 10
- For large exports, use `batchRunReports` endpoint
