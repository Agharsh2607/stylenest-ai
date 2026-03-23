const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Analyze room with Gemini via backend — returns a design prompt string
export const analyzeRoomWithGemini = async (imageFile, style) => {
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(imageFile)
  })

  console.log('Sending image to Gemini backend...')
  const response = await fetch(`${API_URL}/api/analyze-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType: imageFile.type || 'image/jpeg',
      style,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error('Gemini failed: ' + err.error)
  }

  const data = await response.json()
  console.log('Gemini prompt received!')
  return data.prompt
}

// Generate image with NVIDIA NIM Flux via backend — returns a base64 data URL
export const generateImage = async (prompt) => {
  console.log('Calling NVIDIA Flux via backend...')
  const response = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error('Image generation failed: ' + err.error)
  }

  const data = await response.json()
  console.log('NVIDIA image received!')
  return data.imageUrl
}
