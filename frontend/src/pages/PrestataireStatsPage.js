import { useContext, useEffect, useState, useCallback } from 'react';
import { PrestataireContext } from '../context/PrestataireContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './PrestataireStatsPage.css';

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

const formatMoney = (n) => {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
};

function PrestataireStatsPage() {
  const { prestataire, isAuthenticated, loading, logout, token } = useContext(PrestataireContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/prestataire/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const chargerStats = useCallback(async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/prestataires/me/statistiques`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data.data || data);
    } catch (err) {
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) chargerStats();
  }, [isAuthenticated, token, chargerStats]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading || !prestataire) {
    return (
      <div className="ps-loading">
        <div className="ps-spinner" />
        <p>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const initials = getInitials(prestataire);
  const displayName = getDisplayName(prestataire);

  const kpiCards = [
    {
      icon: '👁',
      label: 'Vues du profil',
      value: stats?.vuesProfil ?? '—',
      color: '#667eea',
      desc: 'Nombre de fois où votre profil a été consulté',
    },
    {
      icon: '📩',
      label: 'Demandes reçues',
      value: stats?.demandesRecues ?? '—',
      color: '#d4af37',
      desc: 'Clients ayant sollicité vos services',
    },
    {
      icon: '📄',
      label: 'Devis envoyés',
      value: stats?.devisEnvoyes ?? '—',
      color: '#10b981',
      desc: 'Devis que vous avez soumis',
    },
    {
      icon: '✅',
      label: 'Réservations confirmées',
      value: stats?.reservationsConfirmees ?? '—',
      color: '#f59e0b',
      desc: 'Prestations validées par un client',
    },
    {
      icon: '💰',
      label: "Chiffre d'affaires",
      value: typeof stats?.chiffreAffaires === 'number' ? formatMoney(stats.chiffreAffaires) : '—',
      color: '#ec4899',
      desc: 'Revenus totaux générés',
    },
    {
      icon: '⭐',
      label: 'Note moyenne',
      value: prestataire.noteGlobale
        ? `${parseFloat(prestataire.noteGlobale).toFixed(1)}/5`
        : (prestataire.notemoyenne ? `${parseFloat(prestataire.notemoyenne).toFixed(1)}/5` : '—'),
      color: '#ef4444',
      desc: `Basée sur ${prestataire.nombreAvis || 0} avis`,
    },
  ];

  return (
    <div className="ps-page">
      {/* ── Topbar ── */}
      <header className="ps-topbar">
        <div className="ps-brand">
          <div className="ps-brand-logo">E</div>
          <span className="ps-brand-name">Elijah<span>GOD</span></span>
        </div>
        <div className="ps-topbar-right">
          <button className="ps-back-btn" onClick={() => navigate('/prestataire/dashboard')}>
            ← Tableau de bord
          </button>
          <div className="ps-avatar">{initials}</div>
          <span className="ps-username">{displayName}</span>
          <button className="ps-logout-btn" onClick={handleLogout}>🚪</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="ps-hero">
        <h1 className="ps-hero-title">📊 Statistiques</h1>
        <p className="ps-hero-sub">Suivez vos performances en temps réel</p>
      </section>

      <div className="ps-body">
        {error && (
          <div className="ps-error">{error}</div>
        )}

        {loadingStats ? (
          <div className="ps-spinner-center"><div className="ps-spinner" /></div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="ps-kpi-grid">
              {kpiCards.map((kpi) => (
                <div key={kpi.label} className="ps-kpi-card" style={{ '--kpi-color': kpi.color }}>
                  <div className="ps-kpi-icon">{kpi.icon}</div>
                  <div className="ps-kpi-val">{kpi.value}</div>
                  <div className="ps-kpi-label">{kpi.label}</div>
                  <div className="ps-kpi-desc">{kpi.desc}</div>
                  <div className="ps-kpi-bar">
                    <div className="ps-kpi-bar-fill" />
                  </div>
                </div>
              ))}
            </div>

            {/* Info card */}
            {!stats && (
              <div className="ps-info-card">
                <span>📈</span>
                <p>Les statistiques seront disponibles au fur et à mesure de l'utilisation de votre profil.</p>
              </div>
            )}

            {/* Refresh */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="ps-refresh-btn" onClick={chargerStats} disabled={loadingStats}>
                🔄 Actualiser
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PrestataireStatsPage;
