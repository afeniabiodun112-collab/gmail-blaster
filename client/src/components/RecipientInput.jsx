import { useState, useCallback } from 'react'

function parseEmails(text) {
  const emailRegex = /[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/g
  const found = text.match(emailRegex) || []
  const valid = found.map(e => e.trim().toLowerCase())
  return [...new Set(valid)]
}

export default function RecipientInput({ value, onChange }) {
  const [focused, setFocused] = useState(false)
  const emails = parseEmails(value)

  const handleChange = useCallback(e => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <div>
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`Paste email addresses here — one per line, comma-separated, or space-separated\n\nexample@domain.com\nanother@company.com\nthird@example.org`}
          rows={8}
          className={`input-field resize-none font-mono text-sm transition-all duration-150 ${
            focused ? 'border-brand-500 ring-2 ring-brand-500/20' : ''
          }`}
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        />
        {emails.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-md"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              {emails.length}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-surface-400 text-xs">
          Supports: one per line, comma-separated, or space-separated
        </div>
        {emails.length > 0 ? (
          <div className="text-sm font-semibold text-brand-400" style={{ fontFamily: 'Syne, sans-serif' }}>
            ✓ {emails.length} recipient{emails.length !== 1 ? 's' : ''} detected
          </div>
        ) : value.length > 0 ? (
          <div className="text-sm text-amber-400" style={{ fontFamily: 'Syne, sans-serif' }}>
            No valid emails found
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { parseEmails }
