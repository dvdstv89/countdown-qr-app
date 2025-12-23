/**
 * Utilidades para manejar URLs en la aplicación
 */

export const getBaseUrl = () => {
  // Si estamos en GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    return '/countdown-qr-app';
  }
  
  // Si hay una variable de entorno definida
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  
  // Desarrollo local por defecto
  return window.location.origin;
};

export const getCountdownUrl = (countdownId) => {
  const baseUrl = getBaseUrl();
  // Para HashRouter, siempre añadimos # antes de la ruta
  return `${baseUrl}/#/c/${countdownId}`;
};

export const getEditUrl = (countdownId) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/#/edit/${countdownId}`;
};

export const copyToClipboard = (text) => {
  return navigator.clipboard.writeText(text);
};