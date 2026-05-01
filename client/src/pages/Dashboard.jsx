import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import GmailStatusBar from '../components/GmailStatusBar'
import CampaignCard from '../components/CampaignCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/campaigns')
      .then(res => setCampaigns(res.data.campaigns))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0)
  const active = campaigns.filter(c => c.status === 'sending').length

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="section-title">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-400 mt-1">Here's your sending overview</p>
        </div>
        <Link to="/campaigns/new" className="btn-primary shrink-0">
          + New Campaign
        </Link>
      </div>

      {/* Gmail status */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <GmailStatusBar />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {[
          { label: 'Campaigns', value: campaigns.length },
          { label: 'Total Sent', value: totalSent.toLocaleString() },
          { label: 'Active Now', value: active }
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              {stat.value}
            </div>
            <div className="text-surface-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Campaigns list */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Campaigns
          </h2>
          {campaigns.length > 0 && (
            <span className="text-surface-400 text-sm">{campaigns.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-surface-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-surface-700 rounded w-2/3 mb-4" />
                <div className="h-1.5 bg-surface-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="card border-dashed text-center py-16">
            <div className="text-4xl mb-4">📬</div>
            <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              No campaigns yet
            </h3>
            <p className="text-surface-400 text-sm mb-6">Create your first campaign to start sending</p>
            <Link to="/campaigns/new" className="btn-primary">
              Create Campaign →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
