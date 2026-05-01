import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  draft:     { bg: 'bg-surface-500/10',  text: 'text-surface-300',  border: 'border-surface-500/20', dot: 'bg-surface-400' },
  sending:   { bg: 'bg-brand-500/10',    text: 'text-brand-300',    border: 'border-brand-500/20',   dot: 'bg-brand-400' },
  completed: { bg: 'bg-green-500/10',    text: 'text-green-400',    border: 'border-green-500/20',   dot: 'bg-green-400' },
  paused:    { bg: 'bg-amber-500/10',    text: 'text-amber-400',    border: 'border-amber-500/20',   dot: 'bg-amber-400' },
  failed:    { bg: 'bg-red-500/10',      text: 'text-red-400',      border: 'border-red-500/20',     dot: 'bg-red-400' }
}

export default function CampaignCard({ campaign }) {
  const s = STATUS_STYLES[campaign.status] || STATUS_STYLES.draft
  const pct = campaign.totalCount > 0
    ? Math.round((campaign.sentCount / campaign.totalCount) * 100)
    : 0

  return (
    <Link to={`/campaigns/${campaign._id}`} className="card-hover block animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
            {campaign.name}
          </h3>
          <p className="text-surface-400 text-sm truncate mt-0.5">{campaign.subject}</p>
        </div>
        <span className={`status-badge ${s.bg} ${s.text} border ${s.border} shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${campaign.status === 'sending' ? 'animate-pulse-dot' : ''}`} />
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              campaign.status === 'completed' ? 'bg-green-500' : 'bg-brand-500'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-surface-400">
        <span>
          <span className="text-white font-semibold">{campaign.sentCount}</span>
          /{campaign.totalCount} sent
          {campaign.failedCount > 0 && (
            <span className="text-red-400 ml-2">· {campaign.failedCount} failed</span>
          )}
        </span>
        <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  )
}
