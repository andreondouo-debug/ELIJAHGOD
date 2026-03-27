import { useContext, useEffect } from 'react';
import { PrestataireContext } from '../context/PrestataireContext';
import { useNavigate } from 'react-router-dom';
import './PrestataireDashboard.css';

/* ── Helpers ── */
const getInitials = (p) => {
  if (!p) return 'P';
  if (p.nomEntreprise) return p.nomEntreprise.charAt(0).toUpperCase();
  const parts = [p.prenom, p.nom].filter(Boolean);
  return parts.map(s => s.charAt(0).toUpperCase()).join('').slice(0, 2) || 'P';
};

const getDisplayName = (p) => {
  if (!p) return '';
  return p.nomEntreprise || [p.prenom, p.nom].filter(Boolean).join(' ') || p.email;
};

/* ── Composant ── */
function PrestataireDashboard() {
  const { prestataire, isAuthenticated, loading, logout } = useContext(PrestataireContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/prestataire/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || !prestataire) {
    return (
      <div className="prest-dash-loading">
        <div className="prest-dash-loading-inner">
          <div className="prest-dash-spinner" />
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

  const initials   = getInitials(prestataire);
  const displayName = getDisplayName(prestataire);
  const specialites = Array.isArray(prestataire.specialites)
    ? prestataire.specialites
    : prestataire.specialites
      ? [prestataire.specialites]
      : [];

  const menuItems = [
    {
      icon: '📋',
      color: 'gold',
      title: 'Mes Missions',
      desc: 'Suivez vos projets en cours et à venir',
      path: '/prestataire/missions',
    },
    {
      icon: '📊',
      color: 'blue',
      title: 'Statistiques',
      desc: 'Analysez vos performances et revenus',
      path: '/prestataire/stats',
    },
    {
      icon: '⭐',
      color: 'green',
      title: 'Avis Clients',
      desc: 'Consultez les retours de vos clients',
      path: '/prestataire/avis',
    },
    {
      icon: '⚙️',
      color: 'purple',
      title: 'Mon Profil',
      desc: 'Gérez votre profil visible par les clients',
      path: '/prestataire/profil',
    },
    {
      icon: '📅',
      color: 'gold',
      title: 'Mes Événements',
      desc: 'Agenda, planning et organisation de vos événements',
      path: '/prestataire/evenements',
    },
  ];

  const statItems = [
    { icon: '📋', value: '—', label: 'Missions' },
    { icon: '✅', value: '—', label: 'Terminées' },
    { icon: '⭐', value: '—', label: 'Avis' },
    { icon: '💰', value: '—', label: 'Revenus' },
  ];

  return (
    <div className="prest-dash">

      {/* ── Topbar ── */}
      <header className="prest-dash-topbar">
        <div className="prest-dash-brand">
          <div className="prest-dash-brand-logo">E</div>
          <span className="prest-dash-brand-name">Elijah<span>GOD</span></span>
        </div>

        <div className="prest-dash-topbar-right">
          <div className="prest-dash-user-badge">
            <div className="prest-dash-avatar">{initials}</div>
            <div className="prest-dash-user-info">
              <div className="prest-dash-user-name">{displayName}</div>
              <div className="prest-dash-user-role">Prestataire</div>
            </div>
          </div>
          <button className="prest-dash-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="prest-dash-body">

        {/* Hero welcome */}
        <section className="prest-dash-hero">
          <div className="prest-dash-hero-content">
            <div className="prest-dash-hero-top">
              <div>
                <p className="prest-dash-hero-greeting">Bienvenue sur votre espace</p>
                <h1 className="prest-dash-hero-title">
                  Bonjour, <span>{displayName}</span> !
                </h1>
                <p className="prest-dash-hero-sub">
                  {prestataire.categorie
                    ? `Catégorie : ${prestataire.categorie}`
                    : 'Gérez vos missions et votre profil depuis ce tableau de bord.'}
                </p>
              </div>

              <div
                className={`prest-dash-status-badge ${prestataire.isVerified ? 'verified' : 'pending'}`}
              >
                <span className="prest-dash-status-dot" />
                {prestataire.isVerified ? '✔ Compte vérifié' : '⏳ En attente de vérification'}
              </div>
            </div>

            {/* Meta pills */}
            <div className="prest-dash-hero-meta">
              <div className="prest-dash-meta-pill">
                <span className="pill-icon">✉️</span>
                {prestataire.email}
              </div>
              {prestataire.telephone && (
                <div className="prest-dash-meta-pill">
                  <span className="pill-icon">📞</span>
                  {prestataire.telephone}
                </div>
              )}
              {specialites.map((s, i) => (
                <div key={i} className="prest-dash-meta-pill">
                  <span className="pill-icon">🎯</span> {s}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alerte si non vérifié */}
        {!prestataire.isVerified && (
          <div className="prest-dash-alert">
            <span className="prest-dash-alert-icon">⚠️</span>
            <p className="prest-dash-alert-text">
              <strong>Votre compte est en attente de validation.</strong> Notre équipe examine votre
              profil. Vous recevrez un e-mail dès que votre compte sera activé. En attendant, vous
              pouvez compléter votre profil.
            </p>
          </div>
        )}

        {/* Mini stats */}
        <div className="prest-dash-stats">
          {statItems.map((s, i) => (
            <div className="prest-stat-card" key={i}>
              <span className="prest-stat-icon">{s.icon}</span>
              <div className="prest-stat-value">{s.value}</div>
              <div className="prest-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Menu actions */}
        <h2 className="prest-dash-section-title">📌 Navigation</h2>
        <div className="prest-dash-menu">
          {menuItems.map((item, i) => (
            <button
              key={i}
              className="prest-menu-card"
              onClick={() => navigate(item.path)}
            >
              <div className={`prest-menu-card-icon ${item.color}`}>{item.icon}</div>
              <div className="prest-menu-card-text">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <span className="prest-menu-card-arrow">›</span>
            </button>
          ))}
        </div>

      </main>
    </div>
  );
}

export default PrestataireDashboard;
