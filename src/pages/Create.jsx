import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'
import IconRenderer from '../components/IconRenderer';
import { getDefaultIcons } from '../services/iconMapper';
import { 
  FaImage, 
  FaTimes, 
  FaPalette,  // ← ¡AÑADE ESTA LÍNEA!
  FaUpload, 
  FaLink 
} from 'react-icons/fa';
import { countdownService } from '../services/countdownService';

const defaultIcons = getDefaultIcons();

const defaultBackgrounds = [
  { name: 'Estrellas', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop' },
  { name: 'Fiesta', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop' },
  { name: 'Naturaleza', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop' },
  { name: 'Navidad', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop' },
  { name: 'Abstracto', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&auto=format&fit=crop' },
  { name: 'Reyes', url: 'https://ccwrxgvddypgbbdmjsaw.supabase.co/storage/v1/object/public/countdown-images/backgrounds/1766347941172_1c9z4xkx0pt.jpg'}
]

export default function Create() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [lastCreatedUrl, setLastCreatedUrl] = useState('')
  
  const [formData, setFormData] = useState({
    title: 'Cumpleaños',
    targetDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    startDate: new Date().toISOString().slice(0, 10),
    message: '¡Falta poco para tu día especial!',
    backgroundColor: '#4a148c',
    textColor: '#ffffff',
    backgroundImage: '',
    progressIcon: 'https://cdn-icons-png.flaticon.com/512/3195/3195411.png',
    useImage: false,
  })
  
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [progress, setProgress] = useState(0)
  
  // Calcular tiempo restante y progreso
  useEffect(() => {
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
    
    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [formData.targetDate, formData.startDate])
  
  // Limpiar URLs de objeto al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      console.log('🚀 Creando countdown...')
      
      // Crear countdown en Supabase
      const countdownData = await countdownService.createCountdown(formData, imageFile)
      
      // URL generada
      const countdownUrl = `${window.location.origin}/c/${countdownData.public_url}`
      setLastCreatedUrl(countdownUrl)
      
      // Guardar referencia
      localStorage.setItem('last_countdown_url', countdownUrl)
      localStorage.setItem('last_countdown_id', countdownData.public_url)
      
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
      
      toast.success('✅ Countdown creado exitosamente!')
      
      // Limpiar imagen temporal
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl('')
        setImageFile(null)
      }
      
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error(`Error: ${error.message}`)
      
      // Fallback local
      const fallbackId = `local_${Date.now().toString(36)}`
      const fallbackUrl = `${window.location.origin}/c/${fallbackId}`
      setLastCreatedUrl(fallbackUrl)
      
      const qrDataUrl = await QRCode.toDataURL(fallbackUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCode(qrDataUrl)
      setShowQR(true)
      
      // Guardar localmente
      localStorage.setItem(`countdown_${fallbackId}`, JSON.stringify({
        id: fallbackId,
        public_url: fallbackId,
        ...formData,
        backgroundImage: previewUrl || formData.backgroundImage,
        url: fallbackUrl,
        created: new Date().toISOString()
      }))
      
      toast.success('Countdown guardado localmente')
    } finally {
      setLoading(false)
    }
  }
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validaciones
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es muy grande (máximo 5MB)')
      return
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no válido. Usa JPG, PNG, WebP o GIF')
      return
    }
    
    // Crear preview
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
    setImageFile(file)
    
    // Actualizar formData
    setFormData(prev => ({
      ...prev,
      backgroundImage: preview,
      useImage: true
    }))
    
    toast.success('Imagen cargada para subir')
  }
  
  const removeCustomImage = () => {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    
    setPreviewUrl('')
    setImageFile(null)
    setFormData(prev => ({
      ...prev,
      backgroundImage: '',
      useImage: false
    }))
    
    // Limpiar input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    toast.success('Imagen removida')
  }
  
  const handleImageSelect = (url) => {
    setFormData(prev => ({
      ...prev,
      backgroundImage: url,
      useImage: true
    }))
    setPreviewUrl('')
    setImageFile(null)
    
    // Limpiar input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const downloadQR = () => {
    if (!qrCode) {
      toast.error('Primero genera un QR')
      return
    }
    
    const link = document.createElement('a')
    link.download = `countdown-${formData.title.replace(/\s+/g, '-')}-${Date.now()}.png`
    link.href = qrCode
    link.click()
    toast.success('QR descargado')
  }
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('✅ Enlace copiado!')
      return true
    } catch (err) {
      console.error('Error usando clipboard:', err)
      
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        toast.success('✅ Enlace copiado!')
        return true
      } catch (fallbackErr) {
        console.error('Fallback también falló:', fallbackErr)
        toast.error('❌ No se pudo copiar el enlace')
        return false
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }
  
  const handleCopyLink = () => {
    if (!lastCreatedUrl) {
      toast.error('Primero crea un countdown')
      return
    }
    
    copyToClipboard(lastCreatedUrl)
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Crear Countdown</h1>
        <p className="text-gray-600">Personaliza cada detalle de tu cuenta regresiva</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Evento *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Ej: Cumpleaños de David"
                required
              />
            </div>
            
            {/* Fechas */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Evento *
                </label>
                <input
                  type="datetime-local"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Para calcular el progreso</p>
              </div>
            </div>
            
            {/* Mensaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje Personalizado
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                placeholder="¡Falta poco para tu día especial!"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.message.length}/200 caracteres
              </p>
            </div>
            
            {/* Colores */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Fondo
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300 hover:border-purple-400 transition"
                  />
                  <div>
                    <span className="text-sm text-gray-600 font-mono">
                      {formData.backgroundColor}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Click para cambiar</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Texto
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300 hover:border-purple-400 transition"
                  />
                  <div>
                    <span className="text-sm text-gray-600 font-mono">
                      {formData.textColor}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Click para cambiar</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Iconos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Icono de Progreso
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {defaultIcons.map((icon) => (
                  <button
                    key={icon.key}
                    type="button"
                    onClick={() => setFormData({...formData, progressIcon: icon.key })}
                    className={`p-3 rounded-lg border-2 transition-all transform hover:scale-105 ${
                      formData.progressIcon === icon.key
                        ? 'border-purple-500 bg-purple-50 scale-105 ring-1 ring-purple-300'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 mx-auto flex items-center justify-center text-xl">
                      <IconRenderer 
                        iconKey={icon.key}
                        color="#4a148c"
                        size="1.5em"
                      />
                    </div>
                    <span className="text-xs mt-1 block text-gray-700">{icon.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Fondo */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Imagen de Fondo
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, useImage: false, backgroundImage: ''})
                      removeCustomImage()
                    }}
                    className={`px-3 py-1 rounded text-sm transition ${!formData.useImage ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FaPalette className="inline mr-1" /> Solo color
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, useImage: true})}
                    className={`px-3 py-1 rounded text-sm transition ${formData.useImage ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FaImage className="inline mr-1" /> Con imagen
                  </button>
                </div>
              </div>
              
              {formData.useImage ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {defaultBackgrounds.map((bg) => (
                      <button
                        key={bg.url}
                        type="button"
                        onClick={() => handleImageSelect(bg.url)}
                        className={`rounded-lg overflow-hidden border-2 transition-all transform hover:scale-[1.02] ${
                          formData.backgroundImage === bg.url
                            ? 'border-purple-500 ring-2 ring-purple-300 scale-[1.02]'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <img 
                          src={bg.url} 
                          alt={bg.name} 
                          className="w-full h-24 object-cover"
                          loading="lazy"
                        />
                        <div className="p-2 text-xs text-center bg-white text-gray-700">{bg.name}</div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      O sube tu propia imagen:
                    </label>
                    <div className="flex items-center space-x-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors text-center group">
                          <FaUpload className="inline mr-2 text-gray-400 group-hover:text-purple-500 text-lg mb-1" />
                          <span className="text-gray-600 group-hover:text-purple-600">Haz clic para subir imagen</span>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP (max 5MB)</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      
                      {imageFile && (
                        <button
                          type="button"
                          onClick={removeCustomImage}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar imagen personalizada"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Preview de imagen personalizada */}
                  {previewUrl && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Vista previa (se subirá a la nube):</p>
                      <div className="h-32 rounded overflow-hidden border relative">
                        <img 
                          src={previewUrl} 
                          alt="Preview personalizada" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {imageFile?.name}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        📏 Tamaño: {(imageFile?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  
                  {/* Preview de imagen seleccionada */}
                  {formData.backgroundImage && !previewUrl && formData.backgroundImage !== '' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Imagen seleccionada:</p>
                      <div className="h-32 rounded overflow-hidden border">
                        <img 
                          src={formData.backgroundImage} 
                          alt="Preview seleccionada" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        🖼️ Imagen predeterminada
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">
                    🎨 Usando solo color de fondo. Para agregar una imagen, selecciona "Con imagen".
                  </p>
                </div>
              )}
            </div>
            
            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Guardando en la nube...
                </span>
              ) : (
                '🎯 Generar Countdown y QR'
              )}
            </button>
          </form>
        </div>
        
        {/* Vista Previa */}
        <div className="space-y-8">
          {/* Preview Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vista Previa</h2>
            
            <div 
              className="rounded-xl overflow-hidden shadow-lg mb-6 min-h-[400px] flex flex-col justify-center relative"
              style={{
                background: formData.useImage && formData.backgroundImage
                  ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${formData.backgroundImage}) center/cover`
                  : formData.backgroundColor
              }}
            >
              
              <div className="p-8 flex-1 flex flex-col justify-center relative z-10" style={{ color: formData.textColor }}>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4 drop-shadow-lg">{formData.title}</h3>
                  <p className="text-xl opacity-90 drop-shadow">{formData.message}</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <div 
                      key={unit} 
                      className="text-center bg-black/40 backdrop-blur-sm rounded-lg p-4 min-w-[80px] border border-white/20"
                    >
                      <div className="text-3xl font-bold">{value.toString().padStart(2, '0')}</div>
                      <div className="text-sm uppercase opacity-90 mt-1">{unit}</div>
                    </div>
                  ))}
                </div>
                
                {/* Barra de Progreso con Icono */}
                <div className="relative mb-4 px-4">
                  <div className="h-4 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/60 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                 {formData.progressIcon && (
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                      style={{ left: `${progress}%` }}
                    >
                      <div className="w-10 h-10 filter drop-shadow-lg">
                        <IconRenderer 
                          iconKey={formData.progressIcon}
                          color={formData.textColor}
                          size="2.5em"
                          animate={true}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center text-sm opacity-90">
                  Progreso: <span className="font-bold text-lg">{progress.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-600 space-y-2">
              <p className="flex items-center justify-center gap-2">
                <span className="text-lg">📱</span> Esta vista se verá en cualquier teléfono
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="text-lg">🔄</span> El contador se actualiza en tiempo real
              </p>
              {!formData.useImage ? (
                <p className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <span className="text-lg">🎨</span> Usando solo color de fondo
                </p>
              ) : (
                <p className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <span className="text-lg">🖼️</span> {previewUrl ? 'Con imagen personalizada' : 'Con imagen predeterminada'}
                </p>
              )}
            </div>
          </div>
          
          {/* QR Code */}
          {showQR && qrCode && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Código QR Generado</h2>
              
              <div className="flex flex-col items-center space-y-6">
                {/* QR Image */}
                <div className="relative">
                  <img 
                    src={qrCode} 
                    alt="QR Code" 
                    className="border-4 border-white shadow-lg rounded-lg w-64 h-64"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓
                  </div>
                </div>
                
                {/* URL Display */}
                {lastCreatedUrl && (
                  <div className="w-full max-w-md">
                    <p className="text-sm text-gray-600 mb-2 font-medium flex items-center gap-2">
                      <FaLink /> Enlace generado:
                    </p>
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <code className="flex-1 text-sm text-blue-600 break-all font-mono">
                        {lastCreatedUrl}
                      </code>
                      <button
                        onClick={() => copyToClipboard(lastCreatedUrl)}
                        className="ml-2 px-3 py-1.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition font-medium"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={downloadQR}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Descargar QR
                  </button>
                  
                  <button
                    onClick={handleCopyLink}
                    disabled={!lastCreatedUrl}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Copiar Enlace
                  </button>
                </div>
                
                {/* Info */}
                <div className="text-center text-gray-600 space-y-3 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="flex items-center justify-center gap-2">
                      <span className="text-lg">📱</span> Escanea este QR con la cámara de tu teléfono
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <span className="text-lg">🔗</span> O comparte el enlace directamente
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-green-700 font-medium flex items-center justify-center gap-2">
                      <span className="text-lg">✅</span> Datos guardados en la nube
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Tu countdown está disponible en cualquier dispositivo
                    </p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex justify-center gap-4 pt-2">
                    <button
                      onClick={() => navigate(`/c/${lastCreatedUrl.split('/').pop()}`)}
                      className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
                    >
                      Ver Countdown
                    </button>
                    <button
                      onClick={() => {
                        if (lastCreatedUrl) {
                          window.open(lastCreatedUrl, '_blank')
                        }
                      }}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      Abrir en Nueva Pestaña
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🌐 Acceso Universal</h3>
            <p className="text-sm text-gray-600">Tu countdown está disponible en cualquier dispositivo con internet</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">📊 Estadísticas</h3>
            <p className="text-sm text-gray-600">Podrás ver cuántas personas han visto tu countdown</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🔄 Actualización en Tiempo Real</h3>
            <p className="text-sm text-gray-600">Los visitantes ven el contador actualizado al segundo</p>
          </div>
        </div>
      </div>
    </div>
  )
}