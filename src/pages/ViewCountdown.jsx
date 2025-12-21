import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { countdownService } from '../lib/supabase'

export default function ViewCountdown() {
  const { id } = useParams()
  const [countdown, setCountdown] = useState(null)
  const [timeLeft, setTimeLeft] = useState({})
  const [progress, setProgress] = useState(0)
  const [iconPosition, setIconPosition] = useState('0%')
  
  useEffect(() => {
    loadCountdown()
  }, [id])
  
  const loadCountdown = async () => {
    try {
      const data = await countdownService.getCountdown(id)
      setCountdown(data)
    } catch (error) {
      console.error('Error cargando countdown:', error)
    }
  }
  
  useEffect(() => {
    if (!countdown) return
    
    const calculateTime = () => {
      const target = new Date(countdown.targetDate)
      const start = new Date(countdown.startDate || countdown.created_at)
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
        setIconPosition('100%')
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
      setIconPosition(`${calculatedProgress}%`)
    }
    
    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [countdown])
  
  if (!countdown) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando countdown...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: countdown.backgroundImage 
          ? `url(${countdown.backgroundImage}) center/cover`
          : countdown.backgroundColor,
        color: countdown.textColor
      }}
    >
      {/* Overlay para legibilidad */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold drop-shadow-lg">
            {countdown.title}
          </h1>
          <p className="text-2xl md:text-3xl opacity-90 drop-shadow">
            {countdown.message}
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {Object.entries({
            days: 'Días',
            hours: 'Horas', 
            minutes: 'Minutos',
            seconds: 'Segundos'
          }).map(([key, label]) => (
            <div key={key} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 min-w-[120px]">
              <div className="text-5xl md:text-6xl font-bold mb-2">
                {timeLeft[key]?.toString().padStart(2, '0') || '00'}
              </div>
              <div className="text-lg uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
        
        <div className="relative py-8 px-4">
          <div className="h-6 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {countdown.progressIcon && (
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
              style={{ left: iconPosition }}
            >
              <img 
                src={countdown.progressIcon}
                alt="Progress icon"
                className="w-16 h-16 filter drop-shadow-2xl animate-float"
              />
            </div>
          )}
          
          <div className="flex justify-between text-sm mt-2">
            <span>Inicio</span>
            <span className="font-bold">{progress.toFixed(1)}%</span>
            <span>Evento</span>
          </div>
        </div>
        
        {timeLeft.hasEnded && (
          <div className="bg-yellow-500/20 backdrop-blur-sm p-8 rounded-2xl border-2 border-yellow-500">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold">¡EL EVENTO HA LLEGADO!</h2>
            <p className="text-xl mt-2">¡Es hora de celebrar!</p>
          </div>
        )}
        
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl inline-block">
          <p className="text-lg">Comparte este countdown:</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              alert('Enlace copiado al portapapeles!')
            }}
            className="mt-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Copiar Enlace
          </button>
        </div>
      </div>
    </div>
  )
}