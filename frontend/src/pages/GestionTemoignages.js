import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 💬 GESTION TÉMOIGNAGES - Page admin
 */
function GestionTemoignages() {
  const navigate = useNavigate();

  return (
    <div className="admin-page" style={{ padding: '180px 20px 60px', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a2e' }}>
            Gestion des témoignages
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
            Cette fonctionnalité est en cours de développement
          </p>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)', 
            padding: '2rem', 
            borderRadius: '1rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1abc9c' }}>🚀 Prochainement disponible</h3>
            <ul style={{ textAlign: 'left', color: '#555', lineHeight: '2' }}>
              <li>✅ Modération des avis clients</li>
              <li>✅ Approuver/Rejeter des témoignages</li>
              <li>✅ Afficher sur la page d'accueil</li>
              <li>✅ Filtres par note et date</li>
              <li>✅ Répondre aux témoignages</li>
              <li>✅ Statistiques des avis</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn btn-primary"
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            ← Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default GestionTemoignages;
