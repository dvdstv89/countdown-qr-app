/**
 * Detectar si estamos en GitHub Pages
 */
export const isGitHubPages = () => {
  return window.location.hostname.includes('github.io');
};

/**
 * Obtener la URL base completa según el entorno
 */
export const getBaseUrl = () => {
  // GitHub Pages - URL completa
  if (isGitHubPages()) {
    // En GitHub Pages, necesitamos la URL completa
    const repoName = 'countdown-qr-app'; // Tu repositorio
    return `${window.location.origin}/${repoName}`;
  }
  
  // Usar variable de entorno si existe
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  
  // Desarrollo local por defecto
  return window.location.origin;
};

/**
 * Generar URL completa para ver un countdown
 */
export const getCountdownUrl = (idOrPublicUrl) => {
  const baseUrl = getBaseUrl();
  // HashRouter siempre necesita #
  return `${baseUrl}/#/c/${idOrPublicUrl}`;
};

/**
 * Generar URL completa para editar un countdown
 */
export const getEditUrl = (id) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/#/edit/${id}`;
};

/**
 * Generar URL para compartir
 */
export const getShareUrl = (idOrPublicUrl) => {
  return getCountdownUrl(idOrPublicUrl);
};

/**
 * Obtener solo el path (sin el origen) - para enlaces internos con Link
 */
export const getCountdownPath = (idOrPublicUrl) => {
  return `/#/c/${idOrPublicUrl}`;
};

export const getEditPath = (id) => {
  return `/#/edit/${id}`;
};