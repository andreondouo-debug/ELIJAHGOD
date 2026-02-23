import { useContext, useEffect, useState } from 'react';
import { ClientContext } from '../context/ClientContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './ClientDashboard.css';

/* ── Helpers ── */
const getInitials = (c) => {
  if (!c) return 'C';
  return [c.prenom, c.nom]
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || 'C';
};

/* ── Composant ── */
function ClientDashboard() {
  const { client, isAuthenticated, loading, logout, token } = useContext(ClientContext);
  const navigate = useNavigate();
  const [devisStats, setDevisStats] = useState({ total: 0, enAttente: 0, acceptes: 0 });

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    axios.get(`${API_URL}/api/devis/client/mes-devis`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const liste = r.data.devis || [];
        setDevisStats({
          total:      liste.length,
          enAttente:  liste.filter(d => ['brouillon','soumis','en_etude'].includes(d.statut)).length,
          acceptes:   liste.filter(d => d.statut === 'accepte').length,
        });
      })
      .catch(() => {});
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/client/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || !client) {
    return (
      <div className="client-dash-loading">
        <div className="client-dash-loading-inner">
          <div className="client-dash-spinner" />
          <p>Chargement de votre espace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials    = getInitials(client);
  const displayName = [client.prenom, client.nom].filter(Boolean).join(' ') || client.email;

  const menuItems = [
    {
      icon: '📝',
      color: 'gold',
      title: 'Mes Devis',
      desc: 'Consultez et suivez vos demandes de devis',
      path: '/client/mes-devis',
    },
    {
      icon: '🛠️',
      color: 'blue',
      title: 'Services',
      desc: 'Explorez toutes nos prestations disponibles',
      path: '/prestations',
    },
    {
      icon: '👥',
      color: 'green',
      title: 'Prestataires',
      desc: 'Trouvez des fournisseurs qualifiés',
      path: '/prestataires',
    },
    {
      icon: '⚙️',
      color: 'purple',
      title: 'Mon Profil',
      desc: 'Gérez vos informations personnelles',
      path: '/client/profil',
    },
  ];

  const statItems = [
    { icon: '📝', value: devisStats.total,     label: 'Devis' },
    { icon: '✅', value: devisStats.acceptes,  label: 'Acceptés' },
    { icon: '⏳', value: devisStats.enAttente, label: 'En attente' },
    { icon: '💼', value: '—',                  label: 'Missions' },
  ];

  return (
    <div className="client-dash">

      {/* ── Topbar ── */}
      <header className="client-dash-topbar">
        <div className="client-dash-brand">
          <div className="client-dash-brand-logo">E</div>
          <span className="client-dash-brand-name">Elijah<span>GOD</span></span>
        </div>

        <div className="client-dash-topbar-right">
          <div className="client-dash-user-badge">
            <div className="client-dash-avatar">{initials}</div>
            <div className="client-dash-user-info">
              <div className="client-dash-user-name">{displayName}</div>
              <div className="client-dash-user-role">Client</div>
            </div>
          </div>
          <button className="client-dash-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="client-dash-body">

        {/* Hero welcome */}
        <section className="client-dash-hero">
          <div className="client-dash-hero-content">
            <div className="client-dash-hero-top">
              <div>
                <div className="client-dash-hero-avatar">{initials}</div>
                <p className="client-dash-hero-greeting">Bienvenue sur votre espace</p>
                <h1 className="client-dash-hero-title">
                  Bonjour, <span>{client.prenom || displayName}</span> !
                </h1>
                <p className="client-dash-hero-sub">
                  Gérez vos devis, explorez nos services et suivez vos missions depuis ce tableau de bord.
                </p>
                {client.entreprise && (
                  <div className="client-dash-entreprise-badge">
                    🏢 {client.entreprise}
                  </div>
                )}
              </div>
            </div>

            {/* Meta pills */}
            <div className="client-dash-hero-meta">
              <div className="client-dash-meta-pill">
                <span className="pill-icon">✉️</span>
                {client.email}
              </div>
              {client.telephone && (
                <div className="client-dash-meta-pill">
                  <span className="pill-icon">📞</span>
                  {client.telephone}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mini stats */}
        <div className="client-dash-stats">
          {statItems.map((s, i) => (
            <div className="client-stat-card" key={i}>
              <span className="client-stat-icon">{s.icon}</span>
              <div className="client-stat-value">{s.value}</div>
              <div className="client-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA devis */}
        <div className="client-dash-cta">
          <div className="client-dash-cta-text">
            <h3>Vos devis</h3>
            <p>{devisStats.total === 0 ? 'Aucun devis pour le moment. Commencez dès maintenant !' : `${devisStats.total} devis — ${devisStats.enAttente} en cours, ${devisStats.acceptes} accepté(s).`}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="client-dash-cta-btn" onClick={() => navigate('/devis')}>
              ✍️ Nouveau devis
            </button>
            {devisStats.total > 0 && (
              <button className="client-dash-cta-btn" style={{ background: '#2c3e50' }} onClick={() => navigate('/client/mes-devis')}>
                📋 Mes devis
              </button>
            )}
          </div>
        </div>

        {/* Menu actions */}
        <h2 className="client-dash-section-title">📌 Navigation</h2>
        <div className="client-dash-menu">
          {menuItems.map((item, i) => (
            <button
              key={i}
              className="client-menu-card"
              onClick={() => navigate(item.path)}
            >
              <div className={`client-menu-card-icon ${item.color}`}>{item.icon}</div>
              <div className="client-menu-card-text">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <span className="client-menu-card-arrow">›</span>
            </button>
          ))}
        </div>

      </main>
    </div>
  );
}

export default ClientDashboard;
