import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function GmailStatusBar() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/gmail/status')
      .then(res => setStatus(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="card animate-pulse">
      <div className="h-4 bg-surface-700 rounded w-48" />
    </div>
  )

  if (!status?.connected) return (
    <div className="card border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse-dot" />
        <span className="text-amber-300 font-medium text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
          Gmail not connected — connect your account to start sending
        </span>
      </div>
      <Link to="/settings" className="btn-primary text-sm py-2 px-4">
        Connect Gmail →
      </Link>
    </div>
  )

  const pct = Math.round((status.sentToday / status.dailyLimit) * 100)

  return (
    <div className="card border-brand-500/20 bg-brand-500/5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse-dot" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                {status.gmailEmail}
              </span>
              <span className="status-badge bg-green-500/10 text-green-400 border border-green-500/20">
                Connected
              </span>
            </div>
            <div className="text-surface-400 text-xs mt-0.5">
              Warmup Day {status.warmupDay} · {status.remaining} emails remaining today
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
              {status.sentToday}
              <span className="text-surface-400 font-normal text-sm">/{status.dailyLimit}</span>
            </div>
            <div className="text-surface-400 text-xs">sent today</div>
          </div>
          <div className="w-24">
            <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="text-surface-400 text-xs text-right mt-1">{pct}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
