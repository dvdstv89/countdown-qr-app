// Configuración temporal - luego agregarás las claves reales
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-clave-aqui'

// Simulación de datos mientras configuras Supabase
export const mockCountdowns = [
  {
    id: '1',
    title: 'Cumpleaños de David',
    targetDate: '2024-12-25T18:00:00',
    message: '¡Falta poco para tu día especial!',
    backgroundColor: '#4a148c',
    textColor: '#ffffff',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3067/3067259.png',
    backgroundImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba'
  }
]

// Funciones simuladas
export const countdownService = {
  async createCountdown(data) {
    console.log('Creando countdown:', data)
    // Simular creación
    return {
      id: Date.now().toString(),
      public_url: `cd_${Date.now().toString(36)}`,
      ...data
    }
  },
  
  async getCountdown(id) {
    // Simular obtención
    return {
      ...mockCountdowns[0],
      id,
      views: Math.floor(Math.random() * 100)
    }
  }
}

// Para usar más tarde con Supabase real
// import { createClient } from '@supabase/supabase-js'
// export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)