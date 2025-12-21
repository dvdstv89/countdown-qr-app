import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FaShareAlt } from 'react-icons/fa'
import toast from 'react-hot-toast' 
import { countdownService } from '../services/countdownService'
import IconRenderer from '../components/IconRenderer';

export default function ViewCountdown() {
  const { id } = useParams()
  const [countdown, setCountdown] = useState(null)
  const [timeLeft, setTimeLeft] = useState({})
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Cargar datos desde Supabase
  useEffect(() => {
    const loadCountdown = async () => {
      try {
        setLoading(true)
        const data = await countdownService.getCountdown(id)
        setCountdown(data)
        setError(null)
      } catch (err) {
        console.error('Error cargando countdown:', err)
        setError('No se pudo cargar el countdown desde la nube')
        
        // Intentar cargar desde localStorage como fallback
        try {
          const saved = localStorage.getItem(`countdown_${id}`)
          if (saved) {
            const localData = JSON.parse(saved)
            setCountdown(localData)
            toast.success('Cargado desde copia local')
          }
        } catch (localError) {
          console.error('Error cargando localmente:', localError)
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadCountdown()
  }, [id])
  
  // Calcular tiempo y progreso
  useEffect(() => {
    if (!countdown) return
    
    const calculateTime = () => {
      const target = new Date(countdown.targetDate)
      const start = new Date(countdown.startDate)
      const now = new Date()
      
      const diff = target - now
      
      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          hasEnded: true
        })
        setProgress(100)
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        hasEnded: false
      })
      
      // Calcular progreso
      const totalDuration = target - start
      const elapsed = now - start
      const calculatedProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
      setProgress(calculatedProgress)
    }
    
    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [countdown])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Cargando countdown desde la nube...</p>
        </div>
      </div>
    )
  }
  
  if (error && !countdown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">⚠️ Error</h2>
          <p className="text-white mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }
  
  // Formatear fecha bonita
  const formattedDate = new Date(countdown.targetDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative"
      style={{
        background: countdown.useImage && countdown.backgroundImage
          ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${countdown.backgroundImage}) center/cover no-repeat`
          : countdown.backgroundColor,
        color: countdown.textColor
      }}
    >
      {/* Contenido principal */}
      <div className="max-w-4xl w-full text-center space-y-8 md:space-y-10">
        
        {/* Mostrar vistas si existen - Mejor posición */}
        {countdown.views > 0 && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-sm text-white/90 shadow-lg">
            👁️ {countdown.views} vistas
          </div>
        )}
        
        {/* Título y mensaje con mejor contraste */}
        <div className="space-y-4 mb-6">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] px-4">
            {countdown.title}
          </h1>
          <p className="text-xl md:text-2xl opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] px-4">
            {countdown.message}
          </p>
        </div>
        
        {/* Countdown Timer - MEJOR DISEÑO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-2xl mx-auto px-2">
          {Object.entries({
            days: 'Días',
            hours: 'Horas', 
            minutes: 'Minutos',
            seconds: 'Segundos'
          }).map(([key, label]) => (
            <div 
              key={key} 
              className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl border border-white/10"
            >
              <div className="text-4xl md:text-5xl font-bold mb-1 md:mb-2 font-mono tracking-tight">
                {timeLeft[key]?.toString().padStart(2, '0') || '00'}
              </div>
              <div className="text-sm md:text-base uppercase tracking-widest font-semibold opacity-90">
                {label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Barra de Progreso con Icono - SIN TEXTO */}
        <div className="relative py-6 md:py-8 px-2 max-w-2xl mx-auto w-full">
          <div className="h-3 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {countdown.progressIcon && (
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 z-10"
              style={{ left: `${progress}%` }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                <IconRenderer 
                  iconKey={countdown.progressIcon}
                  color={countdown.textColor}
                  size="4em"
                  animate={true}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Fecha del Evento + Botón Compartir - MEJOR CONTRASTE */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/20 max-w-2xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 px-2">
            {/* Fecha del Evento con fondo para mejor legibilidad */}
            <div className="bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-md rounded-xl p-5 md:p-6 shadow-xl border border-white/10 flex-1">
              <h3 className="text-lg md:text-xl font-bold mb-2 text-white/90">📅 Fecha del Evento</h3>
              <p className="text-base md:text-lg text-white font-medium tracking-wide">
                {formattedDate}
              </p>
            </div>
            
            {/* Botón de Compartir con mejor diseño */}
            <div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('¡Enlace copiado al portapapeles!')
                }}
                className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-white/25 to-white/15 backdrop-blur-lg rounded-xl transition-all duration-300 border border-white/30 flex items-center space-x-2 md:space-x-3 text-base md:text-xl font-semibold hover:bg-white/30 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <FaShareAlt className="text-xl md:text-2xl" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mensaje cuando termina */}
        {timeLeft.hasEnded && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
            <div className="bg-gradient-to-br from-purple-600/95 to-pink-600/95 p-8 md:p-12 rounded-3xl text-center max-w-2xl mx-4 shadow-2xl border border-white/20">
              <div className="text-6xl md:text-8xl mb-4 md:mb-6 animate-bounce">🎉</div>
              <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-white drop-shadow-lg">
                ¡EL EVENTO HA LLEGADO!
              </h2>
              <p className="text-xl md:text-2xl text-white/90 font-medium">
                ¡Es hora de celebrar!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}