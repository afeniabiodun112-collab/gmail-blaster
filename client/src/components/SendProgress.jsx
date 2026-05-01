export default function SendProgress({ campaign }) {
  const { sentCount, totalCount, failedCount, status } = campaign
  const pct = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0
  const isSending = status === 'sending'

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isSending && (
            <div className="flex gap-0.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
          <span className="font-semibold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            {isSending ? 'Sending...' : status === 'completed' ? 'Completed' : 'Progress'}
          </span>
        </div>
        <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          {pct}%
        </span>
      </div>

      <div className="h-3 bg-surface-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            status === 'completed' ? 'bg-green-500' :
            status === 'paused' ? 'bg-amber-500' :
            'bg-brand-500 sending-pulse'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            {sentCount}
          </div>
          <div className="text-xs text-surface-400 mt-0.5">Sent</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-surface-300" style={{ fontFamily: 'Syne, sans-serif' }}>
            {totalCount - sentCount - failedCount}
          </div>
          <div className="text-xs text-surface-400 mt-0.5">Pending</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${failedCount > 0 ? 'text-red-400' : 'text-surface-500'}`}
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {failedCount}
          </div>
          <div className="text-xs text-surface-400 mt-0.5">Failed</div>
        </div>
      </div>
    </div>
  )
}
