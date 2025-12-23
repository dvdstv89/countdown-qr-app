export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Ajustar para el huso horario local
  const timezoneOffset = date.getTimezoneOffset() * 60000; // en milisegundos
  const localDate = new Date(date.getTime() - timezoneOffset);
  
  return localDate.toISOString().slice(0, 16);
};

export const formatDateForDB = (dateString) => {
  if (!dateString) return new Date().toISOString();
  
  // datetime-local no incluye info de timezone, asumimos hora local
  const date = new Date(dateString);
  
  // Convertir a ISO string para la base de datos
  return date.toISOString();
};

export const getLocalDateString = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    timeZone: 'UTC',
    hour12: false
  });
};