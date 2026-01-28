'use client'

import { useEffect, useState } from 'react'
import ChatWidget from '../components/ChatWidget'

interface TrafficData {
  current: { sessions: number; users: number; pageViews: number; avgSessionDuration: number }
  previous: { sessions: number; users: number; pageViews: number }
  change: { sessions: number; users: number }
}

interface TrafficSource {
  channel: string
  sessions: number
  percentage: number
}

interface TopPage {
  path: string
  views: number
  users: number
}

interface KeywordData {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface KeywordOpportunity extends KeywordData {
  type: 'quick_win' | 'content_gap' | 'low_ctr'
  action: string
}

interface Action {
  id: string
  priority: 'high' | 'medium' | 'low'
  type: string
  title: string
  description: string
  keyword?: string
  impressions?: number
  position?: number
}

interface Post {
  id: number
  title: string
  date: string
  status: string
  link: string
}

interface Draft {
  id: number
  title: string
  excerpt: string
  content: string
  modified: string
  editLink: string
}

interface GeneratedContent {
  title: string
  content: string
  excerpt?: string
  metaDescription?: string
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [keywords, setKeywords] = useState<any>(null)
  const [posts, setPosts] = useState<any>(null)
  const [actions, setActions] = useState<any>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])

  // Content generation state
  const [generating, setGenerating] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingContent, setEditingContent] = useState<GeneratedContent | null>(null)
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [analyticsRes, keywordsRes, postsRes, actionsRes, draftsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/keywords'),
        fetch('/api/posts'),
        fetch('/api/actions'),
        fetch('/api/drafts')
      ])

      const [analyticsData, keywordsData, postsData, actionsData, draftsData] = await Promise.all([
        analyticsRes.json(),
        keywordsRes.json(),
        postsRes.json(),
        actionsRes.json(),
        draftsRes.json()
      ])

      if (analyticsData.error) throw new Error(analyticsData.error)

      setAnalytics(analyticsData)
      setKeywords(keywordsData)
      setPosts(postsData)
      setActions(actionsData)
      setDrafts(draftsData.drafts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateContent(action: Action) {
    if (!action.keyword) return

    setGenerating(action.id)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: action.type === 'content' ? 'blog_post' : 'optimize_meta',
          keyword: action.keyword,
          saveDraft: true
        })
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      // Show editor with generated content
      setEditingContent(data.generated)
      setEditingDraftId(data.draft?.id || null)
      setShowEditor(true)

      // Refresh drafts
      const draftsRes = await fetch('/api/drafts')
      const draftsData = await draftsRes.json()
      setDrafts(draftsData.drafts || [])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setGenerating(null)
    }
  }

  async function handleGenerateFromKeyword(keyword: string, type: 'blog_post' | 'optimize_meta') {
    const genId = `kw-${keyword}`
    setGenerating(genId)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          keyword,
          saveDraft: true
        })
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setEditingContent(data.generated)
      setEditingDraftId(data.draft?.id || null)
      setShowEditor(true)

      const draftsRes = await fetch('/api/drafts')
      const draftsData = await draftsRes.json()
      setDrafts(draftsData.drafts || [])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setGenerating(null)
    }
  }

  async function handleEditDraft(draft: Draft) {
    setEditingContent({
      title: draft.title,
      content: draft.content,
      excerpt: draft.excerpt
    })
    setEditingDraftId(draft.id)
    setShowEditor(true)
  }

  async function handleSaveDraft() {
    if (!editingDraftId || !editingContent) return

    setSaving(true)
    try {
      const res = await fetch(`/api/drafts/${editingDraftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingContent.title,
          content: editingContent.content,
          excerpt: editingContent.excerpt,
          status: 'draft'
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Refresh drafts
      const draftsRes = await fetch('/api/drafts')
      const draftsData = await draftsRes.json()
      setDrafts(draftsData.drafts || [])

      alert('Draft saved!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    if (!editingDraftId || !editingContent) return

    if (!confirm('Publish this content to the live site?')) return

    setPublishing(true)
    try {
      const res = await fetch(`/api/drafts/${editingDraftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingContent.title,
          content: editingContent.content,
          excerpt: editingContent.excerpt,
          status: 'publish'
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      alert('Published! ' + (data.link || ''))
      setShowEditor(false)
      setEditingContent(null)
      setEditingDraftId(null)

      // Refresh data
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  async function handleDeleteDraft(draftId: number) {
    if (!confirm('Delete this draft?')) return

    try {
      const res = await fetch(`/api/drafts/${draftId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setDrafts(drafts.filter(d => d.id !== draftId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete draft')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>
          <span style={{ fontSize: 28 }}>📢</span>
          Loudmouth
        </h1>
        <div className="header-meta" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="status-dot status-connected"></span>
            Connected to envisionhorizons.com
          </span>
          <a href="/settings" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>
            ⚙️ Style Guide
          </a>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-3 section">
        <div className="card">
          <div className="card-title">Sessions (7 days)</div>
          <div className="stat-value">{analytics?.traffic.current.sessions.toLocaleString()}</div>
          <div className={`stat-change ${(analytics?.traffic.change.sessions || 0) >= 0 ? 'positive' : 'negative'}`}>
            {(analytics?.traffic.change.sessions || 0) >= 0 ? '↑' : '↓'}
            {Math.abs(analytics?.traffic.change.sessions || 0).toFixed(1)}% vs last week
          </div>
        </div>

        <div className="card">
          <div className="card-title">Active Users</div>
          <div className="stat-value">{analytics?.traffic.current.users.toLocaleString()}</div>
          <div className={`stat-change ${(analytics?.traffic.change.users || 0) >= 0 ? 'positive' : 'negative'}`}>
            {(analytics?.traffic.change.users || 0) >= 0 ? '↑' : '↓'}
            {Math.abs(analytics?.traffic.change.users || 0).toFixed(1)}% vs last week
          </div>
        </div>

        <div className="card">
          <div className="card-title">Content Queue</div>
          <div className="stat-value">{drafts.length}</div>
          <div className="stat-change">drafts awaiting review</div>
        </div>
      </div>

      {/* Content Queue / Drafts */}
      {drafts.length > 0 && (
        <div className="section">
          <h2 className="section-title">📝 Content Queue (Drafts)</h2>
          <div className="card">
            {drafts.map((draft) => (
              <div key={draft.id} className="action-item">
                <div className="action-item-header">
                  <span className="action-item-title">{draft.title}</span>
                  <span className="badge badge-medium">Draft</span>
                </div>
                <div className="action-item-desc">
                  {draft.excerpt?.substring(0, 150)}...
                </div>
                <div className="action-item-meta" style={{ marginTop: 12, gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => handleEditDraft(draft)}>
                    Review & Edit
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleDeleteDraft(draft.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      <div className="section">
        <h2 className="section-title">⚡ Recommended Actions</h2>
        <div className="card">
          {actions?.actions.slice(0, 5).map((action: Action) => (
            <div key={action.id} className="action-item">
              <div className="action-item-header">
                <span className="action-item-title">{action.title}</span>
                <span className={`badge badge-${action.priority}`}>{action.priority}</span>
              </div>
              <div className="action-item-desc">{action.description}</div>
              {action.impressions && (
                <div className="action-item-meta">
                  <span>{action.impressions.toLocaleString()} impressions</span>
                  {action.position && <span>Position: {action.position.toFixed(1)}</span>}
                </div>
              )}
              {action.keyword && action.type === 'content' && (
                <div style={{ marginTop: 12 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGenerateContent(action)}
                    disabled={generating === action.id}
                  >
                    {generating === action.id ? '✨ Generating...' : '✨ Write with AI'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Opportunities - Expanded */}
      <div className="section">
        <h2 className="section-title">🎯 Keyword Opportunities</h2>

        {/* Content Gaps */}
        {keywords?.opportunities?.filter((o: KeywordOpportunity) => o.type === 'content_gap').length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title" style={{ color: '#f59e0b' }}>📝 Content Gaps - Write New Content</span>
            </div>
            <p style={{ margin: '0 16px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
              High impression keywords where you rank poorly. Create comprehensive content to capture this traffic.
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th style={{ textAlign: 'right' }}>Impressions</th>
                  <th style={{ textAlign: 'right' }}>Position</th>
                  <th style={{ textAlign: 'right', width: 140 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {keywords?.opportunities
                  ?.filter((o: KeywordOpportunity) => o.type === 'content_gap')
                  .map((opp: KeywordOpportunity) => (
                    <tr key={opp.query}>
                      <td style={{ maxWidth: 280 }}>{opp.query}</td>
                      <td style={{ textAlign: 'right' }}>{opp.impressions.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>{opp.position.toFixed(1)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: 13 }}
                          onClick={() => handleGenerateFromKeyword(opp.query, 'blog_post')}
                          disabled={generating === `kw-${opp.query}`}
                        >
                          {generating === `kw-${opp.query}` ? 'Writing...' : '✨ Write'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Wins */}
        {keywords?.opportunities?.filter((o: KeywordOpportunity) => o.type === 'quick_win').length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title" style={{ color: '#22c55e' }}>⚡ Quick Wins - Optimize Existing</span>
            </div>
            <p style={{ margin: '0 16px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
              Keywords where you rank position 4-15. Small improvements can push these to page 1.
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th style={{ textAlign: 'right' }}>Impressions</th>
                  <th style={{ textAlign: 'right' }}>Position</th>
                  <th style={{ textAlign: 'right' }}>CTR</th>
                </tr>
              </thead>
              <tbody>
                {keywords?.opportunities
                  ?.filter((o: KeywordOpportunity) => o.type === 'quick_win')
                  .map((opp: KeywordOpportunity) => (
                    <tr key={opp.query}>
                      <td style={{ maxWidth: 280 }}>{opp.query}</td>
                      <td style={{ textAlign: 'right' }}>{opp.impressions.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>{opp.position.toFixed(1)}</td>
                      <td style={{ textAlign: 'right' }}>{(opp.ctr * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Low CTR */}
        {keywords?.opportunities?.filter((o: KeywordOpportunity) => o.type === 'low_ctr').length > 0 && (
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ color: '#ef4444' }}>📉 Low CTR - Improve Snippets</span>
            </div>
            <p style={{ margin: '0 16px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
              Good rankings but low click-through. Improve title tags and meta descriptions.
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th style={{ textAlign: 'right' }}>Impressions</th>
                  <th style={{ textAlign: 'right' }}>Position</th>
                  <th style={{ textAlign: 'right' }}>CTR</th>
                  <th style={{ textAlign: 'right', width: 140 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {keywords?.opportunities
                  ?.filter((o: KeywordOpportunity) => o.type === 'low_ctr')
                  .map((opp: KeywordOpportunity) => (
                    <tr key={opp.query}>
                      <td style={{ maxWidth: 250 }}>{opp.query}</td>
                      <td style={{ textAlign: 'right' }}>{opp.impressions.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>{opp.position.toFixed(1)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>{(opp.ctr * 100).toFixed(1)}%</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 13 }}
                          onClick={() => handleGenerateFromKeyword(opp.query, 'optimize_meta')}
                          disabled={generating === `kw-${opp.query}`}
                        >
                          {generating === `kw-${opp.query}` ? 'Optimizing...' : '🔧 Optimize'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {(!keywords?.opportunities || keywords.opportunities.length === 0) && (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
            No keyword opportunities found. Make sure Search Console is connected and has data.
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-2">
        {/* Traffic Sources */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Traffic Sources</span>
          </div>
          {analytics?.sources.map((source: TrafficSource) => (
            <div key={source.channel} className="channel-bar">
              <span className="channel-name">{source.channel}</span>
              <div className="channel-bar-container">
                <div
                  className="channel-bar-fill"
                  style={{ width: `${Math.max(source.percentage, 10)}%` }}
                >
                  {source.sessions.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Pages */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Pages</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Page</th>
                <th style={{ textAlign: 'right' }}>Views</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topPages.slice(0, 6).map((page: TopPage) => (
                <tr key={page.path}>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {page.path}
                  </td>
                  <td style={{ textAlign: 'right' }}>{page.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keywords */}
      <div className="section" style={{ marginTop: 24 }}>
        <h2 className="section-title">🔍 Keyword Performance</h2>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th style={{ textAlign: 'right' }}>Clicks</th>
                <th style={{ textAlign: 'right' }}>Impressions</th>
                <th style={{ textAlign: 'right' }}>Position</th>
              </tr>
            </thead>
            <tbody>
              {keywords?.topKeywords?.slice(0, 8).map((kw: KeywordData) => (
                <tr key={kw.query}>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {kw.query}
                  </td>
                  <td style={{ textAlign: 'right' }}>{kw.clicks}</td>
                  <td style={{ textAlign: 'right' }}>{kw.impressions.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{kw.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connections */}
      <div className="section">
        <h2 className="section-title">🔌 Connections</h2>
        <div className="grid grid-3">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="status-dot status-connected"></span>
            <div>
              <div style={{ fontWeight: 500 }}>Google Analytics 4</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Connected</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="status-dot status-connected"></span>
            <div>
              <div style={{ fontWeight: 500 }}>Search Console</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Connected</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="status-dot status-connected"></span>
            <div>
              <div style={{ fontWeight: 500 }}>WordPress</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{posts?.counts?.published || 0} posts</div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13 }}>
        Loudmouth v0.2.0 • Last updated: {new Date().toLocaleString()}
      </footer>

      <ChatWidget />

      {/* Content Editor Modal */}
      {showEditor && editingContent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 24
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 12,
            width: '100%',
            maxWidth: 900,
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              padding: 24,
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Review Content</h2>
              <button
                onClick={() => {
                  setShowEditor(false)
                  setEditingContent(null)
                  setEditingDraftId(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 24,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Title</label>
                <input
                  type="text"
                  value={editingContent.title}
                  onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text)',
                    fontSize: 16
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Excerpt</label>
                <textarea
                  value={editingContent.excerpt || ''}
                  onChange={(e) => setEditingContent({ ...editingContent, excerpt: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Content</label>
                <textarea
                  value={editingContent.content}
                  onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                  rows={15}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text)',
                    fontSize: 14,
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              </div>

              {editingContent.metaDescription && (
                <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg)', borderRadius: 8 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 13 }}>Meta Description</label>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>{editingContent.metaDescription}</p>
                </div>
              )}
            </div>

            <div style={{
              padding: 24,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditor(false)
                  setEditingContent(null)
                  setEditingDraftId(null)
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePublish}
                disabled={publishing}
                style={{ background: '#22c55e' }}
              >
                {publishing ? 'Publishing...' : '🚀 Publish to Site'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
