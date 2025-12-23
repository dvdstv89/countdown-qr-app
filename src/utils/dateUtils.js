export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    console.log('🔄 formatDateForInput - Entrada:', dateString);
    
    // Si ya es fecha de PostgreSQL (YYYY-MM-DD HH:MM:SS)
    if (dateString.includes(' ') && dateString.length >= 19) {
      // Extraer partes
      const [datePart, timePart] = dateString.split(' ');
      const [hours, minutes] = timePart.split(':');
      
      // Crear objeto Date en hora local
      const date = new Date(datePart + 'T' + timePart);
      
      // Ajustar por timezone para input
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() - timezoneOffset);
      
      const result = adjustedDate.toISOString().slice(0, 16);
      console.log('✅ formatDateForInput - Salida:', result);
      return result;
    }
    
    // Si es formato ISO (YYYY-MM-DDTHH:MM:SS.sssZ)
    const date = new Date(dateString);
    
    // Ajustar por el timezone offset
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timezoneOffset);
    
    // Formato YYYY-MM-DDTHH:MM para datetime-local
    const result = adjustedDate.toISOString().slice(0, 16);
    console.log('✅ formatDateForInput - Salida:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error en formatDateForInput:', error);
    return '';
  }
};

export const formatDateForDB = (dateString) => {
  if (!dateString) {
    console.log('⚠️ formatDateForDB - Fecha vacía');
    return new Date().toISOString();
  }
  
  console.log('🔄 formatDateForDB - Entrada:', dateString);
  
  try {
    // Si es datetime-local (YYYY-MM-DDTHH:MM)
    if (dateString.includes('T') && dateString.length === 16) {
      // Convertir: "2024-12-25T06:00" → "2024-12-25 06:00:00"
      const formatted = dateString.replace('T', ' ') + ':00';
      console.log('✅ formatDateForDB - Salida PostgreSQL:', formatted);
      return formatted;
    }
    
    // Si ya es formato PostgreSQL (YYYY-MM-DD HH:MM:SS)
    if (dateString.includes(' ') && dateString.length >= 19) {
      console.log('✅ formatDateForDB - Ya es PostgreSQL');
      return dateString;
    }
    
    // Si es solo fecha (YYYY-MM-DD)
    if (dateString.length === 10 && dateString.includes('-')) {
      const formatted = dateString + ' 00:00:00';
      console.log('✅ formatDateForDB - Solo fecha:', formatted);
      return formatted;
    }
    
    console.warn('⚠️ formatDateForDB - Formato no reconocido:', dateString);
    
    // Fallback: fecha actual
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:00`;
    console.log('⚠️ formatDateForDB - Fallback:', formatted);
    return formatted;
    
  } catch (error) {
    console.error('❌ Error en formatDateForDB:', error);
    
    // Fallback absoluto
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day} 00:00:00`;
  }
};

export const getLocalDateString = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      timeZone: 'UTC',
      hour12: false
    });
  } catch (error) {
    return dateString;
  }
};

export const getCurrentDateTimeForInput = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(now.getTime() - timezoneOffset);
  return adjustedDate.toISOString().slice(0, 16);
};