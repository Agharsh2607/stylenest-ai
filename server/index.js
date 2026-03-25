const express = require('express')
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const cloudinary = require('cloudinary').v2
const Bytez = require('bytez.js')
require('dotenv').config()

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '50mb' }))

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload a base64 image to Cloudinary, returns secure URL
async function uploadToCloudinary(base64Data, mimeType = 'image/jpeg') {
  const dataUri = `data:${mimeType};base64,${base64Data}`
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'stylenest-ai',
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  })
  console.log('Cloudinary upload success:', result.secure_url)
  return result.secure_url
}

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
                text: `You are analyzing an empty room photo to generate a furnished version while keeping the architecture 100% identical.

TASK: Look at this room photo very carefully. Your job is to write an image generation prompt that produces the EXACT SAME ROOM but with ${style} style furniture added. ONLY the furniture changes. Everything else stays identical.

FIRST, extract these architectural facts from the photo:
- How many windows? Where exactly are they? (e.g. "two large windows on the left wall, one narrow window on the right wall")
- What is the floor? (e.g. "warm honey-toned oak hardwood planks running horizontally")
- What color are the walls? (e.g. "bright white", "warm off-white", "light grey")
- What does the ceiling look like? (e.g. "white tray ceiling with recessed spotlights", "flat white ceiling")
- Is there a door visible? Where?
- What is the camera angle? (e.g. "eye-level wide shot from the corner", "straight-on from center")
- Where is the natural light coming from?

NOW write the prompt using this EXACT template, filling in the blanks from your analysis:

"Interior photograph of [EXACT ROOM DESCRIPTION: floor type and color, wall color, ceiling description], [EXACT WINDOW DESCRIPTION: count, positions, sizes, what is visible through them], [DOOR if visible], [CAMERA ANGLE], [NATURAL LIGHT DESCRIPTION]. The room is furnished in ${style} style with [FURNITURE LIST FOR ${style}]. The furniture is arranged in the center and against walls, not blocking any windows. The architectural structure, window positions, wall colors, floor material, ceiling, and camera perspective are identical to the original empty room. photorealistic, 8k, professional interior design photography, virtual staging, furniture only added, architecture unchanged."

FURNITURE TO USE FOR ${style} STYLE:
${style === 'Modern' ? 'a sleek low-profile light grey sectional sofa, a rectangular glass-top coffee table with thin metal legs, a large abstract monochrome canvas on the back wall, a geometric wool area rug, minimal decorative objects, clean lines throughout' : ''}${style === 'Industrial' ? 'a dark brown leather sofa with metal legs, a solid reclaimed wood coffee table, Edison bulb pendant lights hanging from ceiling, black metal open shelving unit against a side wall, a vintage-style area rug' : ''}${style === 'Minimal' ? 'a single clean-lined cream linen sofa, a low solid oak coffee table, one tall fiddle-leaf fig tree in a white pot in the corner, a simple jute area rug, no clutter, maximum open space' : ''}${style === 'Japandi' ? 'a low-profile natural walnut wood sofa with cream cushions, a solid oak low coffee table, a wabi-sabi ceramic vase with dried pampas grass, a shoji-style paper floor lamp, a natural fiber area rug in warm beige' : ''}${style === 'Bohemian' ? 'a rattan sofa with colorful terracotta and teal cushions, layered kilim rugs on the floor, a macrame wall hanging on the side wall, trailing pothos plants on a wooden shelf, warm amber pendant lights' : ''}

STRICT RULES — NEVER VIOLATE THESE:
- Window count, positions and sizes must be IDENTICAL to the original photo
- Wall color must be IDENTICAL
- Floor material and color must be IDENTICAL
- Ceiling must be IDENTICAL
- Camera angle and perspective must be IDENTICAL
- Only furniture and decor are added

OUTPUT: Return ONLY the filled-in prompt. One paragraph. No explanations, no labels, no bullet points.`,
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

    res.json({ prompt, imageBase64, success: true, model: successModel })
  } catch (err) {
    console.error('Route error:', err.message)
    res.status(500).json({ error: err.message, success: false })
  }
})

// ============================================
// ROUTE 2: Bytez SDXL generates room image
// ============================================
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body
    console.log('=== BYTEZ IMAGE GENERATION ===')
    console.log('API Key exists:', !!process.env.BYTEZ_API_KEY)
    console.log('API Key starts with:', process.env.BYTEZ_API_KEY?.substring(0, 8))
    console.log('Prompt:', prompt?.substring(0, 100))

    const sdk = new Bytez(process.env.BYTEZ_API_KEY)
    const model = sdk.model('stabilityai/stable-diffusion-xl-base-1.0')

    console.log('Running SDXL model...')
    const { error, output } = await model.run(
      prompt + ', photorealistic, 8k, professional interior design photography, high resolution'
    )

    console.log('Bytez error:', error)
    console.log('Bytez output type:', typeof output)
    console.log('Bytez output:', JSON.stringify(output)?.substring(0, 200))

    if (error) throw new Error('Bytez model error: ' + JSON.stringify(error))
    if (!output) throw new Error('Bytez returned no output')

    // Extract image — handle all possible output formats
    let base64Image = null
    let mimeType = 'image/png'

    if (typeof output === 'string') {
      if (output.startsWith('http')) {
        // It's a URL — upload directly to Cloudinary by URL
        console.log('Output is URL, uploading to Cloudinary...')
        const result = await cloudinary.uploader.upload(output, {
          folder: 'stylenest-ai',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        })
        return res.json({ imageUrl: result.secure_url, success: true })
      }
      base64Image = output
    } else if (Array.isArray(output) && output.length > 0) {
      const first = output[0]
      if (typeof first === 'string') {
        if (first.startsWith('http')) {
          const result = await cloudinary.uploader.upload(first, {
            folder: 'stylenest-ai',
            resource_type: 'image',
          })
          return res.json({ imageUrl: result.secure_url, success: true })
        }
        base64Image = first
      } else if (first?.url) {
        const result = await cloudinary.uploader.upload(first.url, {
          folder: 'stylenest-ai',
          resource_type: 'image',
        })
        return res.json({ imageUrl: result.secure_url, success: true })
      } else if (first?.base64) {
        base64Image = first.base64
      } else if (first?.image) {
        base64Image = first.image
      }
    } else if (typeof output === 'object') {
      if (output.url || output.image_url || output.imageUrl) {
        const url = output.url || output.image_url || output.imageUrl
        const result = await cloudinary.uploader.upload(url, {
          folder: 'stylenest-ai',
          resource_type: 'image',
        })
        return res.json({ imageUrl: result.secure_url, success: true })
      }
      base64Image = output.base64 || output.image || output.images?.[0]?.base64 || output.images?.[0]
    }

    if (!base64Image) {
      console.log('FULL OUTPUT:', JSON.stringify(output, null, 2))
      throw new Error('Cannot extract image from Bytez output. Output type: ' + typeof output + '. Check server logs.')
    }

    console.log('Uploading base64 to Cloudinary...')
    const imageUrl = await uploadToCloudinary(base64Image, mimeType)
    console.log('SUCCESS! Cloudinary URL:', imageUrl)
    res.json({ imageUrl, success: true })
  } catch (err) {
    console.error('=== GENERATION FAILED ===', err.message)
    res.status(500).json({ error: err.message, success: false })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gemini: !!process.env.GEMINI_API_KEY,
    bytez: !!process.env.BYTEZ_API_KEY,
    cloudinary: !!process.env.CLOUDINARY_API_KEY,
    nvidia: false,
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Gemini key loaded: ${!!process.env.GEMINI_API_KEY}`)
  console.log(`Bytez key loaded: ${!!process.env.BYTEZ_API_KEY}`)
  console.log(`Cloudinary loaded: ${!!process.env.CLOUDINARY_API_KEY}`)
})
