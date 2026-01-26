---
name: wordpress
description: Auto-publish content to WordPress sites. Create posts, update pages, manage media - all autonomously.
homepage: https://developer.wordpress.org/rest-api/
metadata: {"clawdbot":{"emoji":"📰","requires":{"env":["WORDPRESS_URL","WORDPRESS_USERNAME","WORDPRESS_APP_PASSWORD"]},"primaryEnv":"WORDPRESS_URL"}}
---

# WordPress - Auto-Publishing

Publish content directly to WordPress without manual intervention.

## Setup

### 1. Enable Application Passwords
In WordPress admin: Users → Your Profile → Application Passwords

Generate a new application password and save it.

### 2. Store Credentials
```bash
mkdir -p ~/.config/wordpress
echo "https://yoursite.com" > ~/.config/wordpress/url
echo "your_username" > ~/.config/wordpress/username
echo "xxxx xxxx xxxx xxxx xxxx xxxx" > ~/.config/wordpress/app_password
```

### 3. Test Connection
```bash
WP_URL=$(cat ~/.config/wordpress/url)
WP_USER=$(cat ~/.config/wordpress/username)
WP_PASS=$(cat ~/.config/wordpress/app_password)

curl -X GET "$WP_URL/wp-json/wp/v2/posts" \
  -u "$WP_USER:$WP_PASS"
```

## API Basics

```bash
WP_URL=$(cat ~/.config/wordpress/url)
WP_USER=$(cat ~/.config/wordpress/username)
WP_PASS=$(cat ~/.config/wordpress/app_password)
WP_AUTH=$(echo -n "$WP_USER:$WP_PASS" | base64)

curl -X POST "$WP_URL/wp-json/wp/v2/posts" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Publishing Posts

### Create Draft Post
```bash
curl -X POST "$WP_URL/wp-json/wp/v2/posts" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "10 Marketing Automation Tips",
    "content": "<!-- wp:paragraph --><p>Your content here...</p><!-- /wp:paragraph -->",
    "status": "draft",
    "slug": "marketing-automation-tips",
    "excerpt": "Learn the top 10 tips for marketing automation...",
    "categories": [5],
    "tags": [12, 15, 23]
  }'
```

### Publish Immediately
```bash
curl -X POST "$WP_URL/wp-json/wp/v2/posts" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Blog Post Title",
    "content": "Post content with HTML formatting...",
    "status": "publish"
  }'
```

### Schedule Future Post
```bash
curl -X POST "$WP_URL/wp-json/wp/v2/posts" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Scheduled Post",
    "content": "This will publish automatically...",
    "status": "future",
    "date": "2024-02-15T09:00:00"
  }'
```

## Updating Posts

```bash
POST_ID=123

curl -X PUT "$WP_URL/wp-json/wp/v2/posts/$POST_ID" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content..."
  }'
```

## Managing Categories & Tags

### List Categories
```bash
curl "$WP_URL/wp-json/wp/v2/categories"
```

### Create Category
```bash
curl -X POST "$WP_URL/wp-json/wp/v2/categories" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{"name": "Marketing", "slug": "marketing"}'
```

### List Tags
```bash
curl "$WP_URL/wp-json/wp/v2/tags"
```

### Create Tag
```bash
curl -X POST "$WP_URL/wp-json/wp/v2/tags" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{"name": "SEO", "slug": "seo"}'
```

## Uploading Media

### Upload Image
```bash
curl -X POST "$WP_URL/wp-json/wp/v2/media" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Disposition: attachment; filename=image.jpg" \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/image.jpg
```

### Set Featured Image
```bash
# First upload image, get media ID from response
# Then update post with featured_media

curl -X PUT "$WP_URL/wp-json/wp/v2/posts/$POST_ID" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{"featured_media": 456}'
```

## Listing Content

### Get Recent Posts
```bash
curl "$WP_URL/wp-json/wp/v2/posts?per_page=10&orderby=date&order=desc"
```

### Get Post by Slug
```bash
curl "$WP_URL/wp-json/wp/v2/posts?slug=my-post-slug"
```

### Search Posts
```bash
curl "$WP_URL/wp-json/wp/v2/posts?search=marketing"
```

## Pages (Same as Posts)

```bash
# Create page
curl -X POST "$WP_URL/wp-json/wp/v2/pages" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "About Us",
    "content": "Page content...",
    "status": "publish"
  }'
```

## SEO Fields (Yoast/RankMath)

If using Yoast or RankMath, meta fields may be available:

```bash
curl -X POST "$WP_URL/wp-json/wp/v2/posts" \
  -H "Authorization: Basic $WP_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SEO Optimized Post",
    "content": "...",
    "status": "publish",
    "meta": {
      "_yoast_wpseo_metadesc": "Meta description for search results",
      "_yoast_wpseo_focuskw": "target keyword"
    }
  }'
```

## Post Status Options

| Status | Description |
|--------|-------------|
| `publish` | Live on site |
| `draft` | Saved but not visible |
| `pending` | Awaiting review |
| `future` | Scheduled for later |
| `private` | Only visible to admins |

## Autonomous Publishing Workflow

1. **Content created** by content-writer skill
2. **SEO optimized** with meta description and focus keyword
3. **Category/tags assigned** based on topic
4. **Published or scheduled** based on content calendar
5. **Confirmed** via Slack notification

## Notes

- Application passwords have spaces - include them
- All dates in ISO 8601 format
- Content supports HTML and Gutenberg blocks
- Test with `status: draft` before going live
- Rate limit: ~60 requests/minute typical
