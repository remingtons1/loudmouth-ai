import { NextResponse } from 'next/server'
import { getTrafficData, getTopPages } from '@/lib/ga4'
import { getKeywordOpportunities } from '@/lib/gsc'
import { getRecentPosts } from '@/lib/wordpress'

export interface RecommendedAction {
  id: string
  priority: 'high' | 'medium' | 'low'
  type: 'content' | 'optimization' | 'technical'
  title: string
  description: string
  keyword?: string
  impressions?: number
  position?: number
}

export async function GET() {
  try {
    const [traffic, topPages, opportunities, recentPosts] = await Promise.all([
      getTrafficData(),
      getTopPages(10),
      getKeywordOpportunities(),
      getRecentPosts(5)
    ])

    const actions: RecommendedAction[] = []

    // Check for 404 pages getting traffic
    const notFoundPage = topPages.find(p => p.path.includes('404'))
    if (notFoundPage && notFoundPage.views > 50) {
      actions.push({
        id: 'fix-404',
        priority: 'high',
        type: 'technical',
        title: 'Fix broken links',
        description: `${notFoundPage.views} visitors hit 404 pages in the last 7 days. Find and fix broken links.`
      })
    }

    // Content gaps - high value opportunities
    const contentGaps = opportunities.filter(o => o.type === 'content_gap').slice(0, 3)
    contentGaps.forEach((gap, i) => {
      actions.push({
        id: `content-${i}`,
        priority: i === 0 ? 'high' : 'medium',
        type: 'content',
        title: `Write: "${gap.query}"`,
        description: gap.action,
        keyword: gap.query,
        impressions: gap.impressions,
        position: gap.position
      })
    })

    // Quick wins - optimization opportunities
    const quickWins = opportunities.filter(o => o.type === 'quick_win').slice(0, 2)
    quickWins.forEach((win, i) => {
      actions.push({
        id: `optimize-${i}`,
        priority: 'medium',
        type: 'optimization',
        title: `Optimize: "${win.query}"`,
        description: `Currently position ${win.position.toFixed(1)} with ${win.impressions} impressions. ${win.action}`,
        keyword: win.query,
        impressions: win.impressions,
        position: win.position
      })
    })

    // Low CTR fixes
    const lowCtr = opportunities.filter(o => o.type === 'low_ctr').slice(0, 2)
    lowCtr.forEach((item, i) => {
      actions.push({
        id: `ctr-${i}`,
        priority: 'low',
        type: 'optimization',
        title: `Improve CTR: "${item.query}"`,
        description: `Position ${item.position.toFixed(1)} but only ${(item.ctr * 100).toFixed(1)}% CTR. ${item.action}`,
        keyword: item.query,
        impressions: item.impressions,
        position: item.position
      })
    })

    // Traffic trend alert
    if (traffic.change.sessions < -10) {
      actions.unshift({
        id: 'traffic-drop',
        priority: 'high',
        type: 'technical',
        title: 'Traffic drop detected',
        description: `Sessions down ${Math.abs(traffic.change.sessions).toFixed(1)}% week over week. Investigate potential issues.`
      })
    }

    return NextResponse.json({
      actions,
      summary: {
        totalOpportunities: opportunities.length,
        highPriority: actions.filter(a => a.priority === 'high').length,
        trafficTrend: traffic.change.sessions
      }
    })
  } catch (error) {
    console.error('Actions API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate actions' },
      { status: 500 }
    )
  }
}
