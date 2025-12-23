import { supabase } from '../lib/supabase'
import { imageUploadService } from './imageUploadService'

export const countdownService = {
  async getAllCountdowns() {
    try {
      console.log('📋 Obteniendo todos los countdowns...')
      
      const { data, error } = await supabase
        .from('countdowns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error al obtener countdowns:', error)
        throw error
      }

      console.log(`✅ ${data?.length || 0} countdowns encontrados`)
      
      return data.map(item => ({
        id: item.id,
        public_url: item.public_url,
        title: item.title,
        targetDate: item.target_date,
        startDate: item.custom_data?.start_date || item.created_at,
        message: item.message,
        backgroundColor: item.background_color || '#4a148c',
        textColor: item.text_color || '#ffffff',
        progressIcon: item.progress_icon || 'FaHourglassHalf',
        backgroundImage: item.background_image,
        useImage: Boolean(item.background_image),
        views: item.views || 0,
        created_at: item.created_at,
        custom_data: item.custom_data || {}
      }))
      
    } catch (error) {
      console.error('💥 Error en getAllCountdowns:', error)
      
      try {
        const localCountdowns = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key.startsWith('countdown_')) {
            const data = JSON.parse(localStorage.getItem(key))
            localCountdowns.push({
              ...data,
              id: key.replace('countdown_', '')
            })
          }
        }
        return localCountdowns
      } catch (localError) {
        console.error('Error cargando localmente:', localError)
        throw error
      }
    }
  },

  async createCountdown(data, imageFile = null) {
    try {
      console.log('📝 Creando countdown...')
      
      let backgroundImageUrl = null
      
      if (imageFile && data.useImage) {
        const uploadResult = await imageUploadService.uploadBackgroundImage(imageFile)
        if (uploadResult.success) {
          backgroundImageUrl = uploadResult.url
        } else {
          console.warn('⚠️ No se pudo subir imagen, usando URL directa')
          backgroundImageUrl = data.backgroundImage
        }
      } else if (data.useImage && data.backgroundImage && !data.backgroundImage.startsWith('data:')) {
        backgroundImageUrl = data.backgroundImage
      }
      
      const tempPublicUrl = `cd_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
      
      const insertData = {
        title: data.title,
        target_date: this.formatDateForDB(data.targetDate),
        message: data.message || null,
        background_color: data.backgroundColor || '#4a148c',
        text_color: data.textColor || '#ffffff',
        background_image: backgroundImageUrl,
        progress_icon: data.progressIcon || 'FaHourglassHalf',       
        public_url: tempPublicUrl,
        views: 0,
        custom_data: {
          start_date: this.formatDateForDB(data.startDate),
          use_image: Boolean(data.useImage),
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

      // Incrementar vistas - LLAMADA AL MÉTODO
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

  // NUEVO MÉTODO: incrementViews
  async incrementViews(countdownId, currentViews = 0) {
    try {
      console.log('🔢 Incrementando vistas para ID:', countdownId)
      
      const newViews = (currentViews || 0) + 1
      
      const { error } = await supabase
        .from('countdowns')
        .update({ 
          views: newViews,          
        })
        .eq('id', countdownId)

      if (error) {
        console.error('❌ Error incrementando vistas:', error)
        return false
      }

      console.log(`✅ Vistas incrementadas a ${newViews} para ID: ${countdownId}`)
      return true
      
    } catch (error) {
      console.error('💥 Error en incrementViews:', error)
      return false
    }
  },

  async updateCountdown(id, data, imageFile = null) {
    try {
      console.log('✏️ Actualizando countdown:', id)
      
      let backgroundImageUrl = data.backgroundImage
      
      if (imageFile && data.useImage) {
        const uploadResult = await imageUploadService.uploadBackgroundImage(imageFile)
        if (uploadResult.success) {
          backgroundImageUrl = uploadResult.url
        }
      }
      
      const updateData = {
        title: data.title,
        target_date: this.formatDateForDB(data.targetDate),
        message: data.message || null,
        background_color: data.backgroundColor || '#4a148c',
        text_color: data.textColor || '#ffffff',
        background_image: backgroundImageUrl,
        progress_icon: data.progressIcon || 'FaHourglassHalf',
        updated_at: new Date().toISOString(),
        custom_data: {
          ...data.custom_data,
          start_date: this.formatDateForDB(data.startDate),
          use_image: Boolean(data.useImage)
        }
      }
      
      console.log('📤 Actualizando en BD:', updateData)

      const { data: updatedData, error } = await supabase
        .from('countdowns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw new Error(`Error al actualizar countdown: ${error.message}`)
      }

      localStorage.setItem(`countdown_${id}`, JSON.stringify({
        ...data,
        backgroundImage: backgroundImageUrl
      }))

      console.log('✅ Countdown actualizado:', updatedData)

      return {
        id: updatedData.id,
        public_url: updatedData.public_url,
        title: updatedData.title,
        targetDate: updatedData.target_date,
        startDate: updatedData.custom_data?.start_date || data.startDate,
        message: updatedData.message,
        backgroundColor: updatedData.background_color,
        textColor: updatedData.text_color,
        progressIcon: updatedData.progress_icon || 'FaHourglassHalf',
        backgroundImage: updatedData.background_image,
        useImage: Boolean(updatedData.background_image),
        views: updatedData.views || 0,
        created_at: updatedData.created_at
      }
      
    } catch (error) {
      console.error('💥 Error en updateCountdown:', error)
      
      try {
        localStorage.setItem(`countdown_${id}`, JSON.stringify(data))
        return data
      } catch (localError) {
        throw error
      }
    }
  },

  async deleteCountdown(id) {
    try {
      console.log('🗑️ Eliminando countdown:', id)
      
      const { error } = await supabase
        .from('countdowns')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw new Error(`Error al eliminar countdown: ${error.message}`)
      }

      localStorage.removeItem(`countdown_${id}`)
      
      console.log('✅ Countdown eliminado')
      return true
      
    } catch (error) {
      console.error('💥 Error en deleteCountdown:', error)
      
      try {
        localStorage.removeItem(`countdown_${id}`)
        return true
      } catch (localError) {
        throw error
      }
    }
  },

  formatDateForDB(dateString) {
    if (!dateString) return new Date().toISOString();
    
    if (dateString.includes('T') && dateString.endsWith('Z')) {
      return dateString;
    }
    
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() - timezoneOffset);
      return adjustedDate.toISOString();
    }
    
    const date = new Date(dateString + 'T00:00:00.000Z');
    return date.toISOString();
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