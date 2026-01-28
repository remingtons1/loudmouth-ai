import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = await request.json()

  const correctPassword = process.env.DASHBOARD_PASSWORD

  if (!correctPassword) {
    return NextResponse.json({ success: false, error: 'Password not configured' }, { status: 500 })
  }

  if (password === correctPassword) {
    const cookieStore = await cookies()
    cookieStore.set('loudmouth_auth', correctPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}
