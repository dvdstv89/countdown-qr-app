import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Cargar todas las variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determinar base URL basada en VITE_BASE_URL o entorno
  const baseUrl = env.VITE_BASE_URL || (mode === 'production' ? '/countdown-qr-app/' : '/')
  
  return {
    plugins: [react()],
    base: baseUrl,
    build: {
      outDir: 'dist',
      // Configuración para rutas SPA
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
      open: true,
      // IMPORTANTE: Para que las rutas SPA funcionen en desarrollo
      historyApiFallback: true,
      // Proxy si es necesario para APIs
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
    // Optimización para desarrollo
    optimizeDeps: {
      exclude: ['lucide-react']
    }
  }
})