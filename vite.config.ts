import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        singularity: 'singularity.html',
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
