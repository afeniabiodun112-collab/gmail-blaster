import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import RecipientInput, { parseEmails } from '../components/RecipientInput'

export default function NewCampaign() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', subject: '', body: '' })
  const [recipientText, setRecipientText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const recipients = parseEmails(recipientText)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.subject || !form.body) {
      return setError('Please fill in all fields')
    }
    if (recipients.length === 0) {
      return setError('Please add at least one valid recipient email')
    }

    setLoading(true)
    try {
      const res = await api.post('/campaigns', {
        ...form,
        recipients
      })
      navigate(`/campaigns/${res.data.campaign._id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <Link to="/dashboard" className="text-surface-400 hover:text-white transition-colors text-sm">
          ← Dashboard
        </Link>
        <span className="text-surface-600">/</span>
        <h1 className="section-title">New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Campaign name */}
        <div className="card">
          <h2 className="text-white font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Campaign Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Campaign Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Q2 Outreach — SaaS Founders"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
              />
              <p className="text-surface-500 text-xs mt-1">For your reference only — not shown to recipients</p>
            </div>
            <div>
              <label className="label">Subject Line</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Quick question about [topic]"
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        {/* Email body */}
        <div className="card">
          <h2 className="text-white font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Email Body
          </h2>
          <textarea
            className="input-field resize-none"
            placeholder={"Hi,\n\nI wanted to reach out about...\n\nBest,\nYour Name"}
            rows={10}
            value={form.body}
            onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
            required
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-surface-500 text-xs">Plain text — keep it personal and concise</p>
            <span className="text-surface-500 text-xs font-mono">{form.body.length} chars</span>
          </div>
        </div>

        {/* Recipients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Recipients
            </h2>
            {recipients.length > 0 && (
              <span className="text-brand-400 text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                {recipients.length} valid addresses
              </span>
            )}
          </div>
          <RecipientInput value={recipientText} onChange={setRecipientText} />
        </div>

        {/* Preview */}
        {recipients.length > 0 && form.subject && form.body && (
          <div className="card border-brand-500/20 bg-brand-500/5">
            <h3 className="text-brand-300 font-semibold text-sm mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
              Preview
            </h3>
            <div className="space-y-1 text-sm text-surface-400">
              <div><span className="text-surface-300">To:</span> {recipients[0]}{recipients.length > 1 && ` +${recipients.length - 1} more`}</div>
              <div><span className="text-surface-300">Subject:</span> {form.subject}</div>
            </div>
            <div className="mt-3 pt-3 border-t border-surface-700 text-sm text-surface-300 whitespace-pre-wrap line-clamp-3">
              {form.body}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/dashboard" className="btn-secondary flex-1 text-center">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={loading || recipients.length === 0}
          >
            {loading ? 'Saving...' : `Save Campaign (${recipients.length} recipients) →`}
          </button>
        </div>
      </form>
    </div>
  )
}
