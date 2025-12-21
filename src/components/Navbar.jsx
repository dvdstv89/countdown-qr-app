import { Link } from 'react-router-dom'
import { FaHourglassHalf, FaPlusCircle, FaHome } from 'react-icons/fa'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 text-2xl font-bold text-purple-700">
            <FaHourglassHalf className="text-purple-600" />
            <span>Countdown QR</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <FaHome />
              <span>Inicio</span>
            </Link>
            
            <Link 
              to="/create" 
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <FaPlusCircle />
              <span>Crear Countdown</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}