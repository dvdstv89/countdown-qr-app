import { Link } from 'react-router-dom'
import { FaQrcode, FaCalendarAlt, FaImage, FaShareAlt } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Crea Countdowns Personalizados
          <span className="block text-purple-600">con Códigos QR</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10">
          Genera cuenta regresivas únicas para cumpleaños, eventos especiales, Navidad... 
          ¡Todo con un QR que puedes imprimir o compartir!
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-purple-600 mb-4">
              <FaQrcode className="text-5xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold mb-3">QR Generado Automáticamente</h3>
            <p className="text-gray-600">Cada countdown tiene su propio código QR único para compartir fácilmente.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-purple-600 mb-4">
              <FaImage className="text-5xl mx-auto" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Personalización Completa</h3>
            <p className="text-gray-600">Elige colores, imágenes de fondo y iconos animados para la barra de progreso.</p>
          </div>
        </div>
        
        <Link
          to="/create"
          className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 transition-all duration-300 shadow-xl"
        >
          Comenzar a Crear →
        </Link>
        
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-4xl font-bold text-purple-600 mb-2">1</div>
              <h4 className="font-bold mb-2">Configura tu evento</h4>
              <p className="text-gray-600">Elige fecha, mensaje, colores e icono.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-4xl font-bold text-purple-600 mb-2">2</div>
              <h4 className="font-bold mb-2">Genera el QR</h4>
              <p className="text-gray-600">Obtén automáticamente un código QR único.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="text-4xl font-bold text-purple-600 mb-2">3</div>
              <h4 className="font-bold mb-2">Comparte</h4>
              <p className="text-gray-600">Envía el QR o enlace a quien quieras.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}