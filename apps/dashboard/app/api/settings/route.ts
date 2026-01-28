import { NextResponse } from 'next/server'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import path from 'path'

// For cloud deployment, we'll use a WordPress page to store settings
// For local dev, we use a JSON file

function getWordPressConfig() {
  if (process.env.WORDPRESS_URL && process.env.WORDPRESS_USERNAME && process.env.WORDPRESS_APP_PASSWORD) {
    return {
      url: process.env.WORDPRESS_URL,
      username: process.env.WORDPRESS_USERNAME,
      appPassword: process.env.WORDPRESS_APP_PASSWORD
    }
  }
  const configDir = path.join(homedir(), '.config', 'wordpress')
  if (existsSync(path.join(configDir, 'url'))) {
    return {
      url: readFileSync(path.join(configDir, 'url'), 'utf8').trim(),
      username: readFileSync(path.join(configDir, 'username'), 'utf8').trim(),
      appPassword: readFileSync(path.join(configDir, 'app_password'), 'utf8').trim()
    }
  }
  return null
}

function getAuthHeader() {
  const config = getWordPressConfig()
  if (!config) return null
  return 'Basic ' + Buffer.from(`${config.username}:${config.appPassword}`).toString('base64')
}

const SETTINGS_PAGE_SLUG = 'loudmouth-settings-do-not-delete'

async function getSettingsPageId(): Promise<number | null> {
  const config = getWordPressConfig()
  if (!config) return null

  const res = await fetch(`${config.url}/wp-json/wp/v2/pages?slug=${SETTINGS_PAGE_SLUG}&status=draft,publish,private`, {
    headers: { 'Authorization': getAuthHeader()! }
  })

  const pages = await res.json()
  return pages?.[0]?.id || null
}

async function createSettingsPage(): Promise<number> {
  const config = getWordPressConfig()!

  const res = await fetch(`${config.url}/wp-json/wp/v2/pages`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader()!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Loudmouth Settings (Do Not Delete)',
      slug: SETTINGS_PAGE_SLUG,
      status: 'private',
      content: JSON.stringify(getDefaultSettings())
    })
  })

  const page = await res.json()
  return page.id
}

export interface StyleGuide {
  brandName: string
  brandDescription: string
  tone: string
  audience: string
  keywords: string[]
  avoidWords: string[]
  ctaText: string
  additionalGuidelines: string
}

export interface Settings {
  styleGuide: StyleGuide
  updatedAt: string
}

function getDefaultSettings(): Settings {
  return {
    styleGuide: {
      brandName: 'Envision Horizons',
      brandDescription: 'A full-service Amazon agency helping brands succeed on Amazon through strategy, advertising, and operational excellence.',
      tone: 'Professional yet approachable. Expert but not condescending. Data-driven with actionable insights.',
      audience: 'E-commerce brands, DTC companies, and CPG brands looking to grow on Amazon. Decision makers include founders, marketing directors, and e-commerce managers.',
      keywords: ['Amazon agency', 'Amazon advertising', 'Amazon brand management', 'e-commerce growth'],
      avoidWords: ['cheap', 'easy', 'guarantee', 'best'],
      ctaText: 'Ready to grow your Amazon business? Contact Envision Horizons for a free consultation.',
      additionalGuidelines: ''
    },
    updatedAt: new Date().toISOString()
  }
}

// GET - Load settings
export async function GET() {
  try {
    const config = getWordPressConfig()
    if (!config) {
      return NextResponse.json(getDefaultSettings())
    }

    let pageId = await getSettingsPageId()

    if (!pageId) {
      // Create settings page if it doesn't exist
      pageId = await createSettingsPage()
      return NextResponse.json(getDefaultSettings())
    }

    // Fetch the settings page
    const res = await fetch(`${config.url}/wp-json/wp/v2/pages/${pageId}`, {
      headers: { 'Authorization': getAuthHeader()! }
    })

    const page = await res.json()
    const content = page.content?.raw || page.content?.rendered?.replace(/<[^>]*>/g, '') || ''

    try {
      const settings = JSON.parse(content)
      return NextResponse.json(settings)
    } catch {
      return NextResponse.json(getDefaultSettings())
    }
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(getDefaultSettings())
  }
}

// PUT - Save settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const config = getWordPressConfig()

    if (!config) {
      return NextResponse.json({ error: 'WordPress not configured' }, { status: 500 })
    }

    let pageId = await getSettingsPageId()

    if (!pageId) {
      pageId = await createSettingsPage()
    }

    const settings: Settings = {
      styleGuide: body.styleGuide,
      updatedAt: new Date().toISOString()
    }

    const res = await fetch(`${config.url}/wp-json/wp/v2/pages/${pageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': getAuthHeader()!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: JSON.stringify(settings)
      })
    })

    const page = await res.json()

    if (page.code) {
      throw new Error(page.message || 'Failed to save settings')
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    )
  }
}
