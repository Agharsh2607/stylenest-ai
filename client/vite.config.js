import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy HF requests to avoid CORS
      '/proxy/hf': {
        target: 'https://router.huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/hf/, '/hf-inference'),
        secure: true,
      },
      // Proxy Gemini requests to avoid CORS
      '/proxy/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/gemini/, ''),
        secure: true,
      },
    },
  },
})
