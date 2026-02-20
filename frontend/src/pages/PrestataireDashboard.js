import { useContext, useEffect } from 'react';
import { PrestataireContext } from '../context/PrestataireContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

/**
 * 📊 DASHBOARD PRESTATAIRE (FOURNISSEUR)
 */
function PrestataireDashboard() {
  const { prestataire, isAuthenticated, loading, logout } = useContext(PrestataireContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/prestataire/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div className="dashboard-loading">⏳ Chargement...</div>;
  }

  if (!prestataire) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Tableau de bord Prestataire</h1>
          <button onClick={handleLogout} className="btn-secondary">
            Déconnexion
          </button>
        </div>

        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Bienvenue, {prestataire.nomEntreprise || prestataire.prenom} !</h2>
            <p>👤 {prestataire.email}</p>
            {prestataire.telephone && <p>📞 {prestataire.telephone}</p>}
            {prestataire.specialites && (
              <div>
                <strong>Spécialités:</strong>
                <p>🎯 {Array.isArray(prestataire.specialites) 
                  ? prestataire.specialites.join(', ') 
                  : prestataire.specialites}
                </p>
              </div>
            )}
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>📋 Mes Missions</h3>
              <p>Consultez vos projets en cours</p>
              <button className="btn-primary" onClick={() => navigate('/prestataire/missions')}>
                Voir les missions
              </button>
            </div>

            <div className="dashboard-card">
              <h3>📊 Statistiques</h3>
              <p>Suivez vos performances</p>
              <button className="btn-primary" onClick={() => navigate('/prestataire/stats')}>
                Voir les stats
              </button>
            </div>

            <div className="dashboard-card">
              <h3>⭐ Avis</h3>
              <p>Gérez vos évaluations clients</p>
              <button className="btn-primary" onClick={() => navigate('/prestataire/avis')}>
                Consulter
              </button>
            </div>

            <div className="dashboard-card">
              <h3>⚙️ Mon Profil</h3>
              <p>Mettez à jour votre profil public</p>
              <button className="btn-primary" onClick={() => navigate('/prestataire/profil')}>
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrestataireDashboard;
