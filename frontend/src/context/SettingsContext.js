import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

/**
 * ⚙️ SETTINGS CONTEXT
 * Charge et stocke les paramètres du site depuis l'API
 * Utilisé partout dans l'application
 */

export const SettingsContext = createContext();

const CACHE_KEY = 'elijahgod_settings_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const applyColors = (data) => {
  if (data?.site) {
    document.documentElement.style.setProperty('--color-primary', data.site.couleurPrincipale);
    document.documentElement.style.setProperty('--color-secondary', data.site.couleurSecondaire);
    document.documentElement.style.setProperty('--color-accent', data.site.couleurAccent);
  }
};

const getCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null; // expiré
    return data;
  } catch { return null; }
};

const setCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

export const SettingsProvider = ({ children }) => {
  // Initialiser depuis le cache immédiatement pour éviter les flash/attentes
  const cached = getCache();
  const [settings, setSettings] = useState(cached || null);
  const [loading, setLoading] = useState(!cached); // pas de spinner si cache dispo
  const [error, setError] = useState(null);

  // Appliquer les couleurs du cache immédiatement
  if (cached) applyColors(cached);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    try {
      // Si pas de cache, afficher le spinner
      if (!getCache()) setLoading(true);
      const response = await axios.get(`${API_URL}/api/settings`);
      const data = response.data.data;
      setSettings(data);
      setCache(data);
      setError(null);
      applyColors(data);
    } catch (err) {
      console.error('❌ Erreur chargement paramètres:', err);
      setError(err.message);
      // Garder le cache si disponible, sinon valeurs par défaut
      if (!settings) {
        setSettings({
          entreprise: { nom: "ELIJAH'GOD", slogan: "Prestations événementielles" },
          contact: { email: "contact@elijahgod.com", telephone: "+33 X XX XX XX XX" }
        });
      }
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
      const data = response.data.data;
      setSettings(data);
      setCache(data);
      applyColors(data);
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
