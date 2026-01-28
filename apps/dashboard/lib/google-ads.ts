// Google Ads API for Keyword Planner search volume data

interface KeywordSearchVolume {
  keyword: string
  avgMonthlySearches: number
  competition: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNSPECIFIED'
  competitionIndex: number
  lowTopOfPageBid: number
  highTopOfPageBid: number
}

interface GoogleAdsConfig {
  developerToken: string
  clientId: string
  clientSecret: string
  refreshToken: string
  customerId: string
}

function getConfig(): GoogleAdsConfig {
  const config = {
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || ''
  }

  if (!config.developerToken || !config.clientId || !config.clientSecret || !config.refreshToken || !config.customerId) {
    throw new Error('Google Ads API credentials not configured. Required: GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CUSTOMER_ID')
  }

  return config
}

async function getAccessToken(config: GoogleAdsConfig): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token'
    })
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to get access token: ${error}`)
  }

  const data = await res.json()
  return data.access_token
}

export async function getKeywordSearchVolume(keywords: string[]): Promise<KeywordSearchVolume[]> {
  const config = getConfig()
  const accessToken = await getAccessToken(config)

  // Remove dashes from customer ID if present
  const customerId = config.customerId.replace(/-/g, '')

  // Use the Keyword Planner generateKeywordHistoricalMetrics method
  const res = await fetch(
    `https://googleads.googleapis.com/v15/customers/${customerId}:generateKeywordHistoricalMetrics`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': config.developerToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keywords: keywords.slice(0, 10), // API limit
        language: 'languageConstants/1000', // English
        geoTargetConstants: ['geoTargetConstants/2840'], // United States
        keywordPlanNetwork: 'GOOGLE_SEARCH'
      })
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Google Ads API error: ${error}`)
  }

  const data = await res.json()

  return (data.results || []).map((result: any) => {
    const metrics = result.keywordMetrics || {}
    return {
      keyword: result.text || '',
      avgMonthlySearches: parseInt(metrics.avgMonthlySearches || '0'),
      competition: metrics.competition || 'UNSPECIFIED',
      competitionIndex: parseInt(metrics.competitionIndex || '0'),
      lowTopOfPageBid: parseInt(metrics.lowTopOfPageBidMicros || '0') / 1000000,
      highTopOfPageBid: parseInt(metrics.highTopOfPageBidMicros || '0') / 1000000
    }
  })
}

export async function getKeywordIdeas(seedKeyword: string, limit = 10): Promise<KeywordSearchVolume[]> {
  const config = getConfig()
  const accessToken = await getAccessToken(config)

  const customerId = config.customerId.replace(/-/g, '')

  const res = await fetch(
    `https://googleads.googleapis.com/v15/customers/${customerId}:generateKeywordIdeas`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': config.developerToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keywordSeed: {
          keywords: [seedKeyword]
        },
        language: 'languageConstants/1000',
        geoTargetConstants: ['geoTargetConstants/2840'],
        keywordPlanNetwork: 'GOOGLE_SEARCH',
        pageSize: limit
      })
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Google Ads API error: ${error}`)
  }

  const data = await res.json()

  return (data.results || []).map((result: any) => {
    const metrics = result.keywordIdeaMetrics || {}
    return {
      keyword: result.text || '',
      avgMonthlySearches: parseInt(metrics.avgMonthlySearches || '0'),
      competition: metrics.competition || 'UNSPECIFIED',
      competitionIndex: parseInt(metrics.competitionIndex || '0'),
      lowTopOfPageBid: parseInt(metrics.lowTopOfPageBidMicros || '0') / 1000000,
      highTopOfPageBid: parseInt(metrics.highTopOfPageBidMicros || '0') / 1000000
    }
  })
}
