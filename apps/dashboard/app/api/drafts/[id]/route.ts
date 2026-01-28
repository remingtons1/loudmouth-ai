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

// GET - Get single draft
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const config = getWordPressConfig()

    const res = await fetch(`${config.url}/wp-json/wp/v2/posts/${id}`, {
      headers: { 'Authorization': getAuthHeader() }
    })

    const post = await res.json()

    if (post.code) {
      throw new Error(post.message || 'Post not found')
    }

    return NextResponse.json({
      id: post.id,
      title: post.title?.rendered || '',
      content: post.content?.rendered || '',
      excerpt: post.excerpt?.rendered || '',
      status: post.status,
      date: post.date,
      modified: post.modified
    })
  } catch (error) {
    console.error('Get draft error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch draft' },
      { status: 500 }
    )
  }
}

// PUT - Update draft (edit content or publish)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const config = getWordPressConfig()

    const res = await fetch(`${config.url}/wp-json/wp/v2/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        status: body.status || 'draft'
      })
    })

    const post = await res.json()

    if (post.code) {
      throw new Error(post.message || 'Failed to update post')
    }

    return NextResponse.json({
      id: post.id,
      title: post.title?.rendered || '',
      status: post.status,
      link: post.link,
      published: post.status === 'publish'
    })
  } catch (error) {
    console.error('Update draft error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update draft' },
      { status: 500 }
    )
  }
}

// DELETE - Delete draft
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const config = getWordPressConfig()

    const res = await fetch(`${config.url}/wp-json/wp/v2/posts/${id}?force=true`, {
      method: 'DELETE',
      headers: { 'Authorization': getAuthHeader() }
    })

    const result = await res.json()

    if (result.code) {
      throw new Error(result.message || 'Failed to delete post')
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Delete draft error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete draft' },
      { status: 500 }
    )
  }
}
