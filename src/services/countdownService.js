// src/services/countdownService.js (versión optimizada)
import { supabase } from '../lib/supabase'
import { imageUploadService } from './imageUploadService'

export const countdownService = {
  async createCountdown(data, imageFile = null) {
    try {
      console.log('📝 Creando countdown...')
      
      let backgroundImageUrl = null
      
      // Subir imagen si existe
      if (imageFile && data.useImage) {
        const uploadResult = await imageUploadService.uploadBackgroundImage(imageFile)
        if (uploadResult.success) {
          backgroundImageUrl = uploadResult.url
        } else {
          console.warn('⚠️ No se pudo subir imagen, usando URL directa')
          backgroundImageUrl = data.backgroundImage
        }
      } else if (data.useImage && data.backgroundImage && !data.backgroundImage.startsWith('data:')) {
        // Si es una URL de internet (no data URL)
        backgroundImageUrl = data.backgroundImage
      }
      
      // Generar URL pública
     const tempPublicUrl = `cd_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      
      // Preparar datos SIN DUPLICACIÓN
      const insertData = {
        title: data.title,
        target_date: this.formatDateForDB(data.targetDate),
        message: data.message || null,
        background_color: data.backgroundColor || '#4a148c',
        text_color: data.textColor || '#ffffff',
        background_image: backgroundImageUrl,
        progress_icon: data.progressIcon || 'FaBirthdayCake',       
        public_url: tempPublicUrl,
        // Solo guardar en custom_data lo que NO tiene columna propia
        custom_data: {
          start_date: this.formatDateForDB(data.startDate),
          use_image: Boolean(data.useImage),
          // No repetir datos que ya están en columnas separadas
        }
      }
      
      console.log('📤 Insertando en BD:', insertData)

      const { data: countdownData, error } = await supabase
        .from('countdowns')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw new Error(`Error al crear countdown: ${error.message}`)
      }

      console.log('✅ Countdown creado:', countdownData)

      return {
        id: countdownData.id,
        public_url: countdownData.public_url,
        title: countdownData.title,
        targetDate: countdownData.target_date,
        startDate: countdownData.custom_data?.start_date || data.startDate,
        message: countdownData.message,
        backgroundColor: countdownData.background_color,
        textColor: countdownData.text_color,
        progressIcon: countdownData.progress_icon || 'FaHourglassHalf',
        backgroundImage: countdownData.background_image,
        useImage: Boolean(countdownData.background_image),
        views: countdownData.views || 0,
        created_at: countdownData.created_at
      }
    } catch (error) {
      console.error('💥 Error en createCountdown:', error)
      throw error
    }
  },

  async getCountdown(id) {
    try {
      console.log('🔍 Buscando countdown:', id)
      
      let query = supabase
        .from('countdowns')
        .select('*')

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      
      if (isUUID) {
        query = query.eq('id', id)
      } else {
        query = query.eq('public_url', id)
      }

      const { data: countdownData, error } = await query.single()

      if (error) throw error

      // Incrementar vistas
      await this.incrementViews(countdownData.id, countdownData.views)
      
      return {
        id: countdownData.id,
        public_url: countdownData.public_url,
        title: countdownData.title,
        targetDate: countdownData.target_date,
        startDate: countdownData.custom_data?.start_date || countdownData.created_at,
        message: countdownData.message,
        backgroundColor: countdownData.background_color || '#4a148c',
        textColor: countdownData.text_color || '#ffffff',
        progressIcon: countdownData.progress_icon || 'FaHourglassHalf',
        backgroundImage: countdownData.background_image,
        useImage: Boolean(countdownData.background_image),
        views: (countdownData.views || 0) + 1,
        created_at: countdownData.created_at,
        custom_data: countdownData.custom_data || {}
      }
    } catch (error) {
      console.error('💥 Error en getCountdown:', error)
      throw error
    }
  },

  formatDateForDB(dateString) {
    if (!dateString) return new Date().toISOString()
    
    // Si ya tiene formato ISO, devolverlo
    if (dateString.includes('T') && dateString.endsWith('Z')) {
      return dateString
    }
    
    // Si es datetime-local (YYYY-MM-DDTHH:MM)
    if (dateString.includes('T')) {
      return new Date(dateString).toISOString()
    }
    
    // Si es solo fecha (YYYY-MM-DD)
    return new Date(dateString + 'T00:00:00.000Z').toISOString()
  },

  async incrementViews(countdownId, currentViews = 0) {
    try {
      await supabase
        .from('countdowns')
        .update({ 
          views: currentViews + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', countdownId)
    } catch (error) {
      console.error('⚠️ Error al incrementar vistas:', error)
    }
  },

  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('countdowns')
        .select('count(*)')
      
      if (error) throw error
      
      return { 
        success: true, 
        count: data[0]?.count || 0
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message
      }
    }
  }
}