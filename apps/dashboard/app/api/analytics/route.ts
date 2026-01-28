import { NextResponse } from 'next/server'
import { getTrafficData, getTopPages, getTrafficSources } from '@/lib/ga4'

export async function GET() {
  try {
    const [traffic, topPages, sources] = await Promise.all([
      getTrafficData(),
      getTopPages(10),
      getTrafficSources()
    ])

    return NextResponse.json({
      traffic,
      topPages,
      sources
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
