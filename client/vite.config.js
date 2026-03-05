import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // base = nom du repo GitHub (ex: /cofina-reporting/)
  // Changer si le repo a un nom différent ou si c'est un repo racine (base: '/')
  base: '/cofina-reporting/',

  plugins: [react()],

  server: {
    port: 3000,
    // Proxy vers le backend local (dev uniquement — pas utilisé sur GitHub Pages)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
