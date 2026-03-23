import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'
import { saveDesign, uploadImage, uploadImageFromUrl, isSupabaseConfigured } from '../services/supabase'

// Style images from the provided HTML mockups
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

export default function UploadGenerate() {
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState(null)
  const [publicOriginalUrl, setPublicOriginalUrl] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.')
      return;
    }

    setUploadedFile(file)
    setUploadedImage(URL.createObjectURL(file))
    setPreviewUrl(URL.createObjectURL(file))
    setGeneratedUrl(null)
    setPublicOriginalUrl(null)
    setError('')
  }

  /** Call backend to get AI style suggestions */
  const getStyleSuggestions = async () => {
    if (!uploadedFile) return
    try {
      const formData = new FormData()
      formData.append('image', uploadedFile)
      const res = await fetch('/api/styles', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.suggestions) setAiSuggestions(data.suggestions)
    } catch (err) {
      console.error('Failed to get style suggestions:', err)
    }
  }

  /** Call backend to generate AI design */
  const handleGenerate = async () => {
    if (!uploadedFile) {
      setError('Please upload an image first')
      return
    }
    setIsGenerating(true)
    setError('')

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })

    try {
      let imageUrl = publicOriginalUrl
      if (!imageUrl && isSupabaseConfigured()) {
        try {
          imageUrl = await uploadImage(uploadedFile, 'uploads')
          setPublicOriginalUrl(imageUrl)
        } catch (imgErr) {
          throw new Error('Failed to upload image to Supabase: ' + imgErr.message)
        }
      }

      // If Supabase is not configured, send Base64 data URI so Replicate can still read the image
      if (!imageUrl) {
        imageUrl = await fileToBase64(uploadedFile)
      }

      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const res = await fetch(`${backendUrl}/generate`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageUrl, // Base64 or Supabase URL
          style: selectedStyle
        })
      })
      
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (err) {
        console.error('Invalid JSON received from server:', text)
        setError('Server returned an invalid response. Ensure backend is running.')
        return
      }

      if (!res.ok) {
        setError(data.error || 'Generation failed with status ' + res.status)
      } else if (data.image) {
        setGeneratedUrl(data.image)
        navigate('/result', {
          state: {
            originalImage: imageUrl || uploadedImage,
            generatedImage: data.image,
            style: selectedStyle,
          },
        })
      }
    } catch (err) {
      setError('Generation failed. ' + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedUrl || !uploadedFile) {
      setError('Please generate a design first before saving.')
      return
    }
    if (!user || !isSupabaseConfigured()) {
      setError('You must be logged in with a configured database to save designs.')
      return
    }
    
    setIsSaving(true)
    setError('')
    try {
      const originalUrl = publicOriginalUrl || await uploadImage(uploadedFile, 'uploads')
      const genUrl = await uploadImageFromUrl(generatedUrl, 'generated')
      await saveDesign({
        userId: user.id,
        originalImage: originalUrl,
        generatedImage: genUrl,
        style: selectedStyle
      })
      navigate('/dashboard')
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save design: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar active="workspace" />
      <main className="ml-64 min-h-screen p-12 flex-1">
        <header className="max-w-6xl mx-auto mb-12">
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
            StyleNest AI <span className="text-primary">Atelier</span>
          </h2>
          <p className="text-secondary font-medium">Transform your architectural vision into curated interior masterpieces.</p>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Upload + Styles */}
          <div className="lg:col-span-7 space-y-8">
            {/* Upload Zone */}
            <section
              onClick={() => fileInputRef.current?.click()}
              className="bg-surface-container-lowest rounded-xl p-1 shadow-sm border border-outline-variant/15 relative overflow-hidden aspect-video flex flex-col items-center justify-center border-dashed border-2 hover:border-primary/40 transition-colors group cursor-pointer"
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded room" className="w-full h-full object-cover rounded-xl" />
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
                    <p className="text-on-surface-variant text-sm max-w-xs mx-auto">Upload a photo of your room or a floor plan to begin the AI transformation.</p>
                    <div className="mt-6">
                      <span className="px-6 py-2 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant uppercase tracking-widest">Select File</span>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* AI Style Suggestions */}
            <AnimatePresence>
              {aiSuggestions && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-tertiary-fixed/30 p-6 rounded-xl border border-tertiary/20"
                >
                  <h4 className="font-headline font-bold text-sm mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-lg">auto_awesome</span>
                    AI Style Suggestions
                  </h4>
                  <div className="space-y-2 text-sm text-on-surface-variant">{aiSuggestions}</div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Style Selector Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-lg text-on-surface">Curated Styles</h3>
                {uploadedFile && (
                  <button
                    onClick={getStyleSuggestions}
                    className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Get AI Suggestions
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STYLES.map((style) => (
                  <div key={style.key} className="group cursor-pointer" onClick={() => setSelectedStyle(style.key)}>
                    <div className={`aspect-square rounded-lg overflow-hidden mb-2 transition-all ${selectedStyle === style.key ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`}>
                      <img alt={style.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={STYLE_IMAGES[style.key]} />
                    </div>
                    <p className={`font-headline text-sm text-center ${selectedStyle === style.key ? 'font-bold' : 'font-medium text-on-surface-variant'}`}>{style.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Preview & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Preview Canvas */}
            <div className="flex-1 bg-surface-container-low rounded-xl relative overflow-hidden group min-h-[400px]">
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-inverse-surface/90 text-inverse-on-surface px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">Live Preview</span>
              </div>

              {/* Loading Overlay */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 glass-panel z-20 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      </div>
                    </div>
                    <h4 className="font-headline font-extrabold text-xl mb-2">Curating Your Vision</h4>
                    <p className="text-on-surface-variant text-sm">StyleNest AI is analyzing light vectors and spatial volume...</p>
                    <div className="w-full max-w-[200px] h-1 bg-surface-container mt-6 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gold-gradient" initial={{ width: '10%' }} animate={{ width: '90%' }} transition={{ duration: 15, ease: 'linear' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preview Image */}
              <img
                alt="Preview"
                className={`w-full h-full object-cover ${isGenerating ? 'blur-sm' : ''}`}
                src={generatedUrl || previewUrl || PREVIEW_BG}
              />
            </div>

            {/* Action Panel */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4">
              {error && (
                <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm">{error}</div>
              )}
              <div className="flex items-center gap-4 p-4 bg-secondary-container/30 rounded-lg">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">Generated designs consume <span className="font-bold">2 credits</span>. High-resolution exports available after rendering.</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !uploadedFile}
                className="w-full bg-gold-gradient hover:opacity-90 active:scale-[0.98] transition-all text-white py-5 rounded-xl font-headline font-black text-lg tracking-tight shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">magic_button</span>
                {isGenerating ? 'Generating...' : 'Generate Design'}
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || !generatedUrl}
                className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-3 rounded-xl font-headline font-bold text-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save to Workspace'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
