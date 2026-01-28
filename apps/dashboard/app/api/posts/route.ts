import { NextResponse } from 'next/server'
import { getRecentPosts, createPost, getPostCount } from '@/lib/wordpress'

export async function GET() {
  try {
    const [recentPosts, counts] = await Promise.all([
      getRecentPosts(10),
      getPostCount()
    ])

    return NextResponse.json({
      recentPosts,
      counts
    })
  } catch (error) {
    console.error('Posts API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const post = await createPost(body)

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    )
  }
}
