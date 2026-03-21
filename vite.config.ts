import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// PWA plugin will be added in issue #7 once vite-plugin-pwa supports Vite 8
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})
