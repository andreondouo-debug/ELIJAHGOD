import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * 🛡️ Composant de protection de routes
 * Redirige vers /connexion si l'utilisateur n'est pas authentifié
 * Peut aussi vérifier un type d'utilisateur spécifique
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu à afficher si autorisé
 * @param {boolean} props.requireAdmin - Nécessite un compte admin
 * @param {boolean} props.requireClient - Nécessite un compte client
 * @param {boolean} props.requirePrestataire - Nécessite un compte prestataire
 * @param {string} props.redirectTo - URL de redirection si non autorisé (défaut: '/connexion')
 * 
 * @example
 * // Route accessible uniquement aux admins
 * <ProtectedRoute requireAdmin>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Route accessible aux clients uniquement
 * <ProtectedRoute requireClient>
 *   <ClientDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Route accessible à n'importe quel utilisateur connecté
 * <ProtectedRoute>
 *   <ProfilPage />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireClient = false, 
  requirePrestataire = false,
  redirectTo = '/connexion' 
}) => {
  const { 
    isAuthenticated, 
    isAdmin, 
    isClient, 
    isPrestataire,
    loading,
    userType 
  } = useAuth();

  // ============================================
  // CHARGEMENT
  // ============================================
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>
          <div style={{ marginBottom: '10px', fontSize: '40px' }}>⏳</div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // CAS 1: Type spécifique requis (Admin)
  // ============================================
  if (requireAdmin) {
    if (!isAdmin) {
      console.warn(`🚫 Accès refusé: route nécessite Admin, mais utilisateur est ${userType || 'non connecté'}`);
      return <Navigate to={redirectTo} replace />;
    }
    console.log('✅ Accès autorisé: Admin');
    return children;
  }

  // ============================================
  // CAS 2: Type spécifique requis (Client)
  // ============================================
  if (requireClient) {
    if (!isClient) {
      console.warn(`🚫 Accès refusé: route nécessite Client, mais utilisateur est ${userType || 'non connecté'}`);
      return <Navigate to={redirectTo} replace />;
    }
    console.log('✅ Accès autorisé: Client');
    return children;
  }

  // ============================================
  // CAS 3: Type spécifique requis (Prestataire)
  // ============================================
  if (requirePrestataire) {
    if (!isPrestataire) {
      console.warn(`🚫 Accès refusé: route nécessite Prestataire, mais utilisateur est ${userType || 'non connecté'}`);
      return <Navigate to={redirectTo} replace />;
    }
    console.log('✅ Accès autorisé: Prestataire');
    return children;
  }

  // ============================================
  // CAS 4: N'importe quel utilisateur connecté
  // ============================================
  if (!isAuthenticated) {
    console.warn('🚫 Accès refusé: utilisateur non connecté');
    return <Navigate to={redirectTo} replace />;
  }

  console.log(`✅ Accès autorisé: ${userType}`);
  return children;
};

export default ProtectedRoute;
