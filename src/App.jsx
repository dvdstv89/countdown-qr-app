import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Create from './pages/Create'
import ViewCountdown from './pages/ViewCountdown'
import ListCountdowns from './pages/ListCountdowns'  // Nuevo
import EditCountdown from './pages/EditCountdown'    // Nuevo
import Navbar from './components/Navbar'

function App() {
  const location = useLocation()
  
  // Determinar si mostrar el Navbar basado en la ruta
  const showNavbar = !location.pathname.startsWith('/c/')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/c/:id" element={<ViewCountdown />} />
          <Route path="/list" element={<ListCountdowns />} />      {/* Nueva ruta */}
          <Route path="/edit/:id" element={<EditCountdown />} />   {/* Nueva ruta */}
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}

export default App