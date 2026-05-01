import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import SendProgress from '../components/SendProgress'

const STATUS_COLORS = {
  sent: 'text-green-400',
  failed: 'text-red-400'
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const pollRef = useRef(null)

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await api.get(`/campaigns/${id}`)
      setData(res.data)
      return res.data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load campaign')
      return null
    }
  }, [id])

  useEffect(() => {
    fetchCampaign().finally(() => setLoading(false))
  }, [fetchCampaign])

  // Poll every 5 seconds if sending
  useEffect(() => {
    const shouldPoll = data?.campaign?.status === 'sending' || data?.isActive
    if (shouldPoll) {
      pollRef.current = setInterval(fetchCampaign, 5000)
    } else {
      clearInterval(pollRef.current)
    }
    return () => clearInterval(pollRef.current)
  }, [data?.campaign?.status, data?.isActive, fetchCampaign])

  const handleSend = async () => {
    setError('')
    setActionLoading(true)
    try {
      await api.post(`/campaigns/${id}/send`)
      await fetchCampaign()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start sending')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePause = async () => {
    setActionLoading(true)
    try {
      await api.post(`/campaigns/${id}/pause`)
      await fetchCampaign()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to pause')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return setDeleteConfirm(true)
    try {
      await api.delete(`/campaigns/${id}`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete')
      setDeleteConfirm(false)
    }
  }

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-surface-700 rounded w-48" />
        <div className="h-32 bg-surface-700 rounded" />
        <div className="h-48 bg-surface-700 rounded" />
      </div>
    </div>
  )

  if (!data) return (
    <div className="page-container text-center py-20">
      <p className="text-surface-400">{error || 'Campaign not found'}</p>
      <Link to="/dashboard" className="btn-primary mt-4 inline-block">← Back</Link>
    </div>
  )

  const { campaign, logs } = data
  const isSending = campaign.status === 'sending' || data.isActive
  const canSend = ['draft', 'paused'].includes(campaign.status) && !data.isActive

  return (
    <div className="page-container animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6 text-sm">
        <Link to="/dashboard" className="text-surface-400 hover:text-white transition-colors">← Dashboard</Link>
        <span className="text-surface-600">/</span>
        <span className="text-white font-medium truncate">{campaign.name}</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="section-title">{campaign.name}</h1>
          <p className="text-surface-400 mt-1 text-sm">
            {campaign.totalCount} recipients · Created {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canSend && (
            <button onClick={handleSend} disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Starting...' : '▶ Start Sending'}
            </button>
          )}
          {isSending && (
            <button onClick={handlePause} disabled={actionLoading} className="btn-secondary">
              {actionLoading ? '...' : '⏸ Pause'}
            </button>
          )}
          <button
            onClick={handleDelete}
            className={deleteConfirm ? 'btn-danger' : 'btn-secondary'}
          >
            {deleteConfirm ? '⚠ Confirm Delete?' : '🗑 Delete'}
          </button>
          {deleteConfirm && (
            <button onClick={() => setDeleteConfirm(false)} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Progress */}
          <SendProgress campaign={campaign} />

          {/* Campaign info */}
          <div className="card space-y-3">
            <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
              Campaign Info
            </h3>
            <div>
              <div className="text-xs text-surface-400 mb-1">Subject</div>
              <div className="text-surface-200 text-sm">{campaign.subject}</div>
            </div>
            <div>
              <div className="text-xs text-surface-400 mb-1">Message</div>
              <div className="text-surface-200 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto bg-surface-700/50 rounded-lg p-3 text-xs font-mono">
                {campaign.body}
              </div>
            </div>
            {campaign.startedAt && (
              <div>
                <div className="text-xs text-surface-400 mb-1">Started</div>
                <div className="text-surface-200 text-sm">{new Date(campaign.startedAt).toLocaleString()}</div>
              </div>
            )}
            {campaign.completedAt && (
              <div>
                <div className="text-xs text-surface-400 mb-1">Completed</div>
                <div className="text-surface-200 text-sm">{new Date(campaign.completedAt).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right column - send log */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Send Log
              </h3>
              <span className="text-surface-400 text-xs">{logs.length} entries</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 text-surface-500">
                <div className="text-3xl mb-3">📭</div>
                <p>No emails sent yet. Hit Start Sending above.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log._id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-surface-700/50 hover:bg-surface-700 transition-colors group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-xs font-bold ${STATUS_COLORS[log.status]}`}
                        style={{ fontFamily: 'Syne, sans-serif' }}>
                        {log.status === 'sent' ? '✓' : '✗'}
                      </span>
                      <span className="text-surface-200 text-sm truncate font-mono">
                        {log.recipientEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      {log.error && (
                        <span className="text-red-400 text-xs truncate max-w-32 hidden group-hover:block">
                          {log.error}
                        </span>
                      )}
                      <span className={`text-xs font-semibold ${STATUS_COLORS[log.status]}`}
                        style={{ fontFamily: 'Syne, sans-serif' }}>
                        {log.status}
                      </span>
                      <span className="text-surface-500 text-xs">
                        {new Date(log.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipients preview */}
          <div className="card mt-4">
            <h3 className="font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
              All Recipients ({campaign.totalCount})
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {campaign.recipients?.slice(0, 50).map(email => (
                <span key={email}
                  className="bg-surface-700 text-surface-300 text-xs px-2 py-1 rounded font-mono">
                  {email}
                </span>
              ))}
              {campaign.totalCount > 50 && (
                <span className="bg-surface-700 text-surface-500 text-xs px-2 py-1 rounded">
                  +{campaign.totalCount - 50} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
