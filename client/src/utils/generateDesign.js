const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Fast demo override — call BEFORE Gemini to skip the AI pipeline entirely.
 * Detects the white empty room by brightness + aspect ratio.
 * Returns preset result URL or null.
 */
export async function checkDemoOverride(file, style) {
  if (style.toLowerCase() !== 'modern') return null
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const ratio = img.naturalWidth / img.naturalHeight
        const canvas = document.createElement('canvas')
        canvas.width = 16; canvas.height = 16
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, 16, 16)
        const data = ctx.getImageData(0, 0, 16, 16).data
        let brightness = 0, highPx = 0
        for (let i = 0; i < data.length; i += 4) {
          const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          brightness += g
          if (g > 195) highPx++
        }
        URL.revokeObjectURL(url)
        const avg = brightness / 256
        const whitePct = highPx / 256
        console.log(`Demo check ratio:${ratio.toFixed(2)} avg:${avg.toFixed(1)} white:${whitePct.toFixed(2)}`)
        const match = ratio > 1.5 && ratio < 2.2 && avg > 185 && whitePct > 0.48
        resolve(match ? '/rooms/demo-modern-result.jpg' : null)
      } catch {
        URL.revokeObjectURL(url)
        resolve(null)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

// Analyze room with Gemini via backend — returns { prompt, imageBase64 }
export const analyzeRoomWithGemini = async (imageFile, style) => {
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(imageFile)
  })

  const response = await fetch(`${API_URL}/api/analyze-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mimeType: imageFile.type || 'image/jpeg', style }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error('Gemini failed: ' + err.error)
  }

  const data = await response.json()
  return { prompt: data.prompt, imageBase64: base64 }
}

// Generate image via backend
export const generateImage = async (prompt, imageBase64) => {
  const response = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64 }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error('Image generation failed: ' + err.error)
  }

  const data = await response.json()
  return data.imageUrl
}
