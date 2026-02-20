import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * 🔐 PRESTATAIRE CONTEXT
 * Gestion globale de l'authentification prestataire (fournisseur)
 */

export const PrestataireContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export function PrestataireProvider({ children }) {
  const [prestataire, setPrestataire] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('prestataireToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);

  // Charger le profil prestataire au montage si token existe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token) {
      chargerProfil();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Charger le profil du prestataire connecté
  const chargerProfil = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/prestataires/me/profil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrestataire(response.data.prestataire);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Erreur chargement profil prestataire:', error);
      // Si token invalide ou expiré, déconnecter
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const signup = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/api/prestataires/inscription`, formData);

      const { token: newToken, prestataire: newPrestataire } = response.data;
      
      setToken(newToken);
      setPrestataire(newPrestataire);
      setIsAuthenticated(true);
      localStorage.setItem('prestataireToken', newToken);

      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription prestataire:', error);
      throw error;
    }
  };

  // Connexion
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/prestataires/connexion`, {
        email,
        password
      });

      const { token: newToken, prestataire: newPrestataire } = response.data;
      
      setToken(newToken);
      setPrestataire(newPrestataire);
      setIsAuthenticated(true);
      localStorage.setItem('prestataireToken', newToken);

      return response.data;
    } catch (error) {
      console.error('❌ Erreur connexion prestataire:', error);
      throw error;
    }
  };

  // Déconnexion
  const logout = () => {
    setToken(null);
    setPrestataire(null);
    setIsAuthenticated(false);
    localStorage.removeItem('prestataireToken');
  };

  // Mettre à jour le profil
  const mettreAJourProfil = async (data) => {
    try {
      const response = await axios.put(`${API_URL}/api/prestataires/profil`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrestataire(response.data.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  };

  // Upload médias (images / vidéo) sur le profil
  const uploadMedia = async (fichiers) => {
    try {
      const formData = new FormData();
      Array.from(fichiers).forEach(f => formData.append('mediaFiles', f));
      const response = await axios.post(`${API_URL}/api/prestataires/profil/media`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setPrestataire(response.data.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload médias:', error);
      throw error;
    }
  };

  // Rafraîchir le profil
  const refreshProfil = () => {
    return chargerProfil();
  };

  const value = {
    prestataire,
    token,
    isAuthenticated,
    loading,
    signup,
    login,
    logout,
    chargerProfil,
    mettreAJourProfil,
    uploadMedia,
    refreshProfil
  };

  return (
    <PrestataireContext.Provider value={value}>
      {children}
    </PrestataireContext.Provider>
  );
}
