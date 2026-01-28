const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

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

export interface ContentRequest {
  type: 'blog_post' | 'optimize_meta' | 'social_post'
  keyword: string
  context?: string
  styleGuide?: StyleGuide
}

export interface GeneratedContent {
  title: string
  content: string
  excerpt?: string
  metaDescription?: string
  slug?: string
}

export async function generateContent(request: ContentRequest): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const style = request.styleGuide

  // Build style guide context
  const styleContext = style ? `
BRAND STYLE GUIDE:
- Brand Name: ${style.brandName}
- Brand Description: ${style.brandDescription}
- Tone & Voice: ${style.tone}
- Target Audience: ${style.audience}
- Key Brand Keywords: ${style.keywords.join(', ')}
- Words to Avoid: ${style.avoidWords.join(', ')}
- Call to Action: ${style.ctaText}
${style.additionalGuidelines ? `- Additional Guidelines: ${style.additionalGuidelines}` : ''}

IMPORTANT: Follow this style guide closely. Match the brand's tone, speak to the target audience, incorporate brand keywords naturally, and avoid the listed words.
` : ''

  let systemPrompt = ''
  let userPrompt = ''

  switch (request.type) {
    case 'blog_post':
      systemPrompt = `You are an expert content writer${style ? ` for ${style.brandName}` : ''}. ${style?.brandDescription || 'Write in a professional but approachable tone. Focus on actionable insights and real value.'}`
      userPrompt = `${styleContext}

Write a comprehensive blog post targeting the keyword "${request.keyword}".

Requirements:
- Title: Compelling, includes the keyword naturally, optimized for SEO
- Length: 1500-2000 words
- Include an introduction that hooks the reader and establishes expertise
- Use H2 and H3 subheadings (at least 4-5 sections)
- Include actionable tips, data points, and insights
- Add bullet points and lists for scannability
- End with a conclusion and call to action${style?.ctaText ? ` (use this CTA approach: "${style.ctaText}")` : ''}
- Format in HTML (use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags)
${style?.tone ? `- Match this tone: ${style.tone}` : ''}
${style?.audience ? `- Write for this audience: ${style.audience}` : ''}

${request.context ? `Additional context: ${request.context}` : ''}

Return your response as JSON with this structure:
{
  "title": "Blog post title",
  "content": "<p>Full HTML content...</p>",
  "excerpt": "2-3 sentence summary for previews",
  "metaDescription": "155 character meta description for SEO",
  "slug": "url-friendly-slug"
}`
      break

    case 'optimize_meta':
      systemPrompt = `You are an SEO expert. Write compelling meta titles and descriptions that improve click-through rates while accurately representing the content.`
      userPrompt = `${styleContext}

Create optimized meta title and description for a page targeting "${request.keyword}".

${request.context ? `Page context: ${request.context}` : ''}

Return your response as JSON:
{
  "title": "Meta title (under 60 chars)",
  "metaDescription": "Meta description (under 155 chars)",
  "content": "Suggestions for improving the page content"
}`
      break

    case 'social_post':
      systemPrompt = `You are a social media expert${style ? ` for ${style.brandName}` : ''}. Write engaging LinkedIn posts that provide value and establish thought leadership.`
      userPrompt = `${styleContext}

Write a LinkedIn post about "${request.keyword}".

${request.context ? `Context: ${request.context}` : ''}

Return your response as JSON:
{
  "title": "Post hook/headline",
  "content": "Full LinkedIn post (use line breaks for readability, include relevant hashtags)"
}`
      break
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()
  const text = data.content[0].text

  // Extract JSON from response (handle potential markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON')
  }

  return JSON.parse(jsonMatch[0])
}
