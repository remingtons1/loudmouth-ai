---
name: social-posting
description: Post content to LinkedIn and Twitter/X. Use when asked to publish, share, or post content to social media platforms.
homepage: null
metadata: {"clawdbot":{"emoji":"📱","requires":{"env":["LINKEDIN_ACCESS_TOKEN","X_BEARER_TOKEN"]}}}
---

# Social Posting

Publish content to LinkedIn and Twitter/X via their APIs.

## LinkedIn

### Setup

1. **Create App** at [LinkedIn Developers](https://www.linkedin.com/developers/apps)

2. **Add Products:**
   - Go to Products tab → Request access to "Share on LinkedIn"
   - This grants `w_member_social` scope

3. **Configure OAuth:**
   - Add redirect URL (e.g., `https://oauth.pstmn.io/v1/callback` for Postman)
   - Note your Client ID and Client Secret

4. **Get Access Token** (3-legged OAuth):
```bash
# Step 1: Get authorization code (do this in browser)
# https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=openid%20profile%20w_member_social

# Step 2: Exchange code for token
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "redirect_uri=YOUR_REDIRECT_URI" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

5. **Store token:**
```bash
mkdir -p ~/.config/linkedin
echo "YOUR_ACCESS_TOKEN" > ~/.config/linkedin/access_token
```

> **Note:** LinkedIn access tokens expire in 60 days. Refresh tokens require partner status.

### Get Your LinkedIn URN

```bash
LINKEDIN_TOKEN=$(cat ~/.config/linkedin/access_token)

curl -X GET "https://api.linkedin.com/v2/userinfo" \
  -H "Authorization: Bearer $LINKEDIN_TOKEN"
```

Save the `sub` field as your member URN:
```bash
echo "urn:li:person:YOUR_SUB_VALUE" > ~/.config/linkedin/member_urn
```

### Post Text Only

```bash
LINKEDIN_TOKEN=$(cat ~/.config/linkedin/access_token)
MEMBER_URN=$(cat ~/.config/linkedin/member_urn)

curl -X POST "https://api.linkedin.com/v2/posts" \
  -H "Authorization: Bearer $LINKEDIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Restli-Protocol-Version: 2.0.0" \
  -d '{
    "author": "'"$MEMBER_URN"'",
    "lifecycleState": "PUBLISHED",
    "visibility": "PUBLIC",
    "commentary": "Your post text goes here. Can include #hashtags and @mentions.",
    "distribution": {
      "feedDistribution": "MAIN_FEED"
    }
  }'
```

### Post with Link

```bash
curl -X POST "https://api.linkedin.com/v2/posts" \
  -H "Authorization: Bearer $LINKEDIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Restli-Protocol-Version: 2.0.0" \
  -d '{
    "author": "'"$MEMBER_URN"'",
    "lifecycleState": "PUBLISHED",
    "visibility": "PUBLIC",
    "commentary": "Check out this article about marketing automation!",
    "distribution": {
      "feedDistribution": "MAIN_FEED"
    },
    "content": {
      "article": {
        "source": "https://example.com/article",
        "title": "Article Title",
        "description": "Brief description of the article"
      }
    }
  }'
```

### Post with Image

```bash
# Step 1: Initialize upload
curl -X POST "https://api.linkedin.com/v2/images?action=initializeUpload" \
  -H "Authorization: Bearer $LINKEDIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "initializeUploadRequest": {
      "owner": "'"$MEMBER_URN"'"
    }
  }'
# Save the uploadUrl and image URN from response

# Step 2: Upload image
curl -X PUT "UPLOAD_URL_FROM_STEP_1" \
  -H "Authorization: Bearer $LINKEDIN_TOKEN" \
  --upload-file /path/to/image.jpg

# Step 3: Create post with image
curl -X POST "https://api.linkedin.com/v2/posts" \
  -H "Authorization: Bearer $LINKEDIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Restli-Protocol-Version: 2.0.0" \
  -d '{
    "author": "'"$MEMBER_URN"'",
    "lifecycleState": "PUBLISHED",
    "visibility": "PUBLIC",
    "commentary": "Post text with image",
    "distribution": {
      "feedDistribution": "MAIN_FEED"
    },
    "content": {
      "media": {
        "id": "IMAGE_URN_FROM_STEP_1"
      }
    }
  }'
```

---

## Twitter/X

### Setup

1. **Create App** at [X Developer Portal](https://developer.x.com/en/portal/dashboard)

2. **Get API Keys:**
   - Go to your app → Keys and tokens
   - Generate API Key, API Secret, Access Token, Access Token Secret
   - For OAuth 2.0: Generate Bearer Token

3. **Store credentials:**
```bash
mkdir -p ~/.config/twitter
echo "YOUR_API_KEY" > ~/.config/twitter/api_key
echo "YOUR_API_SECRET" > ~/.config/twitter/api_secret
echo "YOUR_ACCESS_TOKEN" > ~/.config/twitter/access_token
echo "YOUR_ACCESS_TOKEN_SECRET" > ~/.config/twitter/access_token_secret
echo "YOUR_BEARER_TOKEN" > ~/.config/twitter/bearer_token
```

### Post Tweet (OAuth 1.0a)

For posting tweets, OAuth 1.0a is most reliable:

```bash
# Using twurl (Twitter's OAuth CLI tool)
# Install: gem install twurl
# Authorize: twurl authorize --consumer-key KEY --consumer-secret SECRET

twurl -X POST /2/tweets -d '{"text": "Hello from the API!"}'
```

Or with curl (requires OAuth signature - complex):
```bash
# Simpler: Use a script that handles OAuth 1.0a signing
# See scripts/tweet.sh in this skill folder
```

### Post Tweet (OAuth 2.0 with PKCE)

```bash
X_ACCESS_TOKEN="YOUR_OAUTH2_TOKEN"

curl -X POST "https://api.x.com/2/tweets" \
  -H "Authorization: Bearer $X_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello from OAuth 2.0!"
  }'
```

### Post Tweet with Media (OAuth 2.0)

```bash
# Step 1: Upload media
curl -X POST "https://api.x.com/2/media/upload" \
  -H "Authorization: Bearer $X_ACCESS_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "media=@/path/to/image.jpg"
# Save media_id from response

# Step 2: Create tweet with media
curl -X POST "https://api.x.com/2/tweets" \
  -H "Authorization: Bearer $X_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Tweet with image",
    "media": {
      "media_ids": ["MEDIA_ID_FROM_STEP_1"]
    }
  }'
```

### Post Thread

```bash
# Post first tweet, get ID from response
FIRST_TWEET_ID=$(curl -X POST "https://api.x.com/2/tweets" \
  -H "Authorization: Bearer $X_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "1/ Thread opener"}' | jq -r '.data.id')

# Reply to create thread
curl -X POST "https://api.x.com/2/tweets" \
  -H "Authorization: Bearer $X_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "2/ Second tweet in thread",
    "reply": {
      "in_reply_to_tweet_id": "'"$FIRST_TWEET_ID"'"
    }
  }'
```

---

## Rate Limits

### LinkedIn
- Posts: 100 per day per member
- API calls: 100,000 per day per app

### Twitter/X (Free Tier)
- Posts: 1,500 per month
- Read: 1,500 tweets per month
- Media uploads count toward limits

### Twitter/X (Basic - $100/month)
- Posts: 3,000 per month
- Read: 10,000 tweets per month

---

## Best Practices

### Timing
- LinkedIn: Tue-Thu, 8-10am or 12pm
- Twitter: Weekdays 9am-3pm, peak at lunch

### Content
- LinkedIn: Professional, longer form OK (up to 3,000 chars)
- Twitter: Concise, punchy, threads for longer content

### Hashtags
- LinkedIn: 3-5 relevant hashtags
- Twitter: 1-2 hashtags max, or none

### Engagement
- Don't just post, respond to comments
- Space posts 3-4 hours apart minimum
- Mix content types (text, links, images)

---

## Troubleshooting

### LinkedIn 401 Unauthorized
- Token expired (60 day limit)
- Re-authorize via OAuth flow

### LinkedIn 403 Forbidden
- Missing `w_member_social` scope
- Add "Share on LinkedIn" product in dev portal

### Twitter 403 Forbidden
- App not approved for write access
- Check app permissions in developer portal

### Twitter 429 Too Many Requests
- Hit rate limit
- Wait and retry, or upgrade tier

---

## Notes

- Always preview content before posting via API
- Consider Buffer, Hootsuite, or similar for scheduling
- LinkedIn API changes frequently - check docs for updates
- Twitter free tier is very limited - consider Basic for real usage
