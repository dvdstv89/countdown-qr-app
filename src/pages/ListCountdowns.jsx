// pages/ListCountdowns.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaQrcode, FaCopy, FaCalendarAlt, FaClock, FaExternalLinkAlt, FaImage, FaPalette } from 'react-icons/fa';
import { countdownService } from '../services/countdownService';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import IconRenderer from '../components/IconRenderer';

export default function ListCountdowns() {
  const [countdowns, setCountdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadCountdowns();
  }, []);

  const loadCountdowns = async () => {
    try {
      setLoading(true);
      const data = await countdownService.getAllCountdowns();
      setCountdowns(data);
    } catch (error) {
      console.error('Error cargando countdowns:', error);
      toast.error('Error al cargar la lista');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este countdown? Esta acción no se puede deshacer.')) return;
    
    try {
      setDeletingId(id);
      await countdownService.deleteCountdown(id);
      setCountdowns(countdowns.filter(c => c.id !== id));
      toast.success('Countdown eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el countdown');
    } finally {
      setDeletingId(null);
    }
  };

  const copyLink = (countdown) => {
    const link = `${import.meta.env.VITE_APP_URL || window.location.origin}/#/c/${selectedQR.public_url || selectedQR.id}`;
    navigator.clipboard.writeText(link);
    toast.success('¡Enlace copiado al portapapeles!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openInNewTab = (countdown) => {
    const link = `${import.meta.env.VITE_APP_URL || window.location.origin}/#/c/${selectedQR.public_url || selectedQR.id}`;
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus countdowns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mis Countdowns</h1>
          <p className="text-gray-600 mb-6">Gestiona y edita todos tus countdowns creados</p>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-purple-600">{countdowns.length}</span> countdowns creados
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all border border-gray-200 shadow-sm flex items-center gap-2"
              >
                <FaCalendarAlt />
                Inicio
              </Link>
              
              <Link
                to="/create"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md flex items-center gap-2"
              >
                <span>+</span>
                Crear Nuevo
              </Link>
            </div>
          </div>
        </div>

        {/* Grid de countdowns */}
        {countdowns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No hay countdowns creados</h3>
            <p className="text-gray-500 mb-6">Crea tu primer countdown para empezar</p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
            >
              Crear mi primer countdown
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countdowns.map((countdown) => (
              <div
                key={countdown.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Preview del countdown */}
                <div 
                  className="h-48 relative overflow-hidden"
                  style={{
                    background: countdown.useImage && countdown.backgroundImage
                      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${countdown.backgroundImage})`
                      : countdown.backgroundColor,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                        {countdown.title}
                      </h3>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {countdown.message || 'Sin mensaje'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {countdown.useImage ? <FaImage /> : <FaPalette />}
                    </span>
                    {countdown.views > 0 && (
                      <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        👁️ {countdown.views}
                      </span>
                    )}
                  </div>
                </div>

                {/* Información */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2 text-purple-500 flex-shrink-0" />
                      <span className="text-sm truncate" title={formatDate(countdown.targetDate)}>
                        {formatDate(countdown.targetDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">
                        ID: 
                        <code className="ml-1 bg-gray-100 px-2 py-1 rounded text-xs">
                          {countdown.public_url?.substring(0, 8) || 'local'}
                        </code>
                      </div>
                      <div className="text-gray-500">
                        Icono:
                        <span className="ml-2 inline-block">
                          <IconRenderer 
                            iconKey={countdown.progressIcon}
                            color="#8B5CF6"
                            size="1em"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openInNewTab(countdown)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      title="Ver en nueva pestaña"
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      Ver
                    </button>
                    
                    <Link
                      to={`/edit/${countdown.id}`}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      <FaEdit className="mr-2" />
                      Editar
                    </Link>

                    <button
                      onClick={() => setSelectedQR(countdown)}
                      className="flex items-center justify-center px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                      title="Ver QR"
                    >
                      <FaQrcode />
                    </button>

                    <button
                      onClick={() => copyLink(countdown)}
                      className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                      title="Copiar enlace"
                    >
                      <FaCopy />
                    </button>

                    <button
                      onClick={() => handleDelete(countdown.id)}
                      disabled={deletingId === countdown.id}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === countdown.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {countdowns.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              💡 Consejo: Puedes editar cualquier countdown para actualizar sus datos o imagen de fondo
            </p>
          </div>
        )}
      </div>

      {/* Modal para QR */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Código QR</h3>
              <p className="text-gray-600">
                Escanea para ver "{selectedQR.title}"
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 flex items-center justify-center">
              <div className="bg-gray-50 p-4 rounded-lg">
              <QRCodeSVG             
                value={`${import.meta.env.VITE_APP_URL || window.location.origin}/#/c/${selectedQR.public_url || selectedQR.id}`}
                size={200}
                level="H"
                bgColor="#FFFFFF"
                fgColor="#8B5CF6"
                />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center bg-gray-50 px-4 py-2 rounded-lg mb-3">
                <code className="text-sm text-blue-600 break-all font-mono">
                  {selectedQR.public_url || selectedQR.id}
                </code>
              </div>
              <p className="text-xs text-gray-500">
                URL pública del countdown
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => copyLink(selectedQR)}
                className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                <FaCopy />
                Copiar enlace
              </button>
              
              <button
                onClick={() => {
                  const link = `${import.meta.env.VITE_APP_URL || window.location.origin}/#/c/${selectedQR.public_url || selectedQR.id}`;
                  window.open(link, '_blank');
                }}
                className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center justify-center gap-2"
              >
                <FaExternalLinkAlt />
                Abrir countdown
              </button>
              
              <button
                onClick={() => setSelectedQR(null)}
                className="py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}