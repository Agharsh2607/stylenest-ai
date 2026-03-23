import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { key: 'overview', icon: 'dashboard', label: 'Overview', to: '/dashboard' },
  { key: 'designs', icon: 'auto_awesome_motion', label: 'My Designs', to: '/dashboard' },
  { key: 'workspace', icon: 'folder_open', label: 'Workspace', to: '/workspace' },
  { key: 'settings', icon: 'settings', label: 'Settings', to: '#' },
]

export default function Sidebar({ active = 'designs' }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-zinc-50/80 backdrop-blur-2xl flex flex-col p-4 border-r border-zinc-100">
      <div className="mb-10 px-4">
        <Link to="/" className="text-lg font-black text-zinc-900 font-headline">StyleNest AI</Link>
        <p className="text-xs text-zinc-500 font-headline">Pro Plan</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline text-sm ${
              active === item.key
                ? 'bg-white text-amber-600 shadow-sm translate-x-1 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-100 space-y-1">
        <Link
          to="/workspace"
          className="w-full mb-4 bg-gold-gradient text-white py-3 rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Project
        </Link>
        <a className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:text-zinc-900 transition-colors font-headline text-sm" href="#">
          <span className="material-symbols-outlined">help</span>
          <span>Help</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:text-zinc-900 transition-colors font-headline text-sm w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
