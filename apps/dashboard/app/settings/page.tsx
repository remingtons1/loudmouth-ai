'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface StyleGuide {
  brandName: string
  brandDescription: string
  tone: string
  audience: string
  keywords: string[]
  avoidWords: string[]
  ctaText: string
  additionalGuidelines: string
}

interface Settings {
  styleGuide: StyleGuide
  updatedAt: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!settings) return

    setSaving(true)
    setSuccess(false)
    setError(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function updateStyleGuide(field: keyof StyleGuide, value: any) {
    if (!settings) return
    setSettings({
      ...settings,
      styleGuide: {
        ...settings.styleGuide,
        [field]: value
      }
    })
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Back
          </Link>
          <h1>
            <span style={{ fontSize: 28 }}>⚙️</span>
            Style Guide Settings
          </h1>
        </div>
        <div className="header-meta">
          Configure how AI generates content
        </div>
      </header>

      {error && (
        <div style={{
          padding: 16,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 8,
          color: '#ef4444',
          marginBottom: 24
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: 16,
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 8,
          color: '#22c55e',
          marginBottom: 24
        }}>
          Settings saved successfully!
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Brand Identity</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--text-muted)', fontSize: 14 }}>
            Basic information about your brand that shapes all content.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Brand Name</label>
            <input
              type="text"
              value={settings?.styleGuide.brandName || ''}
              onChange={(e) => updateStyleGuide('brandName', e.target.value)}
              placeholder="Your Company Name"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Brand Description</label>
            <textarea
              value={settings?.styleGuide.brandDescription || ''}
              onChange={(e) => updateStyleGuide('brandDescription', e.target.value)}
              placeholder="A brief description of what your company does and what makes it unique..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14,
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Voice & Audience</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--text-muted)', fontSize: 14 }}>
            Define your writing style and who you're speaking to.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tone & Voice</label>
            <textarea
              value={settings?.styleGuide.tone || ''}
              onChange={(e) => updateStyleGuide('tone', e.target.value)}
              placeholder="e.g., Professional yet approachable. Expert but not condescending. Data-driven with actionable insights."
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14,
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Target Audience</label>
            <textarea
              value={settings?.styleGuide.audience || ''}
              onChange={(e) => updateStyleGuide('audience', e.target.value)}
              placeholder="Describe your ideal reader. Include job titles, industries, pain points, and what they're looking for."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14,
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Keywords & Language</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--text-muted)', fontSize: 14 }}>
            Words and phrases to use or avoid in your content.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Brand Keywords <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma separated)</span>
            </label>
            <input
              type="text"
              value={settings?.styleGuide.keywords?.join(', ') || ''}
              onChange={(e) => updateStyleGuide('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
              placeholder="Amazon agency, e-commerce growth, brand management"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14
              }}
            />
            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              Key phrases that represent your brand. AI will incorporate these naturally into content.
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Words to Avoid <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma separated)</span>
            </label>
            <input
              type="text"
              value={settings?.styleGuide.avoidWords?.join(', ') || ''}
              onChange={(e) => updateStyleGuide('avoidWords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
              placeholder="cheap, easy, guarantee, best"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14
              }}
            />
            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              Words that don't fit your brand voice or could cause issues.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Call to Action</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--text-muted)', fontSize: 14 }}>
            How content should close and what action readers should take.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Default CTA</label>
            <textarea
              value={settings?.styleGuide.ctaText || ''}
              onChange={(e) => updateStyleGuide('ctaText', e.target.value)}
              placeholder="Ready to grow your business? Contact us for a free consultation."
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14,
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Additional Guidelines</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--text-muted)', fontSize: 14 }}>
            Any other instructions or preferences for content generation.
          </p>

          <div>
            <textarea
              value={settings?.styleGuide.additionalGuidelines || ''}
              onChange={(e) => updateStyleGuide('additionalGuidelines', e.target.value)}
              placeholder="Any other rules, preferences, or context the AI should know when creating content..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14,
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 48 }}>
        <Link href="/" className="btn btn-secondary">
          Cancel
        </Link>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Style Guide'}
        </button>
      </div>

      {settings?.updatedAt && (
        <footer style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13 }}>
          Last updated: {new Date(settings.updatedAt).toLocaleString()}
        </footer>
      )}
    </div>
  )
}
