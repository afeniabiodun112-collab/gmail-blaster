import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-900 grid-bg flex flex-col">
      <div className="noise-overlay" />

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold">
            G
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>
            Gmail<span className="text-brand-400">Blaster</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2">Login</Link>
          <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-dot" />
            Send from your real Gmail — zero deliverability issues
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tight mb-6 max-w-4xl"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Email outreach
            <br />
            <span className="text-brand-400">done right.</span>
          </h1>

          <p className="text-surface-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste a list of emails, write your message, hit send.
            Emails go out through your real Gmail account with warmup-based daily limits to protect your reputation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Start for free →
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              Already have an account
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-24 animate-slide-up">
          {[
            { icon: '⚡', title: 'Real Gmail Sending', desc: 'Emails sent via Gmail API — not SMTP. Lands in inbox, not spam.' },
            { icon: '🔥', title: 'Warmup System', desc: 'Automatic daily limits: 20 → 50 → 100 → 200/day as your account warms up.' },
            { icon: '📊', title: 'Live Progress', desc: 'Watch emails go out in real time. See sent, failed, and pending counts.' }
          ].map(f => (
            <div key={f.title} className="card text-left">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
              <p className="text-surface-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-8 text-surface-500 text-sm">
        Built for outreach that actually works.
      </footer>
    </div>
  )
}
