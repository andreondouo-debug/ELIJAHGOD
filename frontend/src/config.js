/**
 * Configuration centralisée de l'URL API
 */
const RAW_URL = process.env.REACT_APP_API_URL || '';

export const API_URL = (() => {
  // Si la variable d'env est absente ou pointe vers localhost en prod, utiliser l'URL Render
  if (!RAW_URL || RAW_URL === 'undefined' || RAW_URL.includes('localhost')) {
    return 'https://elijahgod-backend.onrender.com';
  }
  return RAW_URL;
})();

export default API_URL;
