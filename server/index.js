/**
 * StyleNest AI — Express Backend
 * Handles AI API calls for image generation and style suggestions.
 */
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const multer = require('multer')
const generateRoute = require('./routes/generate')
const stylesRoute = require('./routes/styles')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Multer for file uploads (in-memory for API forwarding)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// Routes
app.use('/generate', generateRoute)
app.use('/styles', upload.single('image'), stylesRoute)

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'StyleNest AI backend is running' })
})

app.listen(PORT, () => {
  console.log(`🧠 StyleNest AI backend running on http://localhost:${PORT}`)
})
