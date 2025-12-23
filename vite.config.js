import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build' || mode === 'production'
  
  return {
    plugins: [react()],
    base: isProduction ? '/countdown-qr-app/' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
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
      port: 3000,  // Cambia a 3000
      host: 'localhost',  // Usa solo localhost
      open: true,
      cors: true,
      // Configuración para problemas de red
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      // Hot reload
      hmr: {
        overlay: true
      }
    },
    // Cache
    cacheDir: '.vite',
    // Optimizaciones
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['lucide-react']
    }
  }
})