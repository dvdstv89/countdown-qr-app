export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Ajustar por el timezone offset
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timezoneOffset);
    
    // Formato YYYY-MM-DDTHH:MM para datetime-local
    return adjustedDate.toISOString().slice(0, 16);
    
  } catch (error) {
    console.error('Error formateando fecha para input:', error);
    return '';
  }
};

export const formatDateForDB = (dateString) => {
  if (!dateString) return new Date().toISOString();
  
  // Si ya es ISO, devolverlo
  if (dateString.includes('T') && dateString.endsWith('Z')) {
    return dateString;
  }
  
  // Si es datetime-local (YYYY-MM-DDTHH:MM)
  if (dateString.includes('T')) {
    // Añadir segundos y mantener como hora local
    return dateString + ':00';
  }
  
  // Si es solo fecha
  return dateString + 'T00:00:00';
};

export const getLocalDateString = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    timeZone: 'UTC',
    hour12: false
  });
};

export const getCurrentDateTimeForInput = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(now.getTime() - timezoneOffset);
  return adjustedDate.toISOString().slice(0, 16);
};