import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

import { API_URL } from '../config';

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  // Charger le profil admin au démarrage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token) {
      loadAdminProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Charger le profil de l'admin connecté
  const loadAdminProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmin(response.data.admin);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement profil admin:', error);
      // Token invalide ou expiré
      logout();
      setLoading(false);
    }
  };

  // Connexion admin
  const login = async (email, motDePasse) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/auth/login`, {
        email,
        motDePasse
      });

      const { token: newToken, admin: adminData } = response.data;

      // Sauvegarder le token
      localStorage.setItem('adminToken', newToken);
      setToken(newToken);
      setAdmin(adminData);

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('❌ Erreur connexion admin:', error);
      const message = error.response?.data?.message || 'Erreur de connexion';
      return { success: false, message };
    }
  };

  // Déconnexion admin
  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
  };

  // Mettre à jour le profil admin
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/auth/profile`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAdmin(response.data.admin);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      const message = error.response?.data?.message || 'Erreur de mise à jour';
      return { success: false, message };
    }
  };

  // Créer un nouvel admin (super admin seulement)
  const createAdmin = async (adminData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/auth/create`,
        adminData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return { success: true, message: response.data.message, admin: response.data.admin };
    } catch (error) {
      console.error('❌ Erreur création admin:', error);
      const message = error.response?.data?.message || 'Erreur de création';
      return { success: false, message };
    }
  };

  // Lister tous les admins (super admin seulement)
  const listAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/auth/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return { success: true, admins: response.data.admins };
    } catch (error) {
      console.error('❌ Erreur liste admins:', error);
      const message = error.response?.data?.message || 'Erreur de récupération';
      return { success: false, message };
    }
  };

  // Activer/désactiver un admin (super admin seulement)
  const toggleAdminStatus = async (adminId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/admin/auth/${adminId}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('❌ Erreur toggle admin:', error);
      const message = error.response?.data?.message || 'Erreur de modification';
      return { success: false, message };
    }
  };

  const value = {
    admin,
    token,
    loading,
    isAuthenticated: !!admin,
    isSuperAdmin: admin?.role === 'super_admin',
    login,
    logout,
    updateProfile,
    refreshProfile: loadAdminProfile,
    createAdmin,
    listAdmins,
    toggleAdminStatus
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
