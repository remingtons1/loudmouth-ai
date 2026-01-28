import { NextResponse } from 'next/server'
import { generateContent, ContentRequest, StyleGuide } from '@/lib/ai'
import { createPost } from '@/lib/wordpress'

async function getStyleGuide(): Promise<StyleGuide | undefined> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/settings`, {
      headers: { 'Cookie': '' } // Internal call, no auth needed
    })
    if (!res.ok) return undefined
    const data = await res.json()
    return data.styleGuide
  } catch {
    return undefined
  }
}

export async function POST(request: Request) {
  try {
    const body: ContentRequest & { saveDraft?: boolean } = await request.json()

    // Fetch style guide if not provided
    if (!body.styleGuide) {
      body.styleGuide = await getStyleGuide()
    }

    // Generate content using AI
    const generated = await generateContent(body)

    // Optionally save as WordPress draft
    if (body.saveDraft) {
      const post = await createPost({
        title: generated.title,
        content: generated.content,
        excerpt: generated.excerpt,
        status: 'draft'
      })

      return NextResponse.json({
        generated,
        draft: post
      })
    }

    return NextResponse.json({ generated })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    )
  }
}
