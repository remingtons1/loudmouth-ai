import { NextRequest, NextResponse } from 'next/server'
import { getTrafficData, getTopPages, getTrafficSources } from '../../../lib/ga4'
import { getTopKeywords, getKeywordOpportunities } from '../../../lib/gsc'
import { getKeywordSearchVolume, getKeywordIdeas } from '../../../lib/google-ads'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

// Define the tools Claude can use
const tools = [
  {
    name: 'get_traffic_overview',
    description: 'Get website traffic overview including sessions, users, pageviews, and week-over-week change percentages',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_top_pages',
    description: 'Get the top pages by views for the last 7 days',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of pages to return (default 10)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_traffic_sources',
    description: 'Get traffic sources breakdown by channel (organic, direct, social, etc.) with session counts and percentages',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_keyword_performance',
    description: 'Get top performing keywords with clicks, impressions, CTR, and average position from Google Search Console',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of keywords to return (default 20)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_keyword_opportunities',
    description: 'Get SEO keyword opportunities including quick wins (position 4-15), content gaps (high impressions but poor ranking), and low CTR keywords that need better titles/descriptions',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_search_volume',
    description: 'Get monthly search volume, competition level, and estimated CPC for specific keywords. Use this when users ask about search volume, how popular a keyword is, or keyword difficulty.',
    input_schema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of keywords to get search volume for (max 10)'
        }
      },
      required: ['keywords']
    }
  },
  {
    name: 'get_keyword_ideas',
    description: 'Generate related keyword ideas based on a seed keyword, including search volume and competition data. Use this when users want keyword suggestions or want to expand their keyword list.',
    input_schema: {
      type: 'object',
      properties: {
        seed_keyword: {
          type: 'string',
          description: 'The seed keyword to generate ideas from'
        },
        limit: {
          type: 'number',
          description: 'Number of keyword ideas to return (default 10)'
        }
      },
      required: ['seed_keyword']
    }
  }
]

// Execute a tool and return results
async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_traffic_overview':
      return await getTrafficData()
    case 'get_top_pages':
      return await getTopPages(typeof input.limit === 'number' ? input.limit : 10)
    case 'get_traffic_sources':
      return await getTrafficSources()
    case 'get_keyword_performance':
      return await getTopKeywords(typeof input.limit === 'number' ? input.limit : 20)
    case 'get_keyword_opportunities':
      return await getKeywordOpportunities()
    case 'get_search_volume':
      return await getKeywordSearchVolume(input.keywords as string[])
    case 'get_keyword_ideas':
      return await getKeywordIdeas(input.seed_keyword as string, typeof input.limit === 'number' ? input.limit : 10)
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  try {
    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build messages array from history plus new message
    const messages = [
      ...history,
      { role: 'user', content: message }
    ]

    const systemPrompt = `You are a helpful analytics assistant for a marketing dashboard. You help team members understand their website's performance data from Google Analytics 4 and Google Search Console.

When users ask about traffic, keywords, or SEO performance, use the available tools to fetch real data and provide conversational, insightful responses.

Guidelines:
- Be concise but informative
- Highlight notable trends or changes (especially week-over-week)
- When discussing keywords, mention position, clicks, and impressions
- For SEO opportunities, prioritize actionable quick wins
- Use specific numbers from the data
- If data seems unusual, mention it

Available data:
- GA4: Sessions, users, pageviews, traffic sources, top pages (last 7 days)
- GSC: Keyword performance, SEO opportunities (last 28 days)
- Google Ads: Search volume, competition, CPC estimates, keyword ideas`

    // Initial API call
    let response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${error}`)
    }

    let data = await response.json()

    // Handle tool use loop
    while (data.stop_reason === 'tool_use') {
      const toolUseBlocks = data.content.filter((block: { type: string }) => block.type === 'tool_use')
      const toolResults = []

      for (const toolUse of toolUseBlocks) {
        try {
          const result = await executeTool(toolUse.name, toolUse.input)
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          })
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
            is_error: true
          })
        }
      }

      // Continue conversation with tool results
      response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          tools,
          messages: [
            ...messages,
            { role: 'assistant', content: data.content },
            { role: 'user', content: toolResults }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Anthropic API error: ${error}`)
      }

      data = await response.json()
    }

    // Extract text response
    const textBlock = data.content.find((block: { type: string }) => block.type === 'text')
    const reply = textBlock?.text || 'Sorry, I could not generate a response.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat request failed' },
      { status: 500 }
    )
  }
}
