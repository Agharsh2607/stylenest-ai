import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <header className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl shadow-sm shadow-zinc-200/50">
      <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">StyleNest AI</Link>
        <div className="hidden md:flex items-center gap-8 font-headline text-sm font-bold tracking-tight">
          <Link
            className={`transition-colors ${location.pathname === '/' ? 'text-amber-600 font-bold border-b-2 border-amber-500 pb-1' : 'text-zinc-600 hover:text-zinc-900'}`}
            to="/"
          >
            Home
          </Link>
          <Link
            className={`transition-colors ${location.pathname === '/workspace' ? 'text-amber-600 font-bold border-b-2 border-amber-500 pb-1' : 'text-zinc-600 hover:text-zinc-900'}`}
            to={user ? '/workspace' : '/auth'}
          >
            Workspace
          </Link>
          <Link
            className={`transition-colors ${location.pathname === '/dashboard' ? 'text-amber-600 font-bold border-b-2 border-amber-500 pb-1' : 'text-zinc-600 hover:text-zinc-900'}`}
            to={user ? '/dashboard' : '/auth'}
          >
            Dashboard
          </Link>
          <a className="text-zinc-600 hover:text-zinc-900 transition-colors" href="/#pricing">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard" className="bg-primary-gradient text-white px-6 py-2.5 rounded-xl font-headline font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20">
              Dashboard
            </Link>
          ) : (
            <Link to="/auth" className="bg-primary-gradient text-white px-6 py-2.5 rounded-xl font-headline font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20">
              Start Designing
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
