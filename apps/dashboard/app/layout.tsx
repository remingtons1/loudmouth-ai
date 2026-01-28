import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Loudmouth Dashboard',
  description: 'Autonomous Marketing Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
