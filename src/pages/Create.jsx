import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'
import { countdownService } from '../lib/supabase'

const defaultIcons = [
  { name: 'Pastel', url: 'https://cdn-icons-png.flaticon.com/512/3067/3067259.png', type: 'birthday' },
  { name: 'Santa', url: 'https://cdn-icons-png.flaticon.com/512/3480/3480619.png', type: 'christmas' },
  { name: 'Regalo', url: 'https://cdn-icons-png.flaticon.com/512/2582/2582635.png', type: 'gift' },
  { name: 'Reloj', url: 'https://cdn-icons-png.flaticon.com/512/3208/3208720.png', type: 'hourglass' },
  { name: 'Corazón', url: 'https://cdn-icons-png.flaticon.com/512/2107/2107845.png', type: 'love' },
  { name: 'Cohete', url: 'https://cdn-icons-png.flaticon.com/512/824/824100.png', type: 'rocket' },
]

const defaultBackgrounds = [
  { name: 'Estrellas', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba' },
  { name: 'Fiesta', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d' },
  { name: 'Naturaleza', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  { name: 'Navidad', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136' },
]

export default function Create() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [showQR, setShowQR] = useState(false)
  
  const [formData, setFormData] = useState({
    title: 'Cumpleaños de David',
    targetDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    startDate: new Date().toISOString().slice(0, 10),
    message: '¡Falta poco para tu día especial!',
    backgroundColor: '#4a148c',
    textColor: '#ffffff',
    backgroundImage: '',
    progressIcon: 'https://cdn-icons-png.flaticon.com/512/3067/3067259.png',
  })
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [progress, setProgress] = useState(0)
  
  // Calcular tiempo restante y progreso
  const calculateTime = () => {
    const target = new Date(formData.targetDate)
    const start = new Date(formData.startDate)
    const now = new Date()
    
    const diff = target - now
    if (diff <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setProgress(100)
      return
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    setTimeLeft({ days, hours, minutes, seconds })
    
    // Calcular progreso
    const totalDuration = target - start
    const elapsed = now - start
    const calculatedProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
    setProgress(calculatedProgress)
  }
  
  // Actualizar cada segundo
  useState(() => {
    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  })
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Crear countdown
      const countdown = await countdownService.createCountdown(formData)
      
      // Generar URL
      const appUrl = window.location.origin
      const countdownUrl = `${appUrl}/c/${countdown.public_url}`
      
      // Generar QR
      const qrDataUrl = await QRCode.toDataURL(countdownUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCode(qrDataUrl)
      setShowQR(true)
      
      toast.success('Countdown creado! Escanea el QR para verlo')
      
    } catch (error) {
      toast.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const downloadQR = () => {
    const link = document.createElement('a')
    link.download = `countdown-${formData.title.replace(/\s+/g, '-')}.png`
    link.href = qrCode
    link.click()
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Crear Countdown</h1>
      <p className="text-gray-600 mb-8">Personaliza cada detalle de tu cuenta regresiva</p>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Evento
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Cumpleaños de David"
                required
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Evento
                </label>
                <input
                  type="datetime-local"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Para calcular el progreso</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje Personalizado
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="¡Falta poco para tu día especial!"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Fondo
                </label>
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                  className="w-full h-12 rounded-lg cursor-pointer border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Texto
                </label>
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                  className="w-full h-12 rounded-lg cursor-pointer border"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Icono de Progreso
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {defaultIcons.map((icon) => (
                  <button
                    key={icon.url}
                    type="button"
                    onClick={() => setFormData({...formData, progressIcon: icon.url})}
                    className={`p-3 rounded-lg border-2 ${
                      formData.progressIcon === icon.url
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <img src={icon.url} alt={icon.name} className="w-8 h-8 mx-auto" />
                    <span className="text-xs mt-1 block">{icon.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Imagen de Fondo (Opcional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {defaultBackgrounds.map((bg) => (
                  <button
                    key={bg.url}
                    type="button"
                    onClick={() => setFormData({...formData, backgroundImage: bg.url})}
                    className={`rounded-lg overflow-hidden border-2 ${
                      formData.backgroundImage === bg.url
                        ? 'border-purple-500 ring-2 ring-purple-300'
                        : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={bg.url} 
                      alt={bg.name} 
                      className="w-full h-20 object-cover"
                    />
                    <div className="p-2 text-xs text-center bg-white">{bg.name}</div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O sube tu propia imagen:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setFormData({...formData, backgroundImage: url})
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Generando...
                </span>
              ) : (
                'Generar Countdown y QR'
              )}
            </button>
          </form>
        </div>
        
        {/* Vista Previa */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vista Previa</h2>
            
            <div 
              className="rounded-xl overflow-hidden shadow-lg mb-6"
              style={{
                background: formData.backgroundImage 
                  ? `url(${formData.backgroundImage}) center/cover`
                  : formData.backgroundColor
              }}
            >
              <div className="p-8" style={{ color: formData.textColor }}>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4">{formData.title}</h3>
                  <p className="text-xl opacity-90">{formData.message}</p>
                </div>
                
                <div className="flex justify-center space-x-4 mb-8">
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="text-center bg-black/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                      <div className="text-3xl font-bold">{value.toString().padStart(2, '0')}</div>
                      <div className="text-sm uppercase opacity-80">{unit}</div>
                    </div>
                  ))}
                </div>
                
                {/* Barra de Progreso con Icono */}
                <div className="relative mb-4">
                  <div className="h-4 bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/40 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {formData.progressIcon && (
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                      style={{ left: `${progress}%` }}
                    >
                      <img 
                        src={formData.progressIcon} 
                        alt="Progress icon"
                        className="w-10 h-10 filter drop-shadow-lg animate-float"
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-center text-sm opacity-80">
                  Progreso: {progress.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-600">
              <p className="mb-2">📱 Esta vista se verá en cualquier teléfono</p>
              <p>🔄 El contador se actualiza en tiempo real</p>
            </div>
          </div>
          
          {/* QR Code */}
          {showQR && qrCode && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Código QR Generado</h2>
              
              <div className="flex flex-col items-center space-y-6">
                <img src={qrCode} alt="QR Code" className="border-4 border-white shadow-lg rounded-lg" />
                
                <div className="flex space-x-4">
                  <button
                    onClick={downloadQR}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Descargar QR
                  </button>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/c/preview')
                      toast.success('Enlace copiado!')
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
                  >
                    Copiar Enlace
                  </button>
                </div>
                
                <div className="text-sm text-gray-600 text-center">
                  <p>Escanea este QR con la cámara de tu teléfono</p>
                  <p>O comparte el enlace directamente</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}