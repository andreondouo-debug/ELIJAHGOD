/**
 * Configuration centralisée de l'URL API
 * Si REACT_APP_API_URL pointe vers une URL incorrecte, on force la bonne.
 */
const RAW_URL = process.env.REACT_APP_API_URL || '';

// Correction automatique si l'ancien nom de service Render est utilisé
// ou si la variable est vide / pointe vers localhost en production
export const API_URL = (() => {
  if (!RAW_URL || RAW_URL.includes('elijahgod-backend') || RAW_URL === 'undefined') {
    return 'https://elijahgod.onrender.com';
  }
  return RAW_URL;
})();

export default API_URL;
