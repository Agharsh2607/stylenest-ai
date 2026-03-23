const express = require('express')
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '50mb' }))

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ============================================
// ROUTE 1: Gemini analyzes room + writes prompt
// ============================================
app.post('/api/analyze-room', async (req, res) => {
  try {
    const { imageBase64, mimeType, style } = req.body
    console.log('Gemini analyzing room for style:', style)
    console.log('Gemini key exists:', !!process.env.GEMINI_API_KEY)

    const MODELS = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-1.5-pro',
      'gemini-1.5-pro-001',
      'gemini-pro-vision',
    ]

    let prompt = null
    let successModel = null

    for (const modelName of MODELS) {
      try {
        console.log('Trying model:', modelName)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                text: `You are an expert interior designer and AI image generation prompt engineer.

CAREFULLY analyze this empty room photo and note EVERY detail:
- EXACT window positions (left/right/back wall)
- Window sizes (large/small/floor to ceiling)
- Floor type (light oak wood, tile, carpet etc)
- Wall colors (white, beige, grey etc)
- Ceiling features (height, beams, lights)
- Door positions
- Room shape (square, rectangular, L-shaped)
- Natural light direction

Now write a Stable Diffusion prompt that will generate this EXACT SAME ROOM but furnished.

STRICT RULES FOR THE PROMPT:
1. Start with the room description FIRST:
"Interior of a room with [exact floor type], [exact wall color] walls, [window position] windows showing [outside view]..."
2. Then add furniture in ${style} style
3. Preserve exact window positions mentioned
4. Preserve exact floor material and color
5. Same camera angle and perspective
6. Same natural lighting direction

STYLE SPECIFIC FURNITURE FOR ${style}:
${style === 'Modern' ? `- Sleek low-profile grey or white sofa
- Glass or metal coffee table
- Recessed or track lighting
- Abstract wall art
- Minimal clutter
- Colors: white, grey, black accents` : ''}
${style === 'Industrial' ? `- Leather or dark fabric sofa
- Reclaimed wood coffee table
- Exposed Edison bulb lighting
- Metal shelving units
- Brick or concrete texture elements
- Colors: dark brown, black, rust orange` : ''}
${style === 'Minimal' ? `- Single clean-lined sofa in neutral tone
- Simple wooden coffee table
- No clutter, lots of open space
- One or two plants maximum
- White or cream color palette
- Natural materials only` : ''}
${style === 'Japandi' ? `- Low wooden platform sofa
- Natural wood coffee table
- Wabi-sabi ceramic decorations
- Shoji-inspired lighting
- Bamboo or rattan elements
- Colors: warm beige, natural wood, sage green` : ''}
${style === 'Bohemian' ? `- Colorful layered rugs
- Eclectic mix of cushions and throws
- Macrame wall hangings
- Plants everywhere
- Warm amber lighting
- Colors: terracotta, burnt orange, deep purple` : ''}

END the prompt with:
"photorealistic, 8k resolution, professional interior design photography, same room same angle same perspective, preserve original room structure"

RETURN ONLY THE PROMPT. Nothing else.
No explanations. No bullet points.
One detailed paragraph.`,
              },
            ],
          }],
        })
        prompt = result.response.text()
        successModel = modelName
        console.log('SUCCESS with model:', modelName)
        console.log('Prompt:', prompt.substring(0, 100))
        break
      } catch (modelErr) {
        console.log(modelName, 'failed:', modelErr.message)
        continue
      }
    }

    if (!prompt) {
      console.log('All Gemini models failed, using fallback prompt')
      const styleDetails = {
        modern: 'sleek low-profile grey sofa, glass coffee table, recessed lighting, abstract wall art, white and grey palette',
        industrial: 'leather sofa, reclaimed wood coffee table, Edison bulb lighting, metal shelving, dark brown and black palette',
        minimal: 'clean-lined neutral sofa, simple wooden coffee table, open space, one plant, white and cream palette',
        japandi: 'low wooden platform sofa, natural wood coffee table, ceramic decorations, warm beige and sage green palette',
        bohemian: 'colorful layered rugs, eclectic cushions, macrame wall hangings, plants, terracotta and amber palette',
      }
      const details = styleDetails[style?.toLowerCase()] || 'comfortable furniture, tasteful decor'
      prompt = `Interior of a furnished living room with hardwood floors and white walls, large windows with natural light, ${details}, photorealistic, 8k resolution, professional interior design photography, same room same angle same perspective, preserve original room structure`
      successModel = 'fallback'
    }

    res.json({ prompt, success: true, model: successModel })
  } catch (err) {
    console.error('Route error:', err.message)
    res.status(500).json({ error: err.message, success: false })
  }
})

// ============================================
// ROUTE 2: NVIDIA NIM Flux generates room image
// ============================================
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body
    console.log('NVIDIA Flux generating image...')
    console.log('Prompt:', prompt.substring(0, 100))
    console.log('NVIDIA key exists:', !!process.env.NVIDIA_API_KEY)

    const response = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: 'different room, changed walls, moved windows, wrong perspective, cartoon, painting, illustration, low quality, blurry',
        cfg_scale: 0,
        steps: 4,
        seed: Math.floor(Math.random() * 2147483647),
        samples: 1,
      }),
    })

    console.log('NVIDIA response status:', response.status)

    if (response.status === 401) throw new Error('NVIDIA API key is invalid or expired')
    if (response.status === 402) throw new Error('NVIDIA API credits exhausted')
    if (response.status === 429) throw new Error('NVIDIA API rate limit hit, try again in a moment')
    if (response.status === 422) {
      // negative_prompt not supported — retry without it
      console.log('422 received, retrying without negative_prompt...')
      const retry = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ prompt, cfg_scale: 0, steps: 4, seed: Math.floor(Math.random() * 2147483647), samples: 1 }),
      })
      if (!retry.ok) {
        const errText = await retry.text()
        throw new Error(`NVIDIA error ${retry.status}: ${errText}`)
      }
      const retryData = await retry.json()
      const retryBase64 = retryData.artifacts?.[0]?.base64
      if (!retryBase64) throw new Error('No image in NVIDIA retry response')
      return res.json({ imageUrl: `data:image/jpeg;base64,${retryBase64}`, success: true })
    }
    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`NVIDIA error ${response.status}: ${errText}`)
    }

    const data = await response.json()
    console.log('NVIDIA response received')

    const base64Image = data.artifacts?.[0]?.base64
    if (!base64Image) {
      console.log('Full NVIDIA response:', JSON.stringify(data))
      throw new Error('No image in NVIDIA response')
    }

    const imageUrl = `data:image/jpeg;base64,${base64Image}`
    console.log('Image successfully generated! Base64 length:', base64Image.length)
    res.json({ imageUrl, success: true })
  } catch (err) {
    console.error('NVIDIA error:', err.message)
    res.status(500).json({ error: err.message, success: false })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gemini: !!process.env.GEMINI_API_KEY,
    nvidia: !!process.env.NVIDIA_API_KEY,
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Gemini key loaded: ${!!process.env.GEMINI_API_KEY}`)
  console.log(`NVIDIA key loaded: ${!!process.env.NVIDIA_API_KEY}`)
})
