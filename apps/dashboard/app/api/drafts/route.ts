import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import path from 'path'

function getWordPressConfig() {
  if (process.env.WORDPRESS_URL && process.env.WORDPRESS_USERNAME && process.env.WORDPRESS_APP_PASSWORD) {
    return {
      url: process.env.WORDPRESS_URL,
      username: process.env.WORDPRESS_USERNAME,
      appPassword: process.env.WORDPRESS_APP_PASSWORD
    }
  }

  const configDir = path.join(homedir(), '.config', 'wordpress')
  const urlPath = path.join(configDir, 'url')

  if (existsSync(urlPath)) {
    return {
      url: readFileSync(path.join(configDir, 'url'), 'utf8').trim(),
      username: readFileSync(path.join(configDir, 'username'), 'utf8').trim(),
      appPassword: readFileSync(path.join(configDir, 'app_password'), 'utf8').trim()
    }
  }

  throw new Error('WordPress not configured')
}

function getAuthHeader() {
  const config = getWordPressConfig()
  return 'Basic ' + Buffer.from(`${config.username}:${config.appPassword}`).toString('base64')
}

// GET - List all drafts
export async function GET() {
  try {
    const config = getWordPressConfig()

    const res = await fetch(`${config.url}/wp-json/wp/v2/posts?status=draft&per_page=20&orderby=modified&order=desc`, {
      headers: { 'Authorization': getAuthHeader() }
    })

    const posts = await res.json()

    if (!Array.isArray(posts)) {
      throw new Error(posts.message || 'Failed to fetch drafts')
    }

    return NextResponse.json({
      drafts: posts.map((post: any) => ({
        id: post.id,
        title: post.title?.rendered?.replace(/&amp;/g, '&').replace(/&#8211;/g, '-') || 'Untitled',
        excerpt: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || '',
        content: post.content?.rendered || '',
        date: post.date,
        modified: post.modified,
        link: post.link,
        editLink: `${config.url}/wp-admin/post.php?post=${post.id}&action=edit`
      }))
    })
  } catch (error) {
    console.error('Drafts API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
}
