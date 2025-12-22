// pages/EditCountdown.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { countdownService } from '../services/countdownService';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import IconRenderer from '../components/IconRenderer';
import { getDefaultIcons } from '../services/iconMapper';
import { 
  FaImage, 
  FaTimes, 
  FaPalette,
  FaUpload, 
  FaLink,
  FaArrowLeft,
  FaSave,
  FaTrash
} from 'react-icons/fa';

const defaultIcons = getDefaultIcons();

const defaultBackgrounds = [
  { name: 'Estrellas', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop' },
  { name: 'Fiesta', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop' },
  { name: 'Naturaleza', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop' },
  { name: 'Navidad', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop' },
  { name: 'Abstracto', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&auto=format&fit=crop' },
  { name: 'Reyes', url: 'https://ccwrxgvddypgbbdmjsaw.supabase.co/storage/v1/object/public/countdown-images/backgrounds/1766347941172_1c9z4xkx0pt.jpg'}
];

export default function EditCountdown() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetDate: '',
    startDate: '',
    backgroundColor: '#4a148c',
    textColor: '#ffffff',
    backgroundImage: '',
    progressIcon: 'FaHourglassHalf',
    useImage: false,
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadCountdown();
  }, [id]);

  // Calcular tiempo restante y progreso
  useEffect(() => {
    if (!formData.targetDate || !formData.startDate) return;
    
    const calculateTime = () => {
      const target = new Date(formData.targetDate);
      const start = new Date(formData.startDate);
      const now = new Date();
      
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
      
      // Calcular progreso
      const totalDuration = target - start;
      const elapsed = now - start;
      const calculatedProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
      setProgress(calculatedProgress);
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [formData.targetDate, formData.startDate]);

  // Limpiar URLs de objeto al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const loadCountdown = async () => {
    try {
      setLoading(true);
      const data = await countdownService.getCountdown(id);
      
      // Convertir fechas al formato correcto
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };
      
      setFormData({
        title: data.title || '',
        message: data.message || '',
        targetDate: formatDateForInput(data.targetDate),
        startDate: formatDateForInput(data.startDate),
        backgroundColor: data.backgroundColor || '#4a148c',
        textColor: data.textColor || '#ffffff',
        backgroundImage: data.backgroundImage || '',
        progressIcon: data.progressIcon || 'FaHourglassHalf',
        useImage: Boolean(data.backgroundImage),
      });
      
      // Si hay imagen, establecer preview
      if (data.backgroundImage && !data.backgroundImage.startsWith('blob:')) {
        setPreviewUrl(data.backgroundImage);
      }
      
    } catch (error) {
      console.error('Error cargando countdown:', error);
      toast.error('No se pudo cargar el countdown');
      navigate('/list');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validaciones
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es muy grande (máximo 5MB)');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no válido. Usa JPG, PNG, WebP o GIF');
      return;
    }
    
    // Crear preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setImageFile(file);
    
    // Actualizar formData
    setFormData(prev => ({
      ...prev,
      backgroundImage: preview,
      useImage: true
    }));
    
    toast.success('Imagen cargada para subir');
  };

  const removeCustomImage = () => {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl('');
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      backgroundImage: '',
      useImage: false
    }));
    
    // Limpiar input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.success('Imagen removida');
  };

  const handleImageSelect = (url) => {
    setFormData(prev => ({
      ...prev,
      backgroundImage: url,
      useImage: true
    }));
    setPreviewUrl('');
    setImageFile(null);
    
    // Limpiar input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Preparar datos para actualizar
      const updateData = {
        ...formData,
        // Asegurarse de que useImage sea booleano
        useImage: Boolean(formData.useImage),
        // Si hay previewUrl local, usarla como backgroundImage temporal
        backgroundImage: previewUrl || formData.backgroundImage
      };
      
      // Llamar al servicio de actualización
      await countdownService.updateCountdown(id, updateData, imageFile);
      toast.success('¡Countdown actualizado exitosamente!');
      
      // Redirigir a la lista
      setTimeout(() => {
        navigate('/list');
      }, 1500);
      
    } catch (error) {
      console.error('Error actualizando:', error);
      toast.error('Error al actualizar el countdown');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este countdown? Esta acción no se puede deshacer.')) return;
    
    try {
      setDeleting(true);
      await countdownService.deleteCountdown(id);
      toast.success('Countdown eliminado exitosamente');
      navigate('/list');
    } catch (error) {
      console.error('Error eliminando:', error);
      toast.error('Error al eliminar el countdown');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('✅ Enlace copiado!');
    } catch (err) {
      console.error('Error usando clipboard:', err);
      toast.error('❌ No se pudo copiar el enlace');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const countdownUrl = `${window.location.origin}/#/c/${id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Editar Countdown</h1>
            <p className="text-gray-600">Modifica los detalles de tu cuenta regresiva</p>
          </div>
          
          <button
            onClick={() => navigate('/list')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
          >
            <FaArrowLeft />
            Volver a la lista
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-700">ID:</p>
            <code className="text-sm text-purple-600">{id}</code>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-700">URL:</p>
            <code className="text-sm text-blue-600 truncate">{countdownUrl}</code>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-700">Estado:</p>
            <span className="text-sm text-green-600">Activo</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="space-y-8">
          {/* Información básica */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información básica</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Ej: Cumpleaños de ..."
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
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
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
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
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
                      name="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={handleChange}
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
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleChange}
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
                        setFormData({...formData, useImage: false, backgroundImage: ''});
                        removeCustomImage();
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
              
              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Guardar cambios
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:from-red-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Eliminar countdown
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Vista Previa y QR */}
        <div className="space-y-8">
          {/* Vista Previa */}
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
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Código QR</h2>
            
            <div className="flex flex-col items-center space-y-6">
              {/* QR Image */}
              <div className="relative">
                <div className="bg-white p-4 rounded-lg border-4 border-white shadow-lg">
                  <QRCode
                    value={countdownUrl}
                    size={200}
                    level="H"
                    includeMargin
                    fgColor="#8B5CF6"
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓
                </div>
              </div>
              
              {/* URL Display */}
              <div className="w-full max-w-md">
                <p className="text-sm text-gray-600 mb-2 font-medium flex items-center gap-2">
                  <FaLink /> Enlace del countdown:
                </p>
                <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <code className="flex-1 text-sm text-blue-600 break-all font-mono">
                    {countdownUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(countdownUrl)}
                    className="ml-2 px-3 py-1.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition font-medium"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `countdown-${formData.title.replace(/\s+/g, '-')}-${Date.now()}.png`;
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      link.href = canvas.toDataURL();
                      link.click();
                      toast.success('QR descargado');
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Descargar QR
                </button>
                
                <button
                  onClick={() => window.open(countdownUrl, '_blank')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Ver Countdown
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}