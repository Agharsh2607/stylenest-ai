import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const AUTH_BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjEW3UWOQ-NYGiABMoSGHXnk3RqtJaWTqr_TZpaGzpCVPv2Ly0BXvANWHCtrCYvBzcSLZkZiLoJVhukcS5pTgx333oD88AegLr47aZb12irr1JfAddD40Pytm7On6fRV5czJn9mjXIGGqfnzVDlB-4m8YVr-MPQzyddeybeg3NVWVED4rd_dxhUswz4S4AA72nMfOdNjGUPM48QrQZkym3cbS3sJe9i4QTNgf5xXG4i00eZRDn1ddjk03ZxxSAuA8IWH24J9F-jkM'
const AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2WUTg76-w1NKWjRmrugecxJBLssqk8mrV9CSsUoG1Y359sKAumroF3dQrijOPENS8P1LcdAZCTjqlmZUIsJ6-8hEnlC2lSJP3mL7w4YfLSjgFHiJkZT771vC0Rdr9FlQawbI8hLAzy4Q1FaZVFZe-NrFd7yfYlNlhmOtwUZait1LbAiUFYXaCvErliwlgyLitA1Owt_rvnVLPcq9_akayxXHAeJSsKHYC58-PvCoL8zI-F_WwfLxUzTqVbq8muw_oLgQyZ0ryXwg'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        await signUp(email, password)
        setSuccessMsg('Check your email to confirm your account!')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center overflow-hidden pt-[72px]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img className="w-full h-full object-cover" alt="Luxury interior" src={AUTH_BG} />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
      </div>

      <motion.main
        className="relative z-10 w-full max-w-[1200px] grid md:grid-cols-2 bg-surface-container-lowest/60 backdrop-blur-2xl rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden m-4 md:m-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* ─── Left Panel (Branding) ─── */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary-container/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>nest_eco_leaf</span>
              <h1 className="text-2xl font-headline font-extrabold tracking-tighter text-on-surface">StyleNest AI</h1>
            </div>
            <div className="space-y-6">
              <h2 className="text-5xl font-headline font-bold leading-tight text-on-surface">
                Curate your <br /><span className="text-primary">dream interior</span>
              </h2>
              <p className="text-lg text-secondary leading-relaxed max-w-md">
                Experience the future of spatial design. Our AI curator transforms your vision into a tactile masterpiece.
              </p>
            </div>
          </div>
          <div className="relative z-10 p-8 rounded-xl bg-surface-container-lowest/40 border border-outline-variant/15">
            <p className="italic text-on-surface-variant font-medium">
              "StyleNest turned our empty loft into a sanctuary that feels both sophisticated and deeply personal."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container overflow-hidden">
                <img className="w-full h-full rounded-full object-cover" alt="Customer" src={AVATAR} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Elena Rossi</p>
                <p className="text-xs text-secondary">Creative Director</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Panel (Form) ─── */}
        <div className="flex flex-col p-8 md:p-16 justify-center">
          <div className="md:hidden flex items-center gap-2 mb-12">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>nest_eco_leaf</span>
            <span className="text-xl font-headline font-extrabold tracking-tighter">StyleNest AI</span>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-headline font-bold mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h3>
            <p className="text-secondary">
              {isLogin ? 'Please enter your details to continue your design journey.' : 'Start your interior design journey today.'}
            </p>
          </div>

          {/* Login / Sign up Toggle */}
          <div className="grid grid-cols-2 p-1.5 bg-surface-container-low rounded-full mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg('') }}
              className={`py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${isLogin ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-secondary hover:text-on-surface'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg('') }}
              className={`py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${!isLogin ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-secondary hover:text-on-surface'}`}
            >
              Sign up
            </button>
          </div>

          {/* Error / Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg text-sm">
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
              <input
                className="w-full px-5 py-4 rounded-xl bg-surface-container-low border-none ring-1 ring-outline-variant/15 focus:ring-primary focus:ring-2 transition-all outline-none placeholder:text-outline/50"
                placeholder="name@domain.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                {isLogin && <a className="text-xs font-medium text-primary hover:underline" href="#">Forgot password?</a>}
              </div>
              <input
                className="w-full px-5 py-4 rounded-xl bg-surface-container-low border-none ring-1 ring-outline-variant/15 focus:ring-primary focus:ring-2 transition-all outline-none placeholder:text-outline/50"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {isLogin && (
              <div className="flex items-center gap-2 pt-2 px-1">
                <input className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary" id="remember" type="checkbox" />
                <label className="text-sm text-on-surface-variant font-medium" htmlFor="remember">Remember me for 30 days</label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 primary-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign in to Workspace' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-transparent px-4 text-outline">or continue with</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            onClick={handleGoogle}
            className="w-full py-4 flex items-center justify-center gap-3 bg-surface-container-low border border-outline-variant/15 rounded-xl font-semibold text-on-surface hover:bg-surface-container-high transition-all duration-200"
          >
            <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <footer className="mt-12 text-center">
            <p className="text-xs text-secondary font-medium tracking-wide">
              By joining, you agree to our{' '}
              <a className="text-primary hover:underline" href="#">Terms of Service</a> and{' '}
              <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
          </footer>
        </div>
      </motion.main>
    </div>
  )
}
