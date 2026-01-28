import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import path from 'path'

function getWordPressConfig() {
  // First try environment variables
  if (process.env.WORDPRESS_URL && process.env.WORDPRESS_USERNAME && process.env.WORDPRESS_APP_PASSWORD) {
    return {
      url: process.env.WORDPRESS_URL,
      username: process.env.WORDPRESS_USERNAME,
      appPassword: process.env.WORDPRESS_APP_PASSWORD
    }
  }

  // Fall back to files
  const configDir = path.join(homedir(), '.config', 'wordpress')
  const urlPath = path.join(configDir, 'url')

  if (existsSync(urlPath)) {
    return {
      url: readFileSync(path.join(configDir, 'url'), 'utf8').trim(),
      username: readFileSync(path.join(configDir, 'username'), 'utf8').trim(),
      appPassword: readFileSync(path.join(configDir, 'app_password'), 'utf8').trim()
    }
  }

  throw new Error('No WordPress credentials found. Set WORDPRESS_URL, WORDPRESS_USERNAME, and WORDPRESS_APP_PASSWORD environment variables.')
}

function getAuthHeader() {
  const config = getWordPressConfig()
  return 'Basic ' + Buffer.from(`${config.username}:${config.appPassword}`).toString('base64')
}

export interface WordPressPost {
  id: number
  title: string
  date: string
  status: string
  link: string
  slug: string
}

export async function getRecentPosts(limit = 10): Promise<WordPressPost[]> {
  const config = getWordPressConfig()

  const res = await fetch(`${config.url}/wp-json/wp/v2/posts?per_page=${limit}&orderby=date&order=desc`, {
    headers: { 'Authorization': getAuthHeader() }
  })

  const data = await res.json()

  if (!Array.isArray(data)) {
    throw new Error(data.message || 'Failed to fetch posts')
  }

  return data.map((post: any) => ({
    id: post.id,
    title: post.title?.rendered?.replace(/&amp;/g, '&').replace(/&#8211;/g, '-') || 'Untitled',
    date: post.date?.split('T')[0] || '',
    status: post.status,
    link: post.link,
    slug: post.slug
  }))
}

export interface CreatePostInput {
  title: string
  content: string
  status?: 'draft' | 'publish' | 'future'
  slug?: string
  excerpt?: string
  date?: string // ISO format for scheduled posts
}

export async function createPost(input: CreatePostInput): Promise<WordPressPost> {
  const config = getWordPressConfig()

  const res = await fetch(`${config.url}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: input.title,
      content: input.content,
      status: input.status || 'draft',
      slug: input.slug,
      excerpt: input.excerpt,
      date: input.date
    })
  })

  const data = await res.json()

  if (data.code) {
    throw new Error(data.message || 'Failed to create post')
  }

  return {
    id: data.id,
    title: data.title?.rendered || input.title,
    date: data.date?.split('T')[0] || '',
    status: data.status,
    link: data.link,
    slug: data.slug
  }
}

export async function getPostCount(): Promise<{ published: number; drafts: number }> {
  const config = getWordPressConfig()

  const [publishedRes, draftsRes] = await Promise.all([
    fetch(`${config.url}/wp-json/wp/v2/posts?status=publish&per_page=1`, {
      headers: { 'Authorization': getAuthHeader() }
    }),
    fetch(`${config.url}/wp-json/wp/v2/posts?status=draft&per_page=1`, {
      headers: { 'Authorization': getAuthHeader() }
    })
  ])

  return {
    published: parseInt(publishedRes.headers.get('X-WP-Total') || '0'),
    drafts: parseInt(draftsRes.headers.get('X-WP-Total') || '0')
  }
}
