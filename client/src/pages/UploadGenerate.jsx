import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { analyzeRoomWithGemini, generateImage, checkDemoOverride } from '../utils/generateDesign'
import { saveDesign, fetchUserDesigns, deleteDesign, isSupabaseConfigured } from '../services/supabase'

// ─── Local storage helpers (demo/fallback mode) ─── //
const LS_KEY = 'stylenest_designs'
function lsGetDesigns(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    return all.filter((d) => d.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch { return [] }
}
function lsSaveDesign(design) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    all.unshift(design)
    localStorage.setItem(LS_KEY, JSON.stringify(all))
  } catch {}
}
function lsDeleteDesign(id) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    localStorage.setItem(LS_KEY, JSON.stringify(all.filter((d) => d.id !== id)))
  } catch {}
}

const STYLE_IMAGES = {
  modern: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGXZQmjw5pPSfqRRAFG-A73by-owRbOIuSOM_wmEFeYUY2l5BMlaupf4Zwtj2kV3TwUMWneF-TViefN8HGhqoXapHt5r-QvNZMNQA98le8Xk5BTZJLcRaErt7q1-RUH4XLAp3ru2uSV3UT0NDXzPIy1e7U5WeSrbdd6aLhgVRrnzZt8bz2Es-2BrbhKh2AkyyyG5WqiDenh3Awnd-x_uv4PLxLLSX-ThpnpyNgli_efyZoUQn1UekLtP3hfSA0n-1ZL3Ab2WPhibg',
  industrial: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBua53ZYUNLP9UAm4IHYcZs88fBs0OHzGVK02Hg-o2cq-oMH65gH9T9LjoZRwWNPWTlKHhDAydLktu4vZIUTCy7PXPsLostkPPufY17vq5N3L0TuaUbTNkBqC69SGvUWIiIqZTcI12jkOtx6SZ5jVNAsrWKnxjetknMXl0q4oZZWpiAzDASyBpmQamJhTp7AKBdDIttCwlooU34-WFd89piMkxLheLq7BHejnhqlcvrEBTuRvySswb8YIkDkiNfb1a2-jXdLlhwxyU',
  minimal: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmntqF1t6j6dJDY-WSCOdGHzVb3uwsdVEm6XplSTruzx34XrSXFpf81Q-L-XQtH0GNJvIKBaBzc-dQ2pa6wr9fg1FRVh9gbVdnvcrXwa9gc2hZMiexgbaWFOtlvNTCNbAsfj-Tm8N9WJ5LxwKOhcFvJ5pYHJyeo6bi5-Hj7mje5uzQi3FhWQqMJQhYBktMM14ow1QRPLHwG5qsM3DoCcCorsAjDspWZovGPU0VF6CbZTozTvZHpg3WcJDA2mXlznYKI1_i8yh7YL4',
  japandi: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0n86xsGVgJmohuqSDe6rqAOh12hEG2kycL6HlFHd1So0AaeJTpEOrkRapEpozvM3rEgZ2sL6UiwAgdqoHkzf0PuoTtcQ81HlCE1TGevZtxmH2n1AyirpJFjCvOByeYk5i2qhtfevW0ZUH-Hm5i-pebi2cWvXwcyy0VrmutoBNTVQBvee3hjrBzrt7fiW4QArCgdhpIKON1j8mo8259NUBNDzL-q3ypQ4HVIAxhARRh9ukqgPKaTPUN0bTjcJw9rh2qR0qEpUCpbI',
}
const PREVIEW_BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuATJM7uZ0AIHfdbVVs8Zt3CPYHBu5l_f7Dz7tYH6IpLLoGWYSoZ2VWWpWo-1aXYGgdJ4fdxDGjJnQMJZCW53yOTd3oaPO0sSmvuKUcdW3P6-Yvgrl8ra0KXCZKNiW3mcylCstpqidnbK-FBC1AwI5_nyMeXDPB7JFC5nLl5084oDh8p0bYuYI8UUmOWZ-hUAElUnMhdJfN22fbpszaHS4qVEiucCGUk3atW44IXj-6od1K8l6wHRgeh9MsTE4LoFK1AD4___A5IrPQ'

const STYLES = [
  { key: 'modern', label: 'Modern' },
  { key: 'industrial', label: 'Industrial' },
  { key: 'minimal', label: 'Minimal' },
  { key: 'japandi', label: 'Japandi' },
]

const LOADING_MESSAGES = [
  '🔍 Gemini is reading your room...',
  '🎨 Writing your design prompt...',
  '⚡ NVIDIA Flux is generating...',
  '✨ Almost ready...',
]

function Toast({ message, onDone }) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[9999] bg-zinc-900 text-white px-5 py-3 rounded-xl text-sm font-headline font-medium shadow-2xl"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }} onAnimationComplete={() => setTimeout(onDone, 2700)}
    >
      {message}
    </motion.div>
  )
}

function HelpModal({ onClose }) {
  return (
    <motion.div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
        <h2 className="text-2xl font-headline font-extrabold mb-6">How to use StyleNest AI</h2>
        <ol className="space-y-4 mb-8">
          {['Upload a photo of your empty room', 'Select a curated style', 'Click Generate Design', 'View and download your result'].map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-on-surface-variant font-medium">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <button onClick={onClose} className="w-full py-3 bg-gold-gradient text-white rounded-xl font-headline font-bold">Got it!</button>
      </motion.div>
    </motion.div>
  )
}

function SettingsPanel({ user }) {
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '')
  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Settings</h2>
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-headline font-bold text-on-surface mb-2">Display Name</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-sm font-headline font-bold text-on-surface mb-2">Email</label>
          <input type="email" value={user?.email || ''} readOnly
            className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface-container text-on-surface-variant cursor-not-allowed" />
        </div>
        <button className="w-full py-3 bg-gold-gradient text-white rounded-xl font-headline font-bold shadow-lg shadow-primary/20">Save Changes</button>
      </div>
    </div>
  )
}

function MyDesignsPanel({ user, onViewChange }) {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { setLoading(false); return }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        let data = []
        if (isSupabaseConfigured()) {
          data = await fetchUserDesigns(user.id)
        }
        // Merge with localStorage (covers designs saved before Supabase was configured)
        const local = lsGetDesigns(user.id)
        const supaIds = new Set(data.map(d => d.id))
        const merged = [...data, ...local.filter(d => !supaIds.has(d.id))]
        if (!cancelled) setDesigns(merged)
      } catch (e) {
        console.warn('Supabase load failed, using localStorage:', e.message)
        if (!cancelled) setDesigns(lsGetDesigns(user.id))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      if (isSupabaseConfigured()) {
        await deleteDesign(id)
      } else {
        lsDeleteDesign(id)
      }
      setDesigns((prev) => prev.filter((d) => d.id !== id))
    } catch (e) {
      console.error('Delete failed:', e)
    } finally {
      setDeleting(null)
    }
  }

  const handleOpen = (design) => {
    navigate('/result', {
      state: {
        originalImage: design.original_image,
        generatedImage: design.generated_image,
        designTitle: design.style.charAt(0).toUpperCase() + design.style.slice(1) + ' Sanctuary',
        style: design.style,
        styleSummary: [
          { icon: 'palette', title: design.style + ' Style', desc: 'AI-generated interior design.' },
          { icon: 'chair', title: 'Curated Furniture', desc: 'Furniture matched to your style.' },
          { icon: 'light_mode', title: 'Optimized Lighting', desc: 'Lighting tailored for the space.' },
        ],
        processingTime: design.processing_time || '—',
      }
    })
  }

  return (
    <div className="max-w-6xl">
      <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-8">My Designs</h2>
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant/30">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">photo_library</span>
          <p className="text-on-surface-variant font-headline font-medium mb-4">No designs yet. Create your first one!</p>
          <button onClick={() => onViewChange('workspace')}
            className="px-6 py-2 bg-gold-gradient text-white rounded-xl font-headline font-bold text-sm shadow-lg">
            Start Designing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 hover:shadow-md transition-all">
              <div className="relative aspect-video cursor-pointer" onClick={() => handleOpen(design)}>
                <img
                  src={design.generated_image}
                  alt={design.style}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = design.original_image }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">View Design</span>
                </div>
                <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase backdrop-blur-sm capitalize">
                  {design.style}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface capitalize">{design.style} Sanctuary</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {new Date(design.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(design.id)}
                  disabled={deleting === design.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-on-surface-variant transition-all disabled:opacity-40"
                >
                  {deleting === design.id
                    ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-base">delete</span>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function UploadGenerate() {
  const { user } = useAuth()
  const location = useLocation()
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const [activeView, setActiveView] = useState(location.state?.view || 'workspace')
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const showToast = (msg) => setToast(msg)

  const handleViewChange = (view) => {
    if (view === 'help') { setShowHelp(true); return }
    setActiveView(view)
  }

  const resetProject = () => {
    setUploadedImage(null); setUploadedFile(null); setPreviewUrl(null)
    setError(''); setSelectedStyle('modern'); setActiveView('workspace')
    showToast('New project started!')
  }

  const processFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please upload a valid image file.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be under 10MB.'); return }
    setUploadedFile(file)
    setUploadedImage(URL.createObjectURL(file))
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  const handleFileChange = (e) => processFile(e.target.files[0])
  const handleDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]) }, [])
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const handleGenerate = async () => {
    if (!uploadedFile) { showToast('Please upload a room photo first!'); return }
    if (!selectedStyle) { showToast('Please select a style first!'); return }

    setIsGenerating(true)
    setError('')
    const startTime = Date.now()
    let msgIdx = 0
    setLoadingMsg(LOADING_MESSAGES[0])
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[msgIdx])
    }, 3000)

    const finish = (imageBase64, generatedImageUrl, processingTime) => {
      const designRecord = {
        id: `design-${Date.now()}`,
        user_id: user?.id || 'demo-user',
        original_image: `data:${uploadedFile.type || 'image/jpeg'};base64,${imageBase64}`,
        generated_image: generatedImageUrl,
        style: selectedStyle,
        processing_time: processingTime,
        created_at: new Date().toISOString(),
      }
      // Save to Supabase or localStorage
      if (isSupabaseConfigured() && user?.id && !user.id.startsWith('demo')) {
        saveDesign({ userId: user.id, originalImage: designRecord.original_image, generatedImage: generatedImageUrl, style: selectedStyle })
          .catch(e => { console.warn('Supabase save failed:', e.message); lsSaveDesign(designRecord) })
      } else {
        lsSaveDesign(designRecord)
      }
      navigate('/result', {
        state: {
          originalImage: designRecord.original_image,
          generatedImage: generatedImageUrl,
          designTitle: selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1) + ' Sanctuary',
          styleSummary: [
            { icon: 'palette', title: selectedStyle + ' Style', desc: 'AI-designed ' + selectedStyle + ' interior.' },
            { icon: 'chair',   title: 'Curated Furniture',      desc: 'Furniture matched to your style.' },
            { icon: 'light_mode', title: 'Optimized Lighting',  desc: 'Lighting tailored for the space.' },
          ],
          processingTime,
          style: selectedStyle,
        }
      })
    }

    try {
      // 1. Check demo override — instant, no API needed
      const demoResult = await checkDemoOverride(uploadedFile, selectedStyle)
      if (demoResult) {
        clearInterval(msgInterval)
        setIsGenerating(false)
        const imageBase64 = await new Promise((res) => {
          const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(uploadedFile)
        })
        finish(imageBase64, demoResult, '0.3s')
        return
      }

      // 2. Normal AI pipeline
      const { prompt: imagePrompt, imageBase64 } = await analyzeRoomWithGemini(uploadedFile, selectedStyle)
      const generatedImageUrl = await generateImage(imagePrompt, imageBase64, uploadedFile, selectedStyle)
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's'
      finish(imageBase64, generatedImageUrl, processingTime)
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message)
      showToast('Failed: ' + err.message)
    } finally {
      clearInterval(msgInterval)
      setIsGenerating(false)
    }
  }

  const uploadZoneCls = 'bg-surface-container-lowest rounded-xl shadow-sm border-2 border-dashed relative overflow-hidden aspect-video flex flex-col items-center justify-center transition-colors group cursor-pointer ' +
    (isDragging ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/40')

  return (
    <div className="flex min-h-screen bg-surface pt-20">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} onNewProject={resetProject} />
      <main className="ml-64 min-h-screen p-12 flex-1">
        {activeView === 'designs' && <MyDesignsPanel user={user} onViewChange={handleViewChange} />}
        {activeView === 'settings' && <SettingsPanel user={user} />}
        {activeView === 'workspace' && (
          <>
            <header className="max-w-6xl mx-auto mb-12">
              <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
                StyleNest AI <span className="text-primary">Atelier</span>
              </h2>
              <p className="text-secondary font-medium">Transform your architectural vision into curated interior masterpieces.</p>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left column */}
              <div className="lg:col-span-7 space-y-8">
                <section
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                  className={uploadZoneCls}
                >
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                  {uploadedImage ? (
                    <div className="relative w-full h-full">
                      <img src={uploadedImage} alt="Uploaded room" className="w-full h-full object-cover rounded-xl" />
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setUploadedFile(null); setPreviewUrl(null) }}
                        className="absolute top-3 right-3 bg-zinc-900/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-zinc-900 transition-colors">
                        x
                      </button>
                      <div className="absolute bottom-3 left-3 bg-zinc-900/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                        {uploadedFile?.name}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 z-0">
                        <img alt="Preview" className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" src={PREVIEW_BG} />
                      </div>
                      <div className="relative z-10 text-center px-8">
                        <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                        </div>
                        <h3 className="font-headline font-bold text-xl text-on-surface mb-2">Drop your space here</h3>
                        <p className="text-on-surface-variant text-sm max-w-xs mx-auto">Upload a photo of your room to begin the AI transformation.</p>
                        <div className="mt-6">
                          <span className="px-6 py-2 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant uppercase tracking-widest">Select File</span>
                        </div>
                      </div>
                    </>
                  )}
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-lg text-on-surface">Curated Styles</h3>
                    <span className="text-xs text-on-surface-variant font-headline">
                      Selected: <span className="text-primary font-bold capitalize">{selectedStyle}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {STYLES.map((style) => (
                      <div key={style.key} className="cursor-pointer" onClick={() => setSelectedStyle(style.key)}>
                        <div className="aspect-square rounded-lg overflow-hidden mb-2 transition-all"
                          style={selectedStyle === style.key
                            ? { border: '2px solid #D4A017', boxShadow: '0 0 0 3px rgba(212,160,23,0.2)' }
                            : { border: '2px solid transparent' }}>
                          <img alt={style.label} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" src={STYLE_IMAGES[style.key]} />
                        </div>
                        <p className={selectedStyle === style.key
                          ? 'font-headline text-sm text-center font-bold text-primary'
                          : 'font-headline text-sm text-center font-medium text-on-surface-variant'}>
                          {style.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right column */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="flex-1 bg-surface-container-low rounded-xl relative overflow-hidden min-h-[400px]">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-inverse-surface/90 text-inverse-on-surface px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">Live Preview</span>
                  </div>
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 glass-panel z-20 flex flex-col items-center justify-center p-12 text-center">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                          </div>
                        </div>
                        <h4 className="font-headline font-extrabold text-xl mb-2">Curating Your Vision</h4>
                        <p className="text-on-surface-variant text-sm">{loadingMsg}</p>
                        <div className="w-full max-w-[200px] h-1 bg-surface-container mt-6 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gold-gradient" initial={{ width: '5%' }} animate={{ width: '90%' }} transition={{ duration: 60, ease: 'linear' }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <img alt="Preview" className={isGenerating ? 'w-full h-full object-cover blur-sm' : 'w-full h-full object-cover'}
                    src={previewUrl || PREVIEW_BG} />
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium break-words">
                      {error}
                    </div>
                  )}
                  <div className="flex items-center gap-4 p-4 bg-secondary-container/30 rounded-lg">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Powered by <span className="font-bold">Gemini + Stable Diffusion XL</span> pipeline.
                    </p>
                  </div>
                  <button onClick={handleGenerate} disabled={isGenerating}
                    className="w-full bg-gold-gradient hover:opacity-90 active:scale-[0.98] transition-all text-white py-5 rounded-xl font-headline font-black text-lg tracking-tight shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-60">
                    <span className="material-symbols-outlined">{isGenerating ? 'hourglass_top' : 'magic_button'}</span>
                    {isGenerating ? 'Generating...' : 'Generate Design'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <AnimatePresence>{showHelp && <HelpModal onClose={() => setShowHelp(false)} />}</AnimatePresence>
      <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast(null)} />}</AnimatePresence>
    </div>
  )
}
