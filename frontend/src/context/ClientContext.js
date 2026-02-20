import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * 🔐 CLIENT CONTEXT
 * Gestion globale de l'authentification client
 */

export const ClientContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export function ClientProvider({ children }) {
  const [client, setClient] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('clientToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);

  // Charger le profil client au montage si token existe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token) {
      chargerProfil();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Charger le profil du client connecté
  const chargerProfil = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clients/profil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClient(response.data.client);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
      // Si token invalide ou expiré, déconnecter
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const signup = async (prenom, nom, email, password, telephone, adresse, entreprise) => {
    try {
      const response = await axios.post(`${API_URL}/api/clients/inscription`, {
        prenom,
        nom,
        email,
        password,
        telephone,
        adresse,
        entreprise
      });

      const { token: newToken, client: newClient } = response.data;
      
      setToken(newToken);
      setClient(newClient);
      setIsAuthenticated(true);
      localStorage.setItem('clientToken', newToken);

      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  };

  // Connexion
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/clients/connexion`, {
        email,
        password
      });

      const { token: newToken, client: newClient } = response.data;
      
      setToken(newToken);
      setClient(newClient);
      setIsAuthenticated(true);
      localStorage.setItem('clientToken', newToken);

      return response.data;
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      throw error;
    }
  };

  // Déconnexion
  const logout = () => {
    setToken(null);
    setClient(null);
    setIsAuthenticated(false);
    localStorage.removeItem('clientToken');
  };

  // Rafraîchir le profil
  const refreshClient = async () => {
    if (token) {
      await chargerProfil();
    }
  };

  // Mettre à jour le profil
  const updateProfil = async (updates) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/clients/profil`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClient(response.data.client);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  };

  // Changer le mot de passe
  const changePassword = async (ancienPassword, nouveauPassword) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/clients/changer-mot-de-passe`,
        { ancienPassword, nouveauPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Erreur changement mot de passe:', error);
      throw error;
    }
  };

  // Demander reset password
  const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/clients/demander-reset-password`, {
        email
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur demande reset:', error);
      throw error;
    }
  };

  // Reset password avec token
  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/clients/reset-password/${token}`, {
        password
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur reset password:', error);
      throw error;
    }
  };

  const value = {
    client,
    token,
    isAuthenticated,
    loading,
    signup,
    login,
    logout,
    chargerProfil,
    refreshClient,
    updateProfil,
    changePassword,
    requestPasswordReset,
    resetPassword,
    API_URL
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}
