import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Configuración DUAL: diferente para dev/prod
  base: process.env.NODE_ENV === 'production' 
    ? '/countdown-qr-app/'  // Solo en producción (GitHub Pages)
    : '/',                   // En desarrollo local
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true  // Abre navegador automáticamente
  }
})