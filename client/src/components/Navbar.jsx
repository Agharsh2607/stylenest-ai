import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const { scrollY } = useScroll()
  const { user } = useAuth()

  // On home: transparent → dark on scroll
  // On other pages: always dark
  const bgColor = useTransform(
    scrollY,
    [0, 80],
    isHome
      ? ['rgba(30,20,10,0)', 'rgba(30,20,10,0.82)']
      : ['rgba(30,20,10,0.92)', 'rgba(30,20,10,0.92)']
  )

  return (
    <motion.header
      className="fixed top-0 z-[1000] w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-0 -z-10 backdrop-blur-md"
        style={{ backgroundColor: bgColor }}
      />

      <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="text-xl font-bold tracking-tighter text-white font-headline">
          StyleNest AI
        </Link>

        <div className="hidden md:flex items-center gap-8 font-headline text-sm font-bold tracking-tight">
          {[
            { label: 'Home', to: '/' },
            { label: 'Workspace', to: '/workspace' },
            { label: 'Pricing', to: '/pricing' },
          ].map(({ label, to }) => {
            const isActive = location.pathname === to
            return (
              <Link
                key={label}
                to={to}
                className={`relative group transition-colors duration-200 ${
                  isActive ? 'text-amber-400' : 'text-white hover:text-amber-400'
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-amber-400 rounded-full transition-all duration-300 ease-out ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => navigate(user ? '/workspace' : '/auth')}
          className="bg-primary-gradient text-white px-6 py-2.5 rounded-xl font-headline font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
        >
          Start Designing
        </button>
      </nav>
    </motion.header>
  )
}
