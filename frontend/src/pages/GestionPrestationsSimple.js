import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 🎵 GESTION PRESTATIONS SIMPLE - Page admin
 */
function GestionPrestationsSimple() {
  const navigate = useNavigate();

  return (
    <div className="admin-page" style={{ padding: '180px 20px 60px', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a2e' }}>
            Gestion des prestations
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
            Gérer les services proposés sur le site
          </p>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', 
            padding: '2rem', 
            borderRadius: '1rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#9b59b6' }}>💡 Version disponible</h3>
            <p style={{ color: '#555', marginBottom: '1rem' }}>
              Pour une gestion avancée des prestations avec association de prestataires, 
              tarifs par nombre d'invités, et galeries photos :
            </p>
            <button
              onClick={() => navigate('/admin/prestations-avancees')}
              className="btn"
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '700',
                marginTop: '1rem'
              }}
            >
              🎛️ Accéder aux Prestations Avancées
            </button>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', 
            padding: '2rem', 
            borderRadius: '1rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#f39c12' }}>📖 Documentation</h3>
            <p style={{ color: '#555', marginBottom: '1rem' }}>
              Pour ajouter ou modifier des prestations, consultez le guide complet :
            </p>
            <p style={{ fontFamily: 'monospace', background: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
              📄 GUIDE_AJOUT_PRESTATIONS.md
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn btn-secondary"
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
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

export default GestionPrestationsSimple;
