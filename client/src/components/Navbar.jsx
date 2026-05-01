import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NavLink = ({ to, children }) => {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
  return (
    <Link to={to}
      className={`text-sm font-semibold transition-colors duration-150 ${
        active ? 'text-white' : 'text-surface-300 hover:text-white'
      }`}
      style={{ fontFamily: 'Syne, sans-serif' }}>
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface-900/80 backdrop-blur-md border-b border-surface-700/50">
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            G
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
            Gmail<span className="text-brand-400">Blaster</span>
          </span>
        </Link>

        {/* Nav links */}
        {user && (
          <div className="flex items-center gap-6">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/campaigns/new">New Campaign</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </div>
        )}

        {/* User area */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-surface-400 text-sm hidden sm:block">{user.name}</span>
            <button onClick={handleLogout}
              className="text-sm font-semibold text-surface-400 hover:text-red-400 transition-colors"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
