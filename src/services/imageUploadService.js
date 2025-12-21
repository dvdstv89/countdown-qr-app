// src/services/imageUploadService.js
import { supabase } from '../lib/supabase'

export const imageUploadService = {
  async uploadBackgroundImage(file) {
    try {
      // Validar archivo
      if (!file) throw new Error('No se seleccionó archivo')
      if (file.size > 5 * 1024 * 1024) throw new Error('La imagen debe ser menor a 5MB')
      
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `backgrounds/${fileName}`
      
      console.log('📤 Subiendo imagen:', fileName)
      
      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('countdown-images') // Nombre del bucket
        .upload(filePath, file)
      
      if (error) throw error
      
      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('countdown-images')
        .getPublicUrl(filePath)
      
      console.log('✅ Imagen subida:', publicUrl)
      
      return {
        success: true,
        url: publicUrl,
        fileName: fileName,
        path: filePath
      }
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  async deleteImage(path) {
    try {
      const { error } = await supabase.storage
        .from('countdown-images')
        .remove([path])
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      return { success: false, error: error.message }
    }
  }
}