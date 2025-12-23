import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Para GitHub Pages, usa solo '/' en desarrollo
  base: process.env.NODE_ENV === 'production' && process.env.VITE_GH_PAGES === 'true'
    ? '/countdown-qr-app/'
    : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          qrcode: ['qrcode', 'qrcode.react', 'react-qr-code']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    // Esto es CRÍTICO para SPA en desarrollo
    historyApiFallback: true,
    cors: true
  },
  // Resolver problema de require
  resolve: {
    alias: {
      // Si hay algún paquete que use require, añádelo aquí
    }
  }
})