import { useContext, useEffect } from 'react';
import { ClientContext } from '../context/ClientContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

/**
 * 📊 DASHBOARD CLIENT
 */
function ClientDashboard() {
  const { client, isAuthenticated, loading, logout } = useContext(ClientContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/client/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div className="dashboard-loading">⏳ Chargement...</div>;
  }

  if (!client) {
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
          <h1>Tableau de bord Client</h1>
          <button onClick={handleLogout} className="btn-secondary">
            Déconnexion
          </button>
        </div>

        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Bienvenue, {client.prenom} {client.nom} !</h2>
            <p>👤 {client.email}</p>
            {client.entreprise && <p>🏢 {client.entreprise}</p>}
            {client.telephone && <p>📞 {client.telephone}</p>}
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>📝 Mes Devis</h3>
              <p>Consultez et gérez vos demandes de devis</p>
              <button className="btn-primary" onClick={() => navigate('/devis')}>
                Voir mes devis
              </button>
            </div>

            <div className="dashboard-card">
              <h3>🛠️ Services</h3>
              <p>Découvrez nos prestations</p>
              <button className="btn-primary" onClick={() => navigate('/prestations')}>
                Explorer
              </button>
            </div>

            <div className="dashboard-card">
              <h3>👥 Prestataires</h3>
              <p>Trouvez des fournisseurs qualifiés</p>
              <button className="btn-primary" onClick={() => navigate('/prestataires')}>
                Parcourir
              </button>
            </div>

            <div className="dashboard-card">
              <h3>⚙️ Mon Profil</h3>
              <p>Gérez vos informations personnelles</p>
              <button className="btn-primary" onClick={() => navigate('/client/profil')}>
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
