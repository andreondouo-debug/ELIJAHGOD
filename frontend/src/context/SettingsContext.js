import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * ⚙️ SETTINGS CONTEXT
 * Charge et stocke les paramètres du site depuis l'API
 * Utilisé partout dans l'application
 */

export const SettingsContext = createContext();

import { API_URL } from '../config';

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/settings`);
      setSettings(response.data.data);
      setError(null);
      
      // Appliquer les couleurs au thème CSS
      if (response.data.data.site) {
        document.documentElement.style.setProperty(
          '--color-primary',
          response.data.data.site.couleurPrincipale
        );
        document.documentElement.style.setProperty(
          '--color-secondary',
          response.data.data.site.couleurSecondaire
        );
        document.documentElement.style.setProperty(
          '--color-accent',
          response.data.data.site.couleurAccent
        );
      }
    } catch (err) {
      console.error('❌ Erreur chargement paramètres:', err);
      setError(err.message);
      // Définir des valeurs par défaut
      setSettings({
        entreprise: {
          nom: "ELIJAH'GOD",
          slogan: "Prestations événementielles"
        },
        contact: {
          email: "contact@elijahgod.com",
          telephone: "+33 X XX XX XX XX"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    loadSettings();
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.put(`${API_URL}/api/settings`, newSettings);
      setSettings(response.data.data);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour paramètres:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
