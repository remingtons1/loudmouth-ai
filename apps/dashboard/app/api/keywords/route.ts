import { NextResponse } from 'next/server'
import { getTopKeywords, getKeywordOpportunities } from '@/lib/gsc'

export async function GET() {
  try {
    const [topKeywords, opportunities] = await Promise.all([
      getTopKeywords(20),
      getKeywordOpportunities()
    ])

    return NextResponse.json({
      topKeywords,
      opportunities
    })
  } catch (error) {
    console.error('Keywords API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch keywords' },
      { status: 500 }
    )
  }
}
