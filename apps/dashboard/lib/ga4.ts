import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import path from 'path'
import { getAccessToken } from './google-auth'

function getPropertyId(): string {
  // First try environment variable
  if (process.env.GA4_PROPERTY_ID) {
    return process.env.GA4_PROPERTY_ID
  }

  // Fall back to file
  const propPath = path.join(homedir(), '.config', 'ga4', 'property_id')
  if (existsSync(propPath)) {
    return readFileSync(propPath, 'utf8').trim()
  }

  throw new Error('No GA4 property ID found. Set GA4_PROPERTY_ID environment variable.')
}

export interface TrafficData {
  current: {
    sessions: number
    users: number
    pageViews: number
    avgSessionDuration: number
  }
  previous: {
    sessions: number
    users: number
    pageViews: number
  }
  change: {
    sessions: number
    users: number
  }
}

export interface TopPage {
  path: string
  views: number
  users: number
}

export interface TrafficSource {
  channel: string
  sessions: number
  users: number
  percentage: number
}

export async function getTrafficData(): Promise<TrafficData> {
  const token = await getAccessToken('https://www.googleapis.com/auth/analytics.readonly')
  const propertyId = getPropertyId()

  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [
        { startDate: '7daysAgo', endDate: 'today' },
        { startDate: '14daysAgo', endDate: '8daysAgo' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' }
      ]
    })
  })

  const data = await res.json()
  const current = data.rows?.[0]?.metricValues
  const previous = data.rows?.[1]?.metricValues

  const currentSessions = parseInt(current?.[0]?.value || '0')
  const previousSessions = parseInt(previous?.[0]?.value || '0')
  const currentUsers = parseInt(current?.[1]?.value || '0')
  const previousUsers = parseInt(previous?.[1]?.value || '0')

  return {
    current: {
      sessions: currentSessions,
      users: currentUsers,
      pageViews: parseInt(current?.[2]?.value || '0'),
      avgSessionDuration: parseFloat(current?.[3]?.value || '0')
    },
    previous: {
      sessions: previousSessions,
      users: previousUsers,
      pageViews: parseInt(previous?.[2]?.value || '0')
    },
    change: {
      sessions: previousSessions > 0 ? ((currentSessions - previousSessions) / previousSessions) * 100 : 0,
      users: previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0
    }
  }
}

export async function getTopPages(limit = 10): Promise<TopPage[]> {
  const token = await getAccessToken('https://www.googleapis.com/auth/analytics.readonly')
  const propertyId = getPropertyId()

  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit
    })
  })

  const data = await res.json()
  return data.rows?.map((row: any) => ({
    path: row.dimensionValues[0].value,
    views: parseInt(row.metricValues[0].value),
    users: parseInt(row.metricValues[1].value)
  })) || []
}

export async function getTrafficSources(): Promise<TrafficSource[]> {
  const token = await getAccessToken('https://www.googleapis.com/auth/analytics.readonly')
  const propertyId = getPropertyId()

  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10
    })
  })

  const data = await res.json()
  const rows = data.rows || []
  const totalSessions = rows.reduce((sum: number, r: any) => sum + parseInt(r.metricValues[0].value), 0)

  return rows.map((row: any) => {
    const sessions = parseInt(row.metricValues[0].value)
    return {
      channel: row.dimensionValues[0].value,
      sessions,
      users: parseInt(row.metricValues[1].value),
      percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0
    }
  })
}
