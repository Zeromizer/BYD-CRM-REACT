import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/BYD-CRM-REACT/',  // GitHub Pages deployment path
  build: {
    outDir: 'dist',
  }
})
