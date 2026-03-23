import { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'

// Fallback images from the provided HTML
const FALLBACK_BEFORE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiET0wZ23lpnCcxoagwJYUQoV2qjOmjBRJm62XynjS1q5NRlXA9VpEfYBoHaQsVgPw9lzvzUwWOguH9i3xyiFvvLSs1AbuSvKWAGCAVyiZDLfLciCC0kQ6z3_B0hcBzQDvpFde7pNkQ2HTfZuYKppZOXIHqLeTvNiC7LhD5F_Xau8kDjtt9GBVOrMhwBy1h_hRVvfLKS5MTbAM4IW9RdqBcU2s5CrOI7r8f-W4xv6cNdLKfaWRnt5zc5cpedczu7aIGGjRAvyH0kc'
const FALLBACK_AFTER = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTNExI2_zm3EMMdLnCH7hgjOud42MpmTMMwfSVb1qIAjSkLjVUqpaXRwVJdEOamDurBb3a0RqO_AvqK9XzRTz7iJg4vrZlMWiDgN11EFw954ZaV4BSlGork0y-m03ol3cNjyn59_bHCy-h_xKHp3IUZgjRG3v-dTh1TTduxwer2LWzKPWx6GFa0BAX3FSj1hmI6MDIXHzPwpziwgY176NI-LIodMKJsC_c1x1A6CxqfY15PMNnWH9Kav2b8OzNZK-zDok13nMWnAo'

const SUGGESTIONS = [
  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyqJTCO1yyf79LHkvErI6JuJC47MHa39bymjjIQpgwkeKzHIK7pM62-PaPoIhO1SdAFmPhuUmYghCIlS6XeQwwmBT-ZBp6kwGxuUSVuO5JQcEtr0Sy2Babldr52e2FE80lrJOX9TBJWtUF-PqJi_rEGLxhlj0fIsxJebXiJNPCXa5LkPEojodOLVpb35FWS5Ialjk1vqVYEMG_6V8cb-cnHyayoDH1X54LNuNjqyqcm7DEYN6E_FH4OqdKD4gNoxTUfnMaNXGy8uw',
    title: 'Nordic Minimalist', desc: 'Clean lines, lighter wood, and cool tones.' },
  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNS670yeopKoKUUoZu7Ga5-pGQHCGfupNkxy6nrCha-dKTQJj_PYGr4cq32ywtmJKO-rAXNcZpDPSbCSuQ6cPQvOtmEgtKbVLlTcChoLC5LhfCwLOGodnAcE2dIdCEeprsQPdhoh_MJyZJQP8xfhRBYgrDGnCxiGtJOUrEczT03VnD-_zQfGLAtTiCwx7SRSh5S-A7IjcFszMnv6Hj7Hzqx0oMMGKkB81TZFsHg1vGnflm53KbdbpZQ5Iucrr0o1Slj1chZ9BchBM',
    title: 'Industrial Loft', desc: 'Exposed brick, metal accents, and raw textures.' },
  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTxTZPvIMD-HI1tOXIX3kf6no6g7h8zHEdNof3rlSLqer3wgMgLTYCDUPp6a_DADq51AXYc17dHUGU46INRAVAZ3mkmUrEGjWppEn9eRzeSDbmKK4ZWyx_ShD9kmX_8Z_gZPTwodlq3qbnGroOyfAL4eTIRQDpFmZy3Zre6DkV43otaE1DcrUNg3FNQSPxpRWm2eeMomgNZwPKKba6AgsVW7FEec6EBK9lLiT1uZ-ZJlD1FBb1YbQwsQoMPH6_QUQhmmIP_d5nepc',
    title: 'Japandi Fusion', desc: 'Zen aesthetics mixed with Scandinavian utility.' },
  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGM_70tluBEuE7OaBfAZDYJ17l_kAUM726AmmGNOLr78yslekW1RWQg8dwU3p8yFRHQYGujPU7mKZX0uirUUBHQBRS_gxy12hVOLyM2EaKIx6iR8Ca7iSxy-Nk9Rt9vyPA68xhV1Wegi3jz9JA2m_O8kOHlvm4dxn8XBJ7btBrgluXy6CKMjzC1JJG96P1eMf4RQhbN_p_1I89O2nk2Ysixz1KQy87HGYAIapXpV0Z4SGCuYK31IFDSgJFKKHPlYAftPdj8MYbg68',
    title: 'Art Deco Revival', desc: 'Velvet fabrics, gold trims, and bold geometry.' },
]

export default function ResultView() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const originalImage = state.originalImage || FALLBACK_BEFORE
  const generatedImage = state.generatedImage || FALLBACK_AFTER
  const style = state.style || 'Mid-Century Modern'

  // Slider state
  const [sliderPos, setSliderPos] = useState(50)
  const sliderRef = useRef(null)
  const isDragging = useRef(false)

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
      const res = await fetch(generatedImage)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stylenest-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(generatedImage, '_blank')
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar active="designs" />
      <main className="ml-64 flex-1 min-h-screen p-12">
        {/* Header */}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">Generation Results</span>
            <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight capitalize">{style} Sanctuary</h2>
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
                backgroundImage: `url('${generatedImage}')`,
                clipPath: `inset(0 0 0 ${sliderPos}%)`,
              }}
            />
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
                {[
                  { icon: 'palette', title: 'Earth Tones & Teak', desc: 'Incorporated a warm palette of walnut, terracotta, and forest green accents.' },
                  { icon: 'chair', title: 'Curated Furniture', desc: 'Added iconic Eames-inspired seating and minimalist low-profile sideboards.' },
                  { icon: 'light_mode', title: 'Global Illumination', desc: 'Optimized natural light bounce for soft shadows.' },
                ].map((item, i) => (
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
                  <span className="text-on-surface">1.2s</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUGGESTIONS.map((s, idx) => (
              <motion.div
                key={idx}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300">
                  <img alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={s.img} />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-on-surface">Apply Style</span>
                  </div>
                </div>
                <h4 className="font-bold text-on-surface">{s.title}</h4>
                <p className="text-xs text-on-surface-variant">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
