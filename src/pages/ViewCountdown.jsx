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
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: countdown.useImage && countdown.backgroundImage
          ? `url(${countdown.backgroundImage}) center/cover no-repeat`
          : countdown.backgroundColor,
        color: countdown.textColor
      }}
    >
      {/* Contenido principal */}
      <div className="max-w-4xl w-full text-center space-y-10">
        
        {/* Mostrar vistas si existen */}
        {countdown.views > 0 && (
          <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
            👁️ {countdown.views} vistas
          </div>
        )}
        
        {/* Título y mensaje */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold drop-shadow-lg">
            {countdown.title}
          </h1>
          <p className="text-2xl md:text-3xl opacity-90 drop-shadow">
            {countdown.message}
          </p>
        </div>
        
        {/* Countdown Timer - GRANDE */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {Object.entries({
            days: 'Días',
            hours: 'Horas', 
            minutes: 'Minutos',
            seconds: 'Segundos'
          }).map(([key, label]) => (
            <div 
              key={key} 
              className="bg-black/20 backdrop-blur-md rounded-2xl p-6 min-w-[140px]"
            >
              <div className="text-6xl md:text-7xl font-bold mb-2">
                {timeLeft[key]?.toString().padStart(2, '0') || '00'}
              </div>
              <div className="text-xl uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
        
        {/* Barra de Progreso con Icono */}
        <div className="relative py-8 px-4 max-w-2xl mx-auto">
          <div className="h-4 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {countdown.progressIcon && (
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
              style={{ left: `${progress}%` }}
            >
              <div className="w-20 h-20 filter drop-shadow-2xl">
                <IconRenderer 
                  iconKey={countdown.progressIcon}
                  color={countdown.textColor}
                  size="5em"
                  animate={true}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-between text-sm mt-3">
            <span>Inicio</span>
            <span className="font-bold text-lg">{progress.toFixed(1)}%</span>
            <span>Evento</span>
          </div>
        </div>
        
        {/* Fecha del Evento + Botón Compartir */}
        <div className="mt-12 pt-8 border-t border-white/20 max-w-2xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Fecha del Evento */}
            <div className="text-left flex-1">
              <h3 className="text-2xl font-bold mb-2">📅 Fecha del Evento</h3>
              <p className="text-xl">{formattedDate}</p>
            </div>
            
            {/* Botón de Compartir */}
            <div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('¡Enlace copiado al portapapeles!')
                }}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/30 flex items-center space-x-3 text-xl font-semibold hover:scale-105 active:scale-95"
              >
                <FaShareAlt className="text-2xl" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mensaje cuando termina */}
        {timeLeft.hasEnded && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-12 rounded-3xl text-center max-w-2xl mx-6">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-5xl font-bold mb-4">¡EL EVENTO HA LLEGADO!</h2>
              <p className="text-2xl">¡Es hora de celebrar!</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Crédito pequeño */}
      <div className="absolute bottom-4 right-4 text-white/40 text-sm">
        Countdown QR Generator
      </div>
    </div>
  )
}