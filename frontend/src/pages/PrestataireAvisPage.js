import { useContext, useEffect, useState, useCallback } from 'react';
import { PrestataireContext } from '../context/PrestataireContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './PrestataireAvisPage.css';

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

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const Stars = ({ note, size = '1rem' }) => {
  const n = Math.round(note) || 0;
  return (
    <span style={{ fontSize: size, color: '#d4af37', letterSpacing: '2px' }}>
      {'★'.repeat(n)}
      <span style={{ color: 'rgba(212,175,55,0.25)' }}>{'★'.repeat(5 - n)}</span>
    </span>
  );
};

function PrestataireAvisPage() {
  const { prestataire, isAuthenticated, loading, logout, token } = useContext(PrestataireContext);
  const navigate = useNavigate();

  const [avisData, setAvisData] = useState(null);
  const [loadingAvis, setLoadingAvis] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/prestataire/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const chargerAvis = useCallback(async () => {
    if (!token) return;
    setLoadingAvis(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_URL}/api/prestataires/me/avis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvisData(data);
    } catch (err) {
      // Fallback: use data from context if available
      if (prestataire?.avis) {
        const avis = prestataire.avis || [];
        const moy = avis.length > 0
          ? avis.reduce((s, a) => s + (a.note || 0), 0) / avis.length
          : 0;
        setAvisData({ avis, noteGlobale: moy.toFixed(1), nombreAvis: avis.length });
      } else {
        setError('Impossible de charger les avis.');
      }
    } finally {
      setLoadingAvis(false);
    }
  }, [token, prestataire]);

  useEffect(() => {
    if (isAuthenticated && token) chargerAvis();
  }, [isAuthenticated, token, chargerAvis]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading || !prestataire) {
    return (
      <div className="pa-loading">
        <div className="pa-spinner" />
        <p>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const initials = getInitials(prestataire);
  const displayName = getDisplayName(prestataire);
  const avis = avisData?.avis || [];
  const noteGlobale = parseFloat(avisData?.noteGlobale || 0);
  const nombreAvis = avisData?.nombreAvis || 0;

  // Répartition par note
  const repartition = [5, 4, 3, 2, 1].map(n => ({
    note: n,
    count: avis.filter(a => Math.round(a.note) === n).length,
  }));
  const maxCount = Math.max(...repartition.map(r => r.count), 1);

  return (
    <div className="pa-page">
      {/* ── Topbar ── */}
      <header className="pa-topbar">
        <div className="pa-brand">
          <div className="pa-brand-logo">E</div>
          <span className="pa-brand-name">Elijah<span>GOD</span></span>
        </div>
        <div className="pa-topbar-right">
          <button className="pa-back-btn" onClick={() => navigate('/prestataire/dashboard')}>
            ← Tableau de bord
          </button>
          <div className="pa-avatar">{initials}</div>
          <span className="pa-username">{displayName}</span>
          <button className="pa-logout-btn" onClick={handleLogout}>🚪</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pa-hero">
        <h1 className="pa-hero-title">⭐ Avis Clients</h1>
        <p className="pa-hero-sub">Ce que vos clients pensent de votre travail</p>
      </section>

      <div className="pa-body">
        {error && <div className="pa-error">{error}</div>}

        {loadingAvis ? (
          <div className="pa-spinner-center"><div className="pa-spinner" /></div>
        ) : (
          <>
            {/* ── Résumé ── */}
            <div className="pa-summary">
              {/* Note globale */}
              <div className="pa-summary-score">
                <div className="pa-big-note">{noteGlobale > 0 ? noteGlobale.toFixed(1) : '—'}</div>
                <Stars note={noteGlobale} size="1.5rem" />
                <p className="pa-nb-avis">{nombreAvis} avis</p>
              </div>

              {/* Répartition */}
              <div className="pa-repartition">
                {repartition.map((r) => (
                  <div key={r.note} className="pa-rep-row">
                    <span className="pa-rep-note">{r.note}★</span>
                    <div className="pa-rep-bar">
                      <div
                        className="pa-rep-fill"
                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="pa-rep-count">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Liste des avis ── */}
            {avis.length === 0 ? (
              <div className="pa-empty">
                <span>💬</span>
                <p>Aucun avis pour l'instant.</p>
                <small>Vos clients pourront vous noter après leur événement.</small>
              </div>
            ) : (
              <div className="pa-avis-list">
                <h2 className="pa-section-title">Tous les avis ({nombreAvis})</h2>
                {avis.map((a, i) => (
                  <div key={a._id || i} className="pa-avis-card">
                    <div className="pa-avis-header">
                      <div className="pa-avis-avatar">
                        {(a.client?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="pa-avis-meta">
                        <div className="pa-avis-client">{a.client || 'Client anonyme'}</div>
                        <div className="pa-avis-date">
                          {a.typeEvenement && <span className="pa-avis-type">{a.typeEvenement}</span>}
                          {a.dateEvenement && <span> · {formatDate(a.dateEvenement)}</span>}
                        </div>
                      </div>
                      <div className="pa-avis-note-col">
                        <Stars note={a.note} size="1.1rem" />
                        <span className="pa-avis-note-num">{a.note}/5</span>
                      </div>
                    </div>
                    {a.commentaire && (
                      <p className="pa-avis-comment">"{a.commentaire}"</p>
                    )}
                    {a.dateAvis && (
                      <div className="pa-avis-posted">Posté le {formatDate(a.dateAvis)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PrestataireAvisPage;
