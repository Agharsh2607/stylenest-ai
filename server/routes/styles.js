/**
 * POST /styles
 * Accepts an image, calls Gemini API for interior style suggestions.
 */
const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')

router.post('/', async (req, res) => {
  try {
    const imageFile = req.file

    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️  GEMINI_API_KEY not set — returning demo suggestions')
      return res.json({
        suggestions: `1. **Modern Minimalist** – Clean lines, neutral palette, and functional furniture for a serene atmosphere.\n\n2. **Industrial Chic** – Exposed brick, metal accents, and Edison lighting for urban sophistication.\n\n3. **Japandi Fusion** – Japanese zen meets Scandinavian warmth with natural wood and muted tones.\n\n4. **Mid-Century Modern** – Retro furniture forms, warm wood finishes, and geometric patterns.\n\n5. **Coastal Contemporary** – Light colors, natural textures, and ocean-inspired accents.`,
        message: 'Demo mode — set GEMINI_API_KEY for real suggestions',
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Convert image to base64 for Gemini
    const imageData = {
      inlineData: {
        data: imageFile.buffer.toString('base64'),
        mimeType: imageFile.mimetype,
      },
    }

    const prompt = `You are an expert interior designer. Analyze this room image and suggest 3-5 interior design styles that would work well for this space. For each style:
1. Name the style
2. Briefly explain why it suits this room (1-2 sentences)
3. Mention 2-3 key design elements

Format as a numbered list with bold style names.`

    const result = await model.generateContent([prompt, imageData])
    const response = await result.response
    const text = response.text()

    res.json({ suggestions: text })
  } catch (error) {
    console.error('Style suggestion error:', error)
    res.status(500).json({ error: 'Style suggestion failed: ' + error.message })
  }
})

module.exports = router
