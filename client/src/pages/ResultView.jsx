import { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'

// Fallback images from the provided HTML
const FALLBACK_BEFORE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiET0wZ23lpnCcxoagwJYUQoV2qjOmjBRJm62XynjS1q5NRlXA9VpEfYBoHaQsVgPw9lzvzUwWOguH9i3xyiFvvLSs1AbuSvKWAGCAVyiZDLfLciCC0kQ6z3_B0hcBzQDvpFde7pNkQ2HTfZuYKppZOXIHqLeTvNiC7LhD5F_Xau8kDjtt9GBVOrMhwBy1h_hRVvfLKS5MTbAM4IW9RdqBcU2s5CrOI7r8f-W4xv6cNdLKfaWRnt5zc5cpedczu7aIGGjRAvyH0kc'
const FALLBACK_AFTER = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTNExI2_zm3EMMdLnCH7hgjOud42MpmTMMwfSVb1qIAjSkLjVUqpaXRwVJdEOamDurBb3a0RqO_AvqK9XzRTz7iJg4vrZlMWiDgN11EFw954ZaV4BSlGork0y-m03ol3cNjyn59_bHCy-h_xKHp3IUZgjRG3v-dTh1TTduxwer2LWzKPWx6GFa0BAX3FSj1hmI6MDIXHzPwpziwgY176NI-LIodMKJsC_c1x1A6CxqfY15PMNnWH9Kav2b8OzNZK-zDok13nMWnAo'

const STYLE_VARIATIONS = [
  { name: 'Nordic Minimalist', description: 'Clean lines, lighter wood, and cool tones.', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=100' },
  { name: 'Industrial Loft', description: 'Exposed brick, metal accents, and raw textures.', image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=100' },
  { name: 'Japandi Fusion', description: 'Zen aesthetics mixed with Scandinavian utility.', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=100' },
  { name: 'Art Deco Revival', description: 'Velvet fabrics, gold trims, and bold geometry.', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=100' },
]

export default function ResultView() {
  const location = useLocation()
  const navigate = useNavigate()

  console.log('=== ResultView state:', location.state)

  const state = location.state || {}
  const originalImage = state.originalImage || FALLBACK_BEFORE
  const generatedImage = state.generatedImage || FALLBACK_AFTER
  const style = state.style || 'Mid-Century Modern'
  const designTitle = state.designTitle || `${style} Sanctuary`
  const processingTime = state.processingTime || '—'
  const DEFAULT_SUMMARY = [
    { icon: 'palette', title: 'Earth Tones & Teak', desc: 'Incorporated a warm palette of walnut, terracotta, and forest green accents.' },
    { icon: 'chair', title: 'Curated Furniture', desc: 'Added iconic Eames-inspired seating and minimalist low-profile sideboards.' },
    { icon: 'light_mode', title: 'Global Illumination', desc: 'Optimized natural light bounce for soft shadows.' },
  ]
  const styleSummary = state.styleSummary || DEFAULT_SUMMARY

  // Guard: if navigated directly without state, go back to workspace
  if (!location.state) {
    console.warn('No state found on ResultView, redirecting to /workspace')
    navigate('/workspace', { replace: true })
    return null
  }

  // Slider state
  const [sliderPos, setSliderPos] = useState(50)
  const sliderRef = useRef(null)
  const isDragging = useRef(false)

  // Regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentGeneratedImage, setCurrentGeneratedImage] = useState(generatedImage)
  const [currentTitle, setCurrentTitle] = useState(designTitle)
  const [regenLoadingMsg, setRegenLoadingMsg] = useState('')

  const handleVariationClick = async (variationStyle) => {
    if (isRegenerating) return
    const originalImg = location.state?.originalImage
    if (!originalImg) { alert('Original image not found. Please go back to workspace.'); return }

    setIsRegenerating(true)
    setRegenLoadingMsg('Analyzing room for ' + variationStyle + ' style...')
    try {
      // originalImage is a base64 data URL — extract the raw base64
      const base64 = originalImg.split(',')[1]

      setRegenLoadingMsg('Gemini analyzing for ' + variationStyle + '...')
      const analyzeRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/analyze-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg', style: variationStyle }),
      })
      const analyzeData = await analyzeRes.json()

      setRegenLoadingMsg('Generating ' + variationStyle + ' design...')
      const generateRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: analyzeData.prompt }),
      })
      const generateData = await generateRes.json()

      setCurrentGeneratedImage(generateData.imageUrl)
      setCurrentTitle(variationStyle + ' Sanctuary')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Regeneration error:', err)
      alert('Regeneration failed: ' + err.message)
    } finally {
      setIsRegenerating(false)
      setRegenLoadingMsg('')
    }
  }

  const handleMouseDown = () => { isDragging.current = true }
  const handleMouseUp = () => { isDragging.current = false }
  const handleMouseMove = (e) => {
    if (!isDragging.current || !sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setSliderPos((x / rect.width) * 100)
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  /** Download the generated image */
  const handleDownload = async () => {
    try {
      // Handle base64 data URLs directly (NVIDIA returns these)
      if (currentGeneratedImage.startsWith('data:')) {
        const a = document.createElement('a')
        a.href = currentGeneratedImage
        a.download = `stylenest-${style.replace(/\s+/g, '-')}-${Date.now()}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        return
      }
      const res = await fetch(currentGeneratedImage, { mode: 'cors' })
      if (!res.ok) throw new Error('Network response was not ok')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `stylenest-${style.replace(/\s+/g, '-')}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
      window.open(currentGeneratedImage, '_blank')
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar active="designs" />
      <main className="ml-64 flex-1 min-h-screen p-12 pt-24">
        {/* Header */}
        <header className="mb-12 flex justify-between items-center">
          <div>
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">Generation Results</span>
            <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight capitalize">{currentTitle}</h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="px-8 py-3 rounded-xl font-medium text-on-surface bg-surface-container-highest active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined">download</span>
              Download HD
            </button>
            <Link
              to="/canvas3d"
              state={{ generatedImage, style }}
              className="px-8 py-3 rounded-xl font-medium text-white primary-gradient active:scale-95 transition-all flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined">view_in_ar</span>
              Customize in 3D
            </Link>
          </div>
        </header>

        {/* Before/After Comparison Slider */}
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div
            ref={sliderRef}
            className="col-span-12 lg:col-span-8 relative aspect-[16/9] rounded-xl overflow-hidden shadow-2xl cursor-col-resize select-none"
            onMouseDown={handleMouseDown}
          >
            {/* Before (full background) */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${originalImage}')` }} />
            {/* After (clipped) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${currentGeneratedImage}')`,
                clipPath: `inset(0 0 0 ${sliderPos}%)`,
              }}
            />
            {/* Regenerating overlay */}
            {isRegenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
                <p className="text-on-surface font-medium text-sm">{regenLoadingMsg}</p>
              </div>
            )}
            {/* Divider */}
            <div
              className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)] z-10 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined text-primary text-sm font-bold">unfold_more</span>
              </div>
            </div>
            {/* Labels */}
            <div className="absolute top-6 left-6 glass-panel px-4 py-2 rounded-full text-xs font-bold text-on-surface-variant z-20">ORIGINAL</div>
            <div className="absolute top-6 right-6 primary-gradient px-4 py-2 rounded-full text-xs font-bold text-white z-20">AI ENHANCED</div>
          </div>

          {/* Style Summary */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low p-8 rounded-xl h-full flex flex-col">
              <h3 className="font-headline text-xl font-bold mb-6">Style Applied Summary</h3>
              <div className="space-y-6 flex-1">
                {styleSummary.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{item.title}</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/15">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-on-surface-variant">Processing Time</span>
                  <span className="text-on-surface">{processingTime}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium mt-2">
                  <span className="text-on-surface-variant">Model Version</span>
                  <span className="text-on-surface">StyleNest v4.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Suggestions */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline text-2xl font-bold">Related Style Variations</h3>
          </div>
          <div className="grid grid-cols-4 gap-6 mt-6">
            {STYLE_VARIATIONS.map((variation, index) => (
              <div
                key={index}
                className="cursor-pointer group relative"
                onClick={() => handleVariationClick(variation.name)}
              >
                <div className="rounded-2xl overflow-hidden aspect-square mb-3 group-hover:scale-105 transition-transform duration-300 relative">
                  <img
                    src={variation.image}
                    alt={variation.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=100' }}
                  />
                  {isRegenerating && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                      <p className="text-white text-xs text-center px-2">{regenLoadingMsg}</p>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-on-surface text-sm mb-1">{variation.name}</h4>
                <p className="text-on-surface-variant text-xs">{variation.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
