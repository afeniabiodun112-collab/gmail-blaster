import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [gmailStatus, setGmailStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Handle OAuth callback params
    const connected = searchParams.get('connected')
    const oauthError = searchParams.get('error')

    if (connected === 'true') {
      setSuccess('Gmail connected successfully!')
      refreshUser()
      setSearchParams({})
    }
    if (oauthError) {
      setError(`Gmail connection failed: ${decodeURIComponent(oauthError)}`)
      setSearchParams({})
    }
  }, [searchParams, refreshUser, setSearchParams])

  useEffect(() => {
    api.get('/gmail/status')
      .then(res => setGmailStatus(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const handleConnect = async () => {
    setConnecting(true)
    setError('')
    try {
      const res = await api.get('/gmail/connect')
      window.location.href = res.data.authUrl
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate Gmail connection')
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Gmail? You won\'t be able to send emails.')) return
    setDisconnecting(true)
    try {
      await api.delete('/gmail/disconnect')
      await refreshUser()
      setGmailStatus({ connected: false })
      setSuccess('Gmail disconnected.')
    } catch (err) {
      setError('Failed to disconnect Gmail')
    } finally {
      setDisconnecting(false)
    }
  }

  const warmupSchedule = [
    { days: 'Days 1–3', limit: 20, active: gmailStatus?.warmupDay <= 3 },
    { days: 'Days 4–7', limit: 50, active: gmailStatus?.warmupDay > 3 && gmailStatus?.warmupDay <= 7 },
    { days: 'Days 8–14', limit: 100, active: gmailStatus?.warmupDay > 7 && gmailStatus?.warmupDay <= 14 },
    { days: 'Day 15+', limit: 200, active: gmailStatus?.warmupDay > 14 }
  ]

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <Link to="/dashboard" className="text-surface-400 hover:text-white transition-colors text-sm">
          ← Dashboard
        </Link>
        <span className="text-surface-600">/</span>
        <h1 className="section-title">Settings</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">
          ✓ {success}
        </div>
      )}

      {/* Gmail Connection */}
      <div className="card mb-6 animate-slide-up">
        <h2 className="text-white font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Gmail Account
        </h2>
        <p className="text-surface-400 text-sm mb-6">
          Connect your Gmail to send emails through your real account
        </p>

        {loading ? (
          <div className="animate-pulse h-16 bg-surface-700 rounded-lg" />
        ) : gmailStatus?.connected ? (
          <div>
            <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <span className="text-green-400 text-lg">✓</span>
                </div>
                <div>
                  <div className="text-white font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {gmailStatus.gmailEmail}
                  </div>
                  <div className="text-surface-400 text-xs">
                    Connected · Warmup Day {gmailStatus.warmupDay} · {gmailStatus.dailyLimit}/day limit
                  </div>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="btn-danger text-sm py-2"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>

            {/* Today's usage */}
            <div className="bg-surface-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-surface-300 text-sm">Today's usage</span>
                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {gmailStatus.sentToday} / {gmailStatus.dailyLimit}
                </span>
              </div>
              <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((gmailStatus.sentToday / gmailStatus.dailyLimit) * 100, 100)}%` }}
                />
              </div>
              <p className="text-surface-500 text-xs mt-2">
                {gmailStatus.remaining} emails remaining today · Resets at midnight
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-6 bg-surface-700/50 border border-dashed border-surface-600 rounded-xl text-center mb-4">
              <div className="text-4xl mb-3">📨</div>
              <p className="text-surface-300 text-sm mb-4">
                Connect your Gmail account to start sending campaigns.<br />
                We'll only request permission to <strong className="text-white">send emails</strong> on your behalf.
              </p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="btn-primary"
              >
                {connecting ? 'Redirecting to Google...' : '🔗 Connect Gmail Account'}
              </button>
            </div>
            <div className="flex items-start gap-2 text-xs text-surface-500">
              <span>🔒</span>
              <span>We store OAuth tokens securely. You can disconnect at any time. We only request gmail.send scope.</span>
            </div>
          </div>
        )}
      </div>

      {/* Warmup schedule */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-white font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Warmup Schedule
        </h2>
        <p className="text-surface-400 text-sm mb-4">
          Daily limits automatically increase to protect your sender reputation
        </p>
        <div className="space-y-2">
          {warmupSchedule.map(w => (
            <div
              key={w.days}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                w.active
                  ? 'bg-brand-500/10 border border-brand-500/20'
                  : 'bg-surface-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {w.active && <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-dot" />}
                <span className={`text-sm font-semibold ${w.active ? 'text-white' : 'text-surface-400'}`}
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                  {w.days}
                </span>
                {w.active && (
                  <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <span className={`text-sm font-bold ${w.active ? 'text-brand-400' : 'text-surface-500'}`}
                style={{ fontFamily: 'Syne, sans-serif' }}>
                {w.limit}/day
              </span>
            </div>
          ))}
        </div>
        <p className="text-surface-500 text-xs mt-3">
          Daily count resets at midnight. Warmup day increments automatically each day.
        </p>
      </div>

      {/* Account info */}
      <div className="card mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-white font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          Account
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-surface-400">Name</span>
            <span className="text-white">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-400">Email</span>
            <span className="text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-400">Member since</span>
            <span className="text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
