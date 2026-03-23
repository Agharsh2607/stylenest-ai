/**
 * POST /generate
 * Accepts an image + style, calls Replicate API (Stable Diffusion + ControlNet),
 * and returns a generated image URL.
 */
const express = require('express')
const router = express.Router()
const Replicate = require('replicate')

router.post('/', async (req, res) => {
  try {
    const { style, imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({ error: 'No image URL provided' })
    }

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      // Return a demo response when no API key is configured
      console.log('⚠️  REPLICATE_API_TOKEN not set — returning demo response')
      return res.json({
        generatedUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTNExI2_zm3EMMdLnCH7hgjOud42MpmTMMwfSVb1qIAjSkLjVUqpaXRwVJdEOamDurBb3a0RqO_AvqK9XzRTz7iJg4vrZlMWiDgN11EFw954ZaV4BSlGork0y-m03ol3cNjyn59_bHCy-h_xKHp3IUZgjRG3v-dTh1TTduxwer2LWzKPWx6GFa0BAX3FSj1hmI6MDIXHzPwpziwgY176NI-LIodMKJsC_c1x1A6CxqfY15PMNnWH9Kav2b8OzNZK-zDok13nMWnAo',
        style: style || 'modern',
        message: 'Demo mode — set REPLICATE_API_TOKEN for real generation',
      })
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

    // Style prompt mapping
    const stylePrompts = {
      modern: 'modern contemporary interior design, clean lines, minimalist furniture, neutral tones, high-end finishes',
      industrial: 'industrial loft interior, exposed brick walls, metal accents, Edison bulbs, raw concrete, vintage furniture',
      minimal: 'ultra minimalist interior design, white walls, simple furniture, natural light, zen atmosphere, Scandinavian',
      japandi: 'Japandi style interior, Japanese minimalism meets Scandinavian design, natural materials, wabi-sabi, warm wood tones',
    }

    const promptStr = prompt = stylePrompts[style] || stylePrompts.modern
    const finalPrompt = `Interior design of the same room in ${style} style. Keep exact structure. Only add furniture and decor. ${promptStr}, photorealistic, 8k quality, interior photography`

    // Call Replicate API — using Stable Diffusion with ControlNet depth
    const output = await replicate.run(
      'jagilley/controlnet-depth2img:922c7bb67b87ec32cbc2fd11b1d5f94f0ba4f5571c4571c4d5f93e635e16413f',
      {
        input: {
          image: imageUrl,
          prompt: finalPrompt,
          negative_prompt: 'extra windows, extra doors, new walls, structural changes, distorted layout, unrealistic architecture, low quality, blurry, cartoon, anime, sketch, drawing',
          num_inference_steps: 30,
          guidance_scale: 10,
          strength: 1.0,
        },
      }
    )

    // Replicate returns an array of URLs or a single URL
    const generatedUrl = Array.isArray(output) ? output[0] : output

    res.json({
      generatedUrl,
      style: style || 'modern',
    })
  } catch (error) {
    console.error('Generation Error Stack:', error)
    res.status(500).json({ error: 'AI generation failed: ' + error.message })
  }
})

module.exports = router
