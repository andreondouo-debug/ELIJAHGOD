import React, { useContext } from 'react';
import { Crown, User, Mic2 } from 'lucide-react';
import AdminContext from '../context/AdminContext';
import { ClientContext } from '../context/ClientContext';
import { PrestataireContext } from '../context/PrestataireContext';

/**
 * 🔐 Hook personnalisé pour gérer l'authentification
 * Unifie les 3 contexts (Admin, Client, Prestataire) en une seule interface
 * 
 * @returns {Object} État d'authentification unifié
 * 
 * @example
 * const { isAuthenticated, userType, user, isAdmin } = useAuth();
 * 
 * if (!isAuthenticated) {
 *   return <Navigate to="/connexion" />;
 * }
 * 
 * if (isAdmin) {
 *   return <AdminDashboard />;
 * }
 */
export const useAuth = () => {
  // Récupérer les 3 contexts
  const { 
    admin, 
    token: adminToken, 
    loading: adminLoading,
    logout: logoutAdmin,
    loadAdminProfile 
  } = useContext(AdminContext);

  const { 
    client, 
    token: clientToken, 
    loading: clientLoading,
    logout: logoutClient,
    chargerProfil: chargerProfilClient 
  } = useContext(ClientContext);

  const { 
    prestataire, 
    token: prestataireToken, 
    loading: prestataireLoading,
    logout: logoutPrestataire,
    chargerProfil: chargerProfilPrestataire 
  } = useContext(PrestataireContext);

  // ============================================
  // DÉTERMINER QUI EST CONNECTÉ
  // ============================================

  const user = admin || client || prestataire;
  const token = adminToken || clientToken || prestataireToken;
  const isAuthenticated = !!user;
  const loading = adminLoading || clientLoading || prestataireLoading;

  // Déterminer le type d'utilisateur
  let userType = null;
  if (admin) userType = 'admin';
  else if (client) userType = 'client';
  else if (prestataire) userType = 'prestataire';

  // ============================================
  // FLAGS DE TYPE (pour conditions simples)
  // ============================================

  const isAdmin = !!admin;
  const isClient = !!client;
  const isPrestataire = !!prestataire;

  // ============================================
  // FONCTIONS UNIFIÉES
  // ============================================

  /**
   * Déconnexion unifiée - déconnecte l'utilisateur actif
   */
  const logout = () => {
    if (admin) {
      console.log('🚪 Déconnexion admin...');
      logoutAdmin();
    } else if (client) {
      console.log('🚪 Déconnexion client...');
      logoutClient();
    } else if (prestataire) {
      console.log('🚪 Déconnexion prestataire...');
      logoutPrestataire();
    }
  };

  /**
   * Rafraîchir le profil de l'utilisateur connecté
   */
  const refreshProfile = async () => {
    try {
      if (admin) {
        console.log('🔄 Rafraîchissement profil admin...');
        await loadAdminProfile();
      } else if (client) {
        console.log('🔄 Rafraîchissement profil client...');
        await chargerProfilClient();
      } else if (prestataire) {
        console.log('🔄 Rafraîchissement profil prestataire...');
        await chargerProfilPrestataire();
      }
    } catch (error) {
      console.error('❌ Erreur rafraîchissement profil:', error);
    }
  };

  /**
   * Obtenir l'email de l'utilisateur connecté
   */
  const getEmail = () => {
    if (admin) return admin.email;
    if (client) return client.email;
    if (prestataire) return prestataire.email;
    return null;
  };

  /**
   * Obtenir le nom complet de l'utilisateur
   */
  const getFullName = () => {
    if (admin) return admin.nom || admin.prenom || 'Admin';
    if (client) return `${client.prenom} ${client.nom}`;
    if (prestataire) return `${prestataire.prenom} ${prestataire.nom}`;
    return 'Utilisateur';
  };

  /**
   * Obtenir le nom d'affichage principal
   */
  const getDisplayName = () => {
    if (admin) return admin.nom || admin.prenom || admin.email;
    if (client) return client.prenom || client.email;
    if (prestataire) return prestataire.nomEntreprise || prestataire.prenom;
    return 'Utilisateur';
  };

  /**
   * Obtenir l'ID de l'utilisateur
   */
  const getUserId = () => {
    if (admin) return admin._id || admin.id;
    if (client) return client._id || client.id;
    if (prestataire) return prestataire._id || prestataire.id;
    return null;
  };

  /**
   * Vérifier si le token est présent dans localStorage
   */
  const hasStoredToken = () => {
    return !!(
      localStorage.getItem('adminToken') ||
      localStorage.getItem('clientToken') ||
      localStorage.getItem('prestataireToken')
    );
  };

  /**
   * Obtenir le nom du type d'utilisateur (en français)
   */
  const getUserTypeLabel = () => {
    if (isAdmin) return 'Administrateur';
    if (isClient) return 'Client';
    if (isPrestataire) return 'Prestataire';
    return 'Invité';
  };

  /**
   * Obtenir l'icône emoji du type d'utilisateur
   */
  const getUserTypeIcon = () => {
    // Retourne un composant SVG lucide-react selon le type d'utilisateur
    if (isAdmin) return <Crown size={16} style={{ verticalAlign: 'middle', marginRight: 5, color: '#d4af37' }} />;
    if (isClient) return <User size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />;
    if (isPrestataire) return <Mic2 size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />;
    return <User size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />;
  };

  // ============================================
  // RETOUR DE L'OBJET UNIFIÉ
  // ============================================

  return {
    // États de base
    user,                   // Objet utilisateur (admin/client/prestataire)
    token,                  // Token JWT
    isAuthenticated,        // Boolean: quelqu'un est connecté?
    loading,                // Boolean: chargement en cours?
    userType,               // String: 'admin' | 'client' | 'prestataire' | null

    // Flags de type (pour conditions)
    isAdmin,                // Boolean: est un admin?
    isClient,               // Boolean: est un client?
    isPrestataire,          // Boolean: est un prestataire?

    // Objets utilisateurs bruts (pour accès direct si besoin)
    admin,
    client,
    prestataire,

    // Fonctions unifiées
    logout,                 // Déconnexion
    refreshProfile,         // Rafraîchir le profil

    // Helpers d'affichage
    getEmail,               // () => string
    getFullName,            // () => string
    getDisplayName,         // () => string
    getUserId,              // () => string
    getUserTypeLabel,       // () => string (en français)
    getUserTypeIcon,        // () => string (emoji)

    // Helpers de vérification
    hasStoredToken,         // () => boolean
  };
};

export default useAuth;
