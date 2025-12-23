import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuración CRÍTICA para GitHub Pages
  base: '/countdown-qr-app/',
  build: {
    outDir: 'dist',
    // Añadir estas opciones para asegurar rutas correctas
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Asegurar nombres de archivos consistentes
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
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
    historyApiFallback: true
  }
})