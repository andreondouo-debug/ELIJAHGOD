import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './AuthStatusPage.css';

/**
 * 📊 PAGE STATUT D'AUTHENTIFICATION
 * Page d'exemple montrant comment utiliser le hook useAuth
 * Affiche toutes les informations d'authentification disponibles
 */
const AuthStatusPage = () => {
  const {
    isAuthenticated,
    user,
    userType,
    isAdmin,
    isClient,
    isPrestataire,
    getEmail,
    getFullName,
    getDisplayName,
    getUserId,
    getUserTypeLabel,
    getUserTypeIcon,
    hasStoredToken,
    logout
  } = useAuth();

  return (
    <div className="auth-status-page">
      <div className="auth-status-container">
        <h1>📊 Statut d'Authentification</h1>
        
        {/* CONNEXION STATUS */}
        <div className="status-card">
          <h2>🔐 État de Connexion</h2>
          {isAuthenticated ? (
            <div className="status-connected">
              <span className="status-icon">✅</span>
              <span className="status-text">Connecté</span>
            </div>
          ) : (
            <div className="status-disconnected">
              <span className="status-icon">❌</span>
              <span className="status-text">Non connecté</span>
            </div>
          )}
        </div>

        {/* TYPE D'UTILISATEUR */}
        {isAuthenticated && (
          <>
            <div className="status-card">
              <h2>👤 Type de Profil</h2>
              <div className="user-type-display">
                <span className="user-type-icon">{getUserTypeIcon()}</span>
                <span className="user-type-label">{getUserTypeLabel()}</span>
                <span className="user-type-code">({userType})</span>
              </div>

              <div className="type-flags">
                <div className={`flag ${isAdmin ? 'active' : ''}`}>
                  <span>👑 Admin</span>
                  {isAdmin && <span className="check">✅</span>}
                </div>
                <div className={`flag ${isClient ? 'active' : ''}`}>
                  <span>👤 Client</span>
                  {isClient && <span className="check">✅</span>}
                </div>
                <div className={`flag ${isPrestataire ? 'active' : ''}`}>
                  <span>🎤 Prestataire</span>
                  {isPrestataire && <span className="check">✅</span>}
                </div>
              </div>
            </div>

            {/* INFORMATIONS UTILISATEUR */}
            <div className="status-card">
              <h2>📋 Informations Utilisateur</h2>
              <div className="user-info-grid">
                <div className="info-item">
                  <strong>ID:</strong>
                  <span className="mono">{getUserId()}</span>
                </div>
                <div className="info-item">
                  <strong>Email:</strong>
                  <span>{getEmail()}</span>
                </div>
                <div className="info-item">
                  <strong>Nom complet:</strong>
                  <span>{getFullName()}</span>
                </div>
                <div className="info-item">
                  <strong>Nom d'affichage:</strong>
                  <span>{getDisplayName()}</span>
                </div>
              </div>
            </div>

            {/* DÉTAILS DU PROFIL */}
            <div className="status-card">
              <h2>🔍 Détails du Profil</h2>
              <pre className="profile-json">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </>
        )}

        {/* TOKEN STATUS */}
        <div className="status-card">
          <h2>🔑 Statut du Token</h2>
          <div className="token-status">
            {hasStoredToken() ? (
              <div className="token-found">
                <span className="status-icon">✅</span>
                <span>Token trouvé dans localStorage</span>
              </div>
            ) : (
              <div className="token-not-found">
                <span className="status-icon">❌</span>
                <span>Aucun token dans localStorage</span>
              </div>
            )}
            
            <div className="token-details">
              <p><strong>adminToken:</strong> {localStorage.getItem('adminToken') ? '✅ Présent' : '❌ Absent'}</p>
              <p><strong>clientToken:</strong> {localStorage.getItem('clientToken') ? '✅ Présent' : '❌ Absent'}</p>
              <p><strong>prestataireToken:</strong> {localStorage.getItem('prestataireToken') ? '✅ Présent' : '❌ Absent'}</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="status-card">
          <h2>🛠️ Actions</h2>
          <div className="action-buttons">
            {isAuthenticated ? (
              <>
                <button onClick={logout} className="btn btn-logout">
                  🚪 Se déconnecter
                </button>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="btn btn-dashboard">
                    👑 Dashboard Admin
                  </Link>
                )}
                {isClient && (
                  <Link to="/client/dashboard" className="btn btn-dashboard">
                    👤 Dashboard Client
                  </Link>
                )}
                {isPrestataire && (
                  <Link to="/prestataire/dashboard" className="btn btn-dashboard">
                    🎤 Dashboard Prestataire
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/connexion" className="btn btn-login">
                  🔐 Se connecter
                </Link>
                <Link to="/inscription" className="btn btn-signup">
                  📝 S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>

        {/* CODE EXEMPLE */}
        <div className="status-card">
          <h2>💻 Exemple de Code</h2>
          <p>Voici comment utiliser le hook <code>useAuth</code> dans vos composants:</p>
          <pre className="code-example">
{`import useAuth from '../hooks/useAuth';

function MonComposant() {
  const { 
    isAuthenticated, 
    userType, 
    isAdmin,
    getDisplayName 
  } = useAuth();

  if (!isAuthenticated) {
    return <p>Non connecté</p>;
  }

  return (
    <div>
      <h1>Bonjour {getDisplayName()}!</h1>
      <p>Type: {userType}</p>
      {isAdmin && <p>Vous êtes admin!</p>}
    </div>
  );
}`}
          </pre>
        </div>

        {/* NAVIGATION */}
        <div className="status-card">
          <h2>🔗 Navigation Utile</h2>
          <div className="nav-links">
            <Link to="/">🏠 Accueil</Link>
            {isAdmin && (
              <>
                <Link to="/admin/dashboard">👑 Dashboard Admin</Link>
                <Link to="/admin/utilisateurs">👥 Utilisateurs</Link>
                <Link to="/admin/prestations-avancees">🎛️ Prestations</Link>
              </>
            )}
            {isClient && (
              <>
                <Link to="/client/dashboard">👤 Mon Espace</Link>
                <Link to="/devis">📋 Nouveau Devis</Link>
                <Link to="/mes-devis">📝 Mes Devis</Link>
              </>
            )}
            {isPrestataire && (
              <>
                <Link to="/prestataire/dashboard">🎤 Mon Espace</Link>
                <Link to="/prestataire/demandes">📨 Demandes</Link>
                <Link to="/prestataire/profil">⚙️ Profil</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthStatusPage;
