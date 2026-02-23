import { useContext, useEffect, useState } from 'react';
import { PrestataireContext } from '../context/PrestataireContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './PrestataireMissionsPage.css';

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

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

function PrestataireMissionsPage() {
  const { prestataire, isAuthenticated, loading, logout, token } = useContext(PrestataireContext);
  const navigate = useNavigate();

  const [missions, setMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/prestataire/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Construire les missions depuis le calendrier dispo + avis
  useEffect(() => {
    if (!prestataire) return;
    setLoadingMissions(true);
    const calendrier = prestataire.disponibilite?.calendrier || [];
    const avisItems = (prestataire.avis || []).map((a) => ({
      date: a.dateEvenement,
      titre: a.typeEvenement || 'Événement',
      client: a.client || '—',
      note: a.note,
      commentaire: a.commentaire,
      type: 'avis',
    }));
    const blockedItems = calendrier.map((b) => ({
      date: b.date,
      titre: b.note || 'Date réservée',
      type: 'bloque',
    }));
    const all = [...avisItems, ...blockedItems].sort((a, b) => new Date(b.date) - new Date(a.date));
    setMissions(all);
    setLoadingMissions(false);
  }, [prestataire]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddDate = async (e) => {
    e.preventDefault();
    if (!newDate) return;
    setSaving(true);
    try {
      await axios.post(
        `${API_URL}/api/prestataires/disponibilite`,
        { date: newDate, note: newNote, disponible: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: '✅ Date ajoutée au calendrier !' });
      setNewDate('');
      setNewNote('');
      // Reload page data
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'ajout' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !prestataire) {
    return (
      <div className="pm-loading">
        <div className="pm-spinner" />
        <p>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const initials = getInitials(prestataire);
  const displayName = getDisplayName(prestataire);

  return (
    <div className="pm-page">
      {/* ── Topbar ── */}
      <header className="pm-topbar">
        <div className="pm-brand">
          <div className="pm-brand-logo">E</div>
          <span className="pm-brand-name">Elijah<span>GOD</span></span>
        </div>
        <div className="pm-topbar-right">
          <button className="pm-back-btn" onClick={() => navigate('/prestataire/dashboard')}>
            ← Tableau de bord
          </button>
          <div className="pm-avatar">{initials}</div>
          <span className="pm-username">{displayName}</span>
          <button className="pm-logout-btn" onClick={handleLogout}>🚪</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pm-hero">
        <h1 className="pm-hero-title">📋 Mes Missions</h1>
        <p className="pm-hero-sub">Retrouvez vos événements passés et vos dates bloquées</p>
      </section>

      <div className="pm-body">
        {/* Message */}
        {message.text && (
          <div className={`pm-alert pm-alert-${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        <div className="pm-grid">
          {/* ── Timeline ── */}
          <div className="pm-timeline-col">
            <h2 className="pm-section-title">Chronologie</h2>

            {loadingMissions ? (
              <div className="pm-spinner-small" />
            ) : missions.length === 0 ? (
              <div className="pm-empty">
                <span>📅</span>
                <p>Aucune mission ou date enregistrée.</p>
              </div>
            ) : (
              <div className="pm-timeline">
                {missions.map((m, i) => (
                  <div key={i} className={`pm-timeline-item pm-timeline-${m.type}`}>
                    <div className="pm-timeline-dot" />
                    <div className="pm-timeline-content">
                      <span className="pm-timeline-date">{formatDate(m.date)}</span>
                      <h3 className="pm-timeline-title">{m.titre}</h3>
                      {m.client && <p className="pm-timeline-client">👤 {m.client}</p>}
                      {m.note && (
                        <div className="pm-timeline-stars">
                          {'★'.repeat(m.note)}{'☆'.repeat(5 - m.note)}
                        </div>
                      )}
                      {m.commentaire && <p className="pm-timeline-comment">"{m.commentaire}"</p>}
                      <span className={`pm-timeline-badge pm-badge-${m.type}`}>
                        {m.type === 'avis' ? '⭐ Événement évalué' : '🔒 Date bloquée'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Formulaire ajout date ── */}
          <div className="pm-side-col">
            <div className="pm-add-card">
              <h2 className="pm-section-title">Bloquer une date</h2>
              <p className="pm-add-desc">Indiquez une date où vous n'êtes pas disponible.</p>
              <form className="pm-add-form" onSubmit={handleAddDate}>
                <label className="pm-label">Date *</label>
                <input
                  type="date"
                  className="pm-input"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
                <label className="pm-label">Note (facultatif)</label>
                <input
                  type="text"
                  className="pm-input"
                  placeholder="Ex : Mariage Dupont, Vacances…"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button type="submit" className="pm-submit-btn" disabled={saving}>
                  {saving ? '…' : '+ Bloquer'}
                </button>
              </form>
            </div>

            {/* Stats rapides */}
            <div className="pm-quick-stats">
              <div className="pm-qs-card">
                <span className="pm-qs-num">{missions.filter(m => m.type === 'avis').length}</span>
                <span className="pm-qs-label">Événements évalués</span>
              </div>
              <div className="pm-qs-card">
                <span className="pm-qs-num">{missions.filter(m => m.type === 'bloque').length}</span>
                <span className="pm-qs-label">Dates bloquées</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrestataireMissionsPage;
