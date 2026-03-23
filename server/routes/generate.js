/**
 * POST /generate
 * Step 1: Use Gemini to create a detailed interior design prompt from the uploaded image
 * Step 2: Use Hugging Face SDXL to generate the styled room image
 */
const express = require('express')
const router = express.Router()

const GEMINI_KEY = process.env.GEMINI_API_KEY
const HF_TOKEN = process.env.HF_TOKEN

console.log('Gemini key loaded:', !!GEMINI_KEY)
console.log('HF token loaded:', !!HF_TOKEN)

const stylePrompts = {
  modern: 'modern contemporary interior design, clean lines, minimalist furniture, neutral tones, high-end finishes',
  industrial: 'industrial loft interior, exposed brick walls, metal accents, Edison bulbs, raw concrete, vintage furniture',
  minimal: 'ultra minimalist interior design, white walls, simple furniture, natural light, zen atmosphere, Scandinavian',
  japandi: 'Japandi style interior, Japanese minimalism meets Scandinavian design, natural materials, wabi-sabi, warm wood tones',
}

/** Call Gemini to generate a design prompt from the image */
async function getDesignPrompt(base64Image, mimeType, style) {
  if (!GEMINI_KEY) {
    // Fallback prompt if no Gemini key
    return `A beautifully furnished room in ${style} style. ${stylePrompts[style] || stylePrompts.modern}, photorealistic, 8k, professional interior photography`
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: `You are an expert interior designer. Look at this room and create a detailed image generation prompt to furnish and decorate it in ${style} style. ${stylePrompts[style] || ''}. Return ONLY the prompt text, nothing else, no explanations, no quotes, no markdown.`,
            },
          ],
        }],
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    console.error('Gemini error:', err)
    // Fall back to static prompt
    return `A beautifully furnished room in ${style} style. ${stylePrompts[style] || stylePrompts.modern}, photorealistic, 8k, professional interior photography`
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || `${style} interior design, ${stylePrompts[style]}`
}

/** Call Hugging Face SDXL to generate the image, with retry on 503 */
async function generateWithHF(prompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(
      'https://router.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt + ', photorealistic, interior design, 8k, professional photography, high quality',
          parameters: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
          },
        }),
      }
    )

    if (response.status === 503) {
      const body = await response.json().catch(() => ({}))
      const waitTime = (body.estimated_time || 20) * 1000
      console.log(`HF model loading, waiting ${waitTime}ms before retry ${attempt + 1}...`)
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, Math.min(waitTime, 30000)))
        continue
      }
      throw new Error('MODEL_LOADING: AI model is warming up. Please try again in 30 seconds.')
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HF error ${response.status}: ${errorText}`)
    }

    // Returns image blob — convert to base64 to send over JSON
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:image/jpeg;base64,${base64}`
  }
}

router.post('/', async (req, res) => {
  try {
    const { style, image } = req.body

    if (!image) {
      return res.status(400).json({ error: 'No image provided' })
    }

    // Extract base64 data — image may be a data URI or a URL
    let base64Image = null
    let mimeType = 'image/jpeg'

    if (image.startsWith('data:')) {
      // data:image/jpeg;base64,<data>
      const [header, data] = image.split(',')
      base64Image = data
      mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
    } else {
      // It's a URL — fetch and convert
      const imgRes = await fetch(image)
      if (!imgRes.ok) throw new Error('Failed to fetch uploaded image URL')
      const buffer = await imgRes.arrayBuffer()
      base64Image = Buffer.from(buffer).toString('base64')
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg'
    }

    // Step 1: Get design prompt
    console.log('Getting design prompt for style:', style)
    const designPrompt = await getDesignPrompt(base64Image, mimeType, style)
    console.log('Design prompt:', designPrompt.substring(0, 100) + '...')

    // Step 2: Generate image
    if (!HF_TOKEN) {
      // Demo mode — no HF token
      return res.json({
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
        style: style || 'modern',
        prompt: designPrompt,
        message: 'Demo mode — set HF_TOKEN for real generation',
      })
    }

    console.log('Generating image with Hugging Face...')
    const generatedImage = await generateWithHF(designPrompt)

    res.json({
      image: generatedImage,
      style: style || 'modern',
      prompt: designPrompt,
    })
  } catch (error) {
    console.error('Generation error:', error.message)

    let userMessage = error.message
    if (error.message.includes('MODEL_LOADING')) {
      userMessage = 'AI model is warming up. Please try again in 30 seconds.'
    } else if (error.message.includes('Failed to fetch')) {
      userMessage = 'Network error reaching AI service. Check your internet connection.'
    } else if (error.message.includes('401') || error.message.includes('403')) {
      userMessage = 'API key invalid or expired. Please check your HF_TOKEN.'
    }

    res.status(500).json({ error: userMessage })
  }
})

module.exports = router
