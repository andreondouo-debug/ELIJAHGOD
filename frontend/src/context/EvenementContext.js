import { createContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

/**
 * 📅 EVENEMENT CONTEXT
 * Gestion globale des événements / agenda
 * Accessible par Admin et Prestataire
 */

export const EvenementContext = createContext();

export function EvenementProvider({ children }) {
  const [evenements, setEvenements] = useState([]);
  const [evenementActif, setEvenementActif] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer le token actif (admin ou prestataire)
  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('prestataireToken');
  };

  const headers = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  // ==============================
  // CRUD ÉVÉNEMENTS
  // ==============================

  const chargerEvenements = useCallback(async (filtres = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtres).toString();
      const res = await axios.get(`${API_URL}/api/evenements?${params}`, headers());
      setEvenements(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur chargement');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const chargerEvenement = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/evenements/${id}`, headers());
      setEvenementActif(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const creerEvenement = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/api/evenements`, data, headers());
      setEvenements(prev => [...prev, res.data.data]);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur création' };
    }
  };

  const majEvenement = async (id, data) => {
    try {
      const res = await axios.put(`${API_URL}/api/evenements/${id}`, data, headers());
      setEvenements(prev => prev.map(e => e._id === id ? res.data.data : e));
      if (evenementActif?._id === id) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur mise à jour' };
    }
  };

  const supprimerEvenement = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/evenements/${id}`, headers());
      setEvenements(prev => prev.filter(e => e._id !== id));
      if (evenementActif?._id === id) setEvenementActif(null);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur suppression' };
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      const res = await axios.patch(`${API_URL}/api/evenements/${id}/statut`, { statut }, headers());
      setEvenements(prev => prev.map(e => e._id === id ? res.data.data : e));
      if (evenementActif?._id === id) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  // ==============================
  // PROGRAMME (Étapes)
  // ==============================

  const ajouterEtape = async (evenementId, etape) => {
    try {
      const res = await axios.post(`${API_URL}/api/evenements/${evenementId}/programme`, etape, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const majEtape = async (evenementId, etapeId, data) => {
    try {
      const res = await axios.put(`${API_URL}/api/evenements/${evenementId}/programme/${etapeId}`, data, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const supprimerEtape = async (evenementId, etapeId) => {
    try {
      const res = await axios.delete(`${API_URL}/api/evenements/${evenementId}/programme/${etapeId}`, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  // ==============================
  // TODOS
  // ==============================

  const ajouterTodo = async (evenementId, todo) => {
    try {
      const res = await axios.post(`${API_URL}/api/evenements/${evenementId}/todos`, todo, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const majTodo = async (evenementId, todoId, data) => {
    try {
      const res = await axios.put(`${API_URL}/api/evenements/${evenementId}/todos/${todoId}`, data, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const supprimerTodo = async (evenementId, todoId) => {
    try {
      const res = await axios.delete(`${API_URL}/api/evenements/${evenementId}/todos/${todoId}`, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  // ==============================
  // BOÎTE À OUTILS
  // ==============================

  const ajouterOutil = async (evenementId, outil) => {
    try {
      const res = await axios.post(`${API_URL}/api/evenements/${evenementId}/outils`, outil, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const majOutil = async (evenementId, outilId, data) => {
    try {
      const res = await axios.put(`${API_URL}/api/evenements/${evenementId}/outils/${outilId}`, data, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const supprimerOutil = async (evenementId, outilId) => {
    try {
      const res = await axios.delete(`${API_URL}/api/evenements/${evenementId}/outils/${outilId}`, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  // ==============================
  // PRESTATIONS LIÉES
  // ==============================

  const lierPrestation = async (evenementId, data) => {
    try {
      const res = await axios.post(`${API_URL}/api/evenements/${evenementId}/prestations`, data, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const delierPrestation = async (evenementId, prestationId) => {
    try {
      const res = await axios.delete(`${API_URL}/api/evenements/${evenementId}/prestations/${prestationId}`, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  // ==============================
  // COLLABORATEURS
  // ==============================

  const rechercherPrestataires = async (query) => {
    try {
      const res = await axios.get(`${API_URL}/api/evenements/prestataires/recherche?q=${encodeURIComponent(query)}`, headers());
      return res.data.data;
    } catch (err) {
      return [];
    }
  };

  const ajouterCollaborateur = async (evenementId, prestataireId, role) => {
    try {
      const res = await axios.post(`${API_URL}/api/evenements/${evenementId}/collaborateurs`, { prestataireId, role }, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const majCollaborateur = async (evenementId, prestataireId, role) => {
    try {
      const res = await axios.put(`${API_URL}/api/evenements/${evenementId}/collaborateurs/${prestataireId}`, { role }, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const supprimerCollaborateur = async (evenementId, prestataireId) => {
    try {
      const res = await axios.delete(`${API_URL}/api/evenements/${evenementId}/collaborateurs/${prestataireId}`, headers());
      if (evenementActif?._id === evenementId) setEvenementActif(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur' };
    }
  };

  const value = useMemo(() => ({
    evenements, evenementActif, loading, error,
    chargerEvenements, chargerEvenement, creerEvenement,
    majEvenement, supprimerEvenement, changerStatut,
    ajouterEtape, majEtape, supprimerEtape,
    ajouterTodo, majTodo, supprimerTodo,
    ajouterOutil, majOutil, supprimerOutil,
    lierPrestation, delierPrestation,
    rechercherPrestataires, ajouterCollaborateur, majCollaborateur, supprimerCollaborateur,
    setEvenementActif
  }), [evenements, evenementActif, loading, error, chargerEvenements, chargerEvenement]);

  return (
    <EvenementContext.Provider value={value}>
      {children}
    </EvenementContext.Provider>
  );
}
