import { useContext, useEffect, useState } from 'react';
import { ClientContext } from '../context/ClientContext';
import { useNavigate } from 'react-router-dom';
import './ClientProfilPage.css';

/* ── Helpers ── */
const getInitials = (c) => {
  if (!c) return 'C';
  return [c.prenom, c.nom]
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase())
    .join('').slice(0, 2) || 'C';
};

function ClientProfilPage() {
  const { client, isAuthenticated, loading, logout, updateProfil } = useContext(ClientContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    entreprise: '',
    adresse: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/client/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Pre-fill form when client data loads
  useEffect(() => {
    if (client) {
      setForm({
        prenom: client.prenom || '',
        nom: client.nom || '',
        telephone: client.telephone || '',
        entreprise: client.entreprise || '',
        adresse: client.adresse || '',
      });
    }
  }, [client]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prenom || !form.nom) {
      setMessage({ type: 'error', text: '❌ Prénom et nom sont obligatoires.' });
      return;
    }
    setSaving(true);
    try {
      await updateProfil(form);
      setMessage({ type: 'success', text: '✅ Profil mis à jour avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !client) {
    return (
      <div className="cp-loading">
        <div className="cp-spinner" />
        <p>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const initials    = getInitials(client);
  const displayName = [client.prenom, client.nom].filter(Boolean).join(' ') || client.email;

  return (
    <div className="cp-page">
      {/* ── Topbar ── */}
      <header className="cp-topbar">
        <div className="cp-brand">
          <div className="cp-brand-logo">E</div>
          <span className="cp-brand-name">Elijah<span>GOD</span></span>
        </div>
        <div className="cp-topbar-right">
          <button className="cp-back-btn" onClick={() => navigate('/client/dashboard')}>
            ← Tableau de bord
          </button>
          <div className="cp-avatar">{initials}</div>
          <span className="cp-username">{displayName}</span>
          <button className="cp-logout-btn" onClick={handleLogout}>🚪</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="cp-hero">
        <div className="cp-hero-avatar">{initials}</div>
        <h1 className="cp-hero-title">Mon Profil</h1>
        <p className="cp-hero-email">{client.email}</p>
      </section>

      <div className="cp-body">
        {/* Message */}
        {message.text && (
          <div className={`cp-alert cp-alert-${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        <form className="cp-form" onSubmit={handleSubmit}>
          <h2 className="cp-section-title">Informations personnelles</h2>

          <div className="cp-form-row">
            <div className="cp-form-group">
              <label className="cp-label">Prénom *</label>
              <input
                type="text"
                name="prenom"
                className="cp-input"
                value={form.prenom}
                onChange={handleChange}
                placeholder="Votre prénom"
                required
              />
            </div>
            <div className="cp-form-group">
              <label className="cp-label">Nom *</label>
              <input
                type="text"
                name="nom"
                className="cp-input"
                value={form.nom}
                onChange={handleChange}
                placeholder="Votre nom"
                required
              />
            </div>
          </div>

          <div className="cp-form-group">
            <label className="cp-label">Téléphone</label>
            <input
              type="tel"
              name="telephone"
              className="cp-input"
              value={form.telephone}
              onChange={handleChange}
              placeholder="+33 6 00 00 00 00"
            />
          </div>

          <div className="cp-form-group">
            <label className="cp-label">Entreprise / Organisation</label>
            <input
              type="text"
              name="entreprise"
              className="cp-input"
              value={form.entreprise}
              onChange={handleChange}
              placeholder="Nom de votre entreprise (facultatif)"
            />
          </div>

          <div className="cp-form-group">
            <label className="cp-label">Adresse</label>
            <input
              type="text"
              name="adresse"
              className="cp-input"
              value={form.adresse}
              onChange={handleChange}
              placeholder="Votre adresse"
            />
          </div>

          <div className="cp-form-footer">
            <div className="cp-readonly-info">
              <span className="cp-readonly-label">Email</span>
              <span className="cp-readonly-value">{client.email}</span>
              <span className="cp-readonly-hint">L'email ne peut pas être modifié ici.</span>
            </div>
            <button type="submit" className="cp-submit-btn" disabled={saving}>
              {saving ? '⏳ Enregistrement…' : '💾 Enregistrer les modifications'}
            </button>
          </div>
        </form>

        {/* ── Actions rapides ── */}
        <div className="cp-quick-actions">
          <button className="cp-action-card" onClick={() => navigate('/devis')}>
            <span className="cp-action-icon">📝</span>
            <span>Mes Devis</span>
          </button>
          <button className="cp-action-card" onClick={() => navigate('/prestataires')}>
            <span className="cp-action-icon">👥</span>
            <span>Prestataires</span>
          </button>
          <button className="cp-action-card" onClick={() => navigate('/prestations')}>
            <span className="cp-action-icon">🛠️</span>
            <span>Services</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientProfilPage;
