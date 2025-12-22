// components/Navbar.js
import { Link } from 'react-router-dom'
import { FaHourglassHalf, FaPlusCircle, FaHome, FaList } from 'react-icons/fa'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 text-xl font-bold text-purple-700 hover:text-purple-800 transition-colors">
            <FaHourglassHalf className="text-purple-600" />
            <span>Countdown QR</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-gray-700 hover:text-purple-700"
            >
              <FaHome />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            
            <Link 
              to="/list" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-gray-700 hover:text-purple-700"
            >
              <FaList />
              <span className="hidden sm:inline">Mis Countdowns</span>
            </Link>
            
            <Link 
              to="/create" 
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
            >
              <FaPlusCircle />
              <span className="hidden sm:inline">Crear Countdown</span>
              <span className="sm:hidden">Crear</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}