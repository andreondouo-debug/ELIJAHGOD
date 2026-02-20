import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Music2, Sliders, Settings2,
  BarChart3, MessageSquare, ShieldCheck, ArrowRight, ArrowLeft
} from 'lucide-react';
import './AdminDashboard.css';

/**
 * 🛡️ ADMIN DASHBOARD - Tableau de bord administrateur
 */
function AdminDashboard() {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: 'Gestion utilisateurs',
      description: 'Gérer les clients et prestataires',
      path: '/admin/utilisateurs',
      color: '#2ecc71',
      icon: Users
    },
    {
      title: 'Gestion devis',
      description: 'Voir et traiter les demandes',
      path: '/admin/devis',
      color: '#3498db',
      icon: FileText
    },
    {
      title: 'Gestion prestations',
      description: 'Modifier les services proposés',
      path: '/admin/prestations',
      color: '#9b59b6',
      icon: Music2
    },
    {
      title: 'Prestations avancées',
      description: 'Associer prestataires, tarifs, galeries',
      path: '/admin/prestations-avancees',
      color: '#667eea',
      icon: Sliders
    },
    {
      title: 'Paramètres',
      description: 'Configuration du site',
      path: '/admin/parametres',
      color: '#e67e22',
      icon: Settings2
    },
    {
      title: 'Statistiques',
      description: 'Analytics et rapports',
      path: '/admin/stats',
      color: '#f39c12',
      icon: BarChart3
    },
    {
      title: 'Témoignages',
      description: 'Modérer les avis clients',
      path: '/admin/temoignages',
      color: '#1abc9c',
      icon: MessageSquare
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* En-tête */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">
              <ShieldCheck size={32} style={{ verticalAlign: 'middle', marginRight: 10, color: '#d4af37' }} />
              Administration
            </h1>
            <p className="page-subtitle">Bienvenue dans votre espace d'administration</p>
          </div>
        </div>

        {/* Cartes de navigation */}
        <div className="dashboard-grid">
          {adminCards.map((card, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => navigate(card.path)}
              style={{
                cursor: 'pointer',
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                borderTop: `5px solid ${card.color}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
            >
              {/* Icône moderne */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '1rem',
                background: `${card.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <card.icon size={26} color={card.color} />
              </div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                color: '#1a1a2e',
                marginBottom: '0.75rem',
                fontWeight: '800'
              }}>
                {card.title}
              </h3>
              <p style={{ 
                color: '#666',
                marginBottom: '1.5rem',
                fontSize: '1rem'
              }}>
                {card.description}
              </p>
              <button
                className="btn btn-primary"
                style={{
                  background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                Accéder <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Action rapide */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={18} /> Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

