import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { key: 'designs', icon: 'auto_awesome_motion', label: 'My Designs' },
  { key: 'workspace', icon: 'folder_open', label: 'Workspace' },
  { key: 'settings', icon: 'settings', label: 'Settings' },
]

export default function Sidebar({ activeView, onViewChange, onNewProject }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-zinc-50/80 backdrop-blur-2xl flex flex-col p-4 border-r border-zinc-100">
      <div className="mb-10 px-4 pt-20">
        <p className="text-xs text-zinc-500 font-headline">Pro Plan</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onViewChange(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline text-sm text-left cursor-pointer ${
              activeView === item.key
                ? 'bg-white text-amber-600 shadow-sm font-bold'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-100 space-y-1">
        <button
          type="button"
          onClick={onNewProject}
          className="w-full mb-4 bg-gold-gradient text-white py-3 rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Project
        </button>
        <button
          type="button"
          onClick={() => onViewChange('help')}
          className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:text-zinc-900 transition-colors font-headline text-sm w-full text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span>Help</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:text-zinc-900 transition-colors font-headline text-sm w-full text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
