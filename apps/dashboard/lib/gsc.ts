import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import path from 'path'
import { getAccessToken } from './google-auth'

function getSiteUrl(): string {
  // First try environment variable
  if (process.env.GSC_SITE_URL) {
    return encodeURIComponent(process.env.GSC_SITE_URL)
  }

  // Fall back to file
  const sitePath = path.join(homedir(), '.config', 'gsc', 'site_url')
  if (existsSync(sitePath)) {
    return encodeURIComponent(readFileSync(sitePath, 'utf8').trim())
  }

  throw new Error('No GSC site URL found. Set GSC_SITE_URL environment variable.')
}

export interface KeywordData {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface KeywordOpportunity extends KeywordData {
  type: 'quick_win' | 'content_gap' | 'low_ctr'
  action: string
}

export async function getTopKeywords(limit = 20): Promise<KeywordData[]> {
  const token = await getAccessToken('https://www.googleapis.com/auth/webmasters.readonly')
  const siteUrl = getSiteUrl()

  const endDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: limit
    })
  })

  const data = await res.json()
  return data.rows?.map((row: any) => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position
  })) || []
}

export async function getKeywordOpportunities(): Promise<KeywordOpportunity[]> {
  const token = await getAccessToken('https://www.googleapis.com/auth/webmasters.readonly')
  const siteUrl = getSiteUrl()

  const endDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 500
    })
  })

  const data = await res.json()
  const rows: KeywordData[] = data.rows?.map((row: any) => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position
  })) || []

  // Filter out brand keywords
  const nonBrand = rows.filter(r =>
    !r.query.toLowerCase().includes('envision') &&
    !r.query.toLowerCase().includes('horizon')
  )

  const opportunities: KeywordOpportunity[] = []

  // Quick wins: Position 4-15 with decent impressions
  nonBrand
    .filter(r => r.position >= 4 && r.position <= 15 && r.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5)
    .forEach(r => {
      opportunities.push({
        ...r,
        type: 'quick_win',
        action: 'Optimize existing content - improve title, meta, add internal links'
      })
    })

  // Content gaps: High impressions but poor ranking (position > 15)
  nonBrand
    .filter(r => r.position > 15 && r.impressions >= 100)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5)
    .forEach(r => {
      opportunities.push({
        ...r,
        type: 'content_gap',
        action: 'Write new comprehensive content targeting this keyword'
      })
    })

  // Low CTR: Good position but low click-through
  nonBrand
    .filter(r => r.position <= 10 && r.ctr < 0.03 && r.impressions >= 100)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5)
    .forEach(r => {
      opportunities.push({
        ...r,
        type: 'low_ctr',
        action: 'Improve title tag and meta description to increase clicks'
      })
    })

  return opportunities
}
