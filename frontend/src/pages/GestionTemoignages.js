import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MessageSquare, CheckCircle2, XCircle, Trash2, Star,
  ArrowLeft, RefreshCw, Search, Send, ChevronDown, ChevronUp,
  Award, Clock, ThumbsUp, ThumbsDown, AlertCircle, Reply
} from 'lucide-react';
import AdminContext from '../context/AdminContext';
import { API_URL } from '../config';

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUT_CFG = {
  en_attente: { label: 'En attente',  color: '#f39c12', bg: '#fff8e1', icon: <Clock size={13} /> },
  approuve:   { label: 'Approuvé',    color: '#27ae60', bg: '#e8f5e9', icon: <CheckCircle2 size={13} /> },
  refuse:     { label: 'Refusé',      color: '#e74c3c', bg: '#ffebee', icon: <XCircle size={13} /> },
  signale:    { label: 'Signalé',     color: '#e67e22', bg: '#fff3e0', icon: <AlertCircle size={13} /> },
};

function Etoiles({ note }) {
  return (
    <span style={{ color: '#f39c12', fontSize: '0.85rem' }}>
      {'★'.repeat(note)}{'☆'.repeat(5 - note)}
    </span>
  );
}

function Badge({ statut }) {
  const cfg = STATUT_CFG[statut] || STATUT_CFG.en_attente;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}40`,
      borderRadius: 99, padding: '2px 10px',
      fontSize: '0.78rem', fontWeight: 600
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
function GestionTemoignages() {
  const navigate = useNavigate();
  const { token, isAuthenticated, loading: authLoading } = useContext(AdminContext);

  const [temoignages, setTemoignages]   = useState([]);
  const [stats, setStats]               = useState({ total: 0, enAttente: 0, approuve: 0, refuse: 0 });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filtre, setFiltre]             = useState('tous');
  const [recherche, setRecherche]       = useState('');
  const [expanded, setExpanded]         = useState(null); // id étendu pour la réponse
  const [reponseTexte, setReponseTexte] = useState('');
  const [sendingReponse, setSendingReponse] = useState(false);
  const [actionLoading, setActionLoading]   = useState(null); // id de l'action en cours

  // ── Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/admin/login'); return; }
    charger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const headers = { Authorization: `Bearer ${token}` };

  const charger = async () => {
    try {
      setLoading(true);
      const params = filtre !== 'tous' ? `?statut=${filtre}` : '';
      const { data } = await axios.get(`${API_URL}/api/temoignages/admin/tous${params}`, { headers });
      setTemoignages(data.temoignages || []);
      if (data.stats) setStats(data.stats);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Recharger quand le filtre change
  useEffect(() => {
    if (isAuthenticated) charger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  // ── Actions
  const approuver = async (id, featured = false) => {
    if (!window.confirm('Approuver ce témoignage ?')) return;
    setActionLoading(id + '_approuver');
    try {
      await axios.put(`${API_URL}/api/temoignages/admin/${id}/approuver`, { isFeatured: featured }, { headers });
      await charger();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoading(null); }
  };

  const refuser = async (id) => {
    const raison = window.prompt('Raison du refus (optionnel) :');
    if (raison === null) return; // annulé
    setActionLoading(id + '_refuser');
    try {
      await axios.put(`${API_URL}/api/temoignages/admin/${id}/refuser`, { raison }, { headers });
      await charger();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoading(null); }
  };

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer définitivement ce témoignage ?')) return;
    setActionLoading(id + '_supprimer');
    try {
      await axios.delete(`${API_URL}/api/temoignages/admin/${id}`, { headers });
      await charger();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoading(null); }
  };

  const toggleFeatured = async (id) => {
    setActionLoading(id + '_featured');
    try {
      await axios.put(`${API_URL}/api/temoignages/admin/${id}/featured`, {}, { headers });
      await charger();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoading(null); }
  };

  const envoyerReponse = async (id) => {
    if (!reponseTexte.trim()) return;
    setSendingReponse(true);
    try {
      await axios.post(`${API_URL}/api/temoignages/admin/${id}/repondre`, { texte: reponseTexte }, { headers });
      setReponseTexte('');
      setExpanded(null);
      await charger();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSendingReponse(false); }
  };

  const seedDefault = async () => {
    if (!window.confirm('Initialiser la base avec les 6 témoignages par défaut ?\nCette action ne fait rien si des témoignages existent déjà.')) return;
    setSeeding(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/temoignages/admin/seed`, {}, { headers });
      alert(data.message);
      await charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'initialisation');
    } finally {
      setSeeding(false);
    }
  };

  // ── Filtrage local par recherche
  const liste = temoignages.filter(t => {
    if (!recherche) return true;
    const q = recherche.toLowerCase();
    return (
      t.auteur?.nom?.toLowerCase().includes(q) ||
      t.titre?.toLowerCase().includes(q) ||
      t.contenu?.toLowerCase().includes(q)
    );
  });

  // ── Render
  const onglets = [
    { key: 'tous',        label: 'Tous',        count: stats.total },
    { key: 'en_attente',  label: 'En attente',  count: stats.enAttente },
    { key: 'approuve',    label: 'Approuvés',   count: stats.approuve },
    { key: 'refuse',      label: 'Refusés',     count: stats.refuse },
  ];

  return (
    <div style={{ padding: '160px 20px 60px', minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: 1100 }}>

        {/* ── Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{ background: 'none', border: '2px solid #e0e0e0', borderRadius: '0.75rem',
              padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              color: '#666', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={28} color="#1abc9c" /> Gestion des témoignages
            </h1>
            <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.95rem' }}>Modérez et répondez aux avis clients</p>
          </div>
          <button
            onClick={charger}
            style={{ marginLeft: 'auto', background: '#1abc9c', border: 'none', borderRadius: '0.75rem',
              padding: '0.6rem 1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <RefreshCw size={15} /> Actualiser
          </button>
        </div>

        {/* ── Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total', value: stats.total,      color: '#3498db', icon: <MessageSquare size={22} /> },
            { label: 'En attente', value: stats.enAttente, color: '#f39c12', icon: <Clock size={22} /> },
            { label: 'Approuvés', value: stats.approuve,  color: '#27ae60', icon: <ThumbsUp size={22} /> },
            { label: 'Refusés',   value: stats.refuse,    color: '#e74c3c', icon: <ThumbsDown size={22} /> },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}`,
              display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: `${s.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Onglets + Recherche */}
        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1rem 1.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {onglets.map(o => (
              <button key={o.key} onClick={() => setFiltre(o.key)}
                style={{
                  padding: '0.45rem 1rem', borderRadius: 99, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                  background: filtre === o.key ? '#1abc9c' : '#f5f5f5',
                  color: filtre === o.key ? '#fff' : '#555',
                }}>
                {o.label}
                {o.count > 0 && (
                  <span style={{ marginLeft: 6, background: filtre === o.key ? 'rgba(255,255,255,0.3)' : '#ddd',
                    borderRadius: 99, padding: '1px 7px', fontSize: '0.75rem' }}>{o.count}</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input
              type="text" placeholder="Rechercher..." value={recherche}
              onChange={e => setRecherche(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: '1.5px solid #e0e0e0', borderRadius: '0.6rem', fontSize: '0.9rem',
                outline: 'none', minWidth: 200 }}
            />
          </div>
        </div>

        {/* ── Erreur */}
        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a',
            borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: 20 }}>
            ❌ {error}
          </div>
        )}

        {/* ── Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⏳</div>
            Chargement…
          </div>
        ) : liste.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff',
            borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', color: '#888' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
            <p>Aucun témoignage{filtre !== 'tous' ? ' pour ce filtre' : ''} pour le moment.</p>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: 8 }}>Les avis soumis via la page Témoignages apparaîtront ici.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {liste.map(t => {
              const isExpanded = expanded === t._id;
              const aLoading = (key) => actionLoading === t._id + '_' + key;
              return (
                <div key={t._id} style={{ background: '#fff', borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)', overflow: 'hidden',
                  border: t.statut === 'en_attente' ? '2px solid #f39c12' : '1px solid #eee' }}>

                  {/* Ligne principale */}
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f5e9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1.1rem', color: '#1abc9c', flexShrink: 0 }}>
                      {t.auteur?.nom?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Info auteur + contenu */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <strong style={{ fontSize: '1rem', color: '#1a1a2e' }}>{t.auteur?.nom}</strong>
                        {t.auteur?.entreprise && <span style={{ color: '#888', fontSize: '0.85rem' }}>· {t.auteur.entreprise}</span>}
                        <Etoiles note={t.note} />
                        <Badge statut={t.statut} />
                        {t.isFeatured && (
                          <span style={{ background: '#fff8e1', color: '#f39c12', border: '1px solid #f39c1240',
                            borderRadius: 99, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ⭐ Mis en avant
                          </span>
                        )}
                      </div>
                      {t.titre && <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>"{t.titre}"</div>}
                      <p style={{ color: '#555', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{t.contenu}</p>
                      {t.reponse?.texte && (
                        <div style={{ marginTop: 10, padding: '0.75rem', background: '#e8f5e9',
                          borderLeft: '3px solid #1abc9c', borderRadius: '0 0.5rem 0.5rem 0' }}>
                          <strong style={{ fontSize: '0.8rem', color: '#1abc9c' }}>Réponse admin :</strong>
                          <p style={{ margin: '4px 0 0', color: '#333', fontSize: '0.85rem' }}>{t.reponse.texte}</p>
                        </div>
                      )}
                      <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#aaa' }}>
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        {t.type === 'temoignage_externe' && ' · Témoignage externe'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                      {t.statut !== 'approuve' && (
                        <button onClick={() => approuver(t._id)}
                          disabled={aLoading('approuver')}
                          style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: '0.6rem',
                            padding: '0.45rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                            display: 'flex', alignItems: 'center', gap: 5, opacity: aLoading('approuver') ? 0.6 : 1 }}>
                          <ThumbsUp size={13} /> Approuver
                        </button>
                      )}
                      {t.statut !== 'refuse' && (
                        <button onClick={() => refuser(t._id)}
                          disabled={aLoading('refuser')}
                          style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '0.6rem',
                            padding: '0.45rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                            display: 'flex', alignItems: 'center', gap: 5, opacity: aLoading('refuser') ? 0.6 : 1 }}>
                          <ThumbsDown size={13} /> Refuser
                        </button>
                      )}
                      <button onClick={() => toggleFeatured(t._id)}
                        disabled={aLoading('featured')}
                        style={{ background: t.isFeatured ? '#f39c12' : '#f5f5f5',
                          color: t.isFeatured ? '#fff' : '#888',
                          border: 'none', borderRadius: '0.6rem', padding: '0.45rem 0.7rem',
                          cursor: 'pointer', fontSize: '0.82rem', opacity: aLoading('featured') ? 0.6 : 1 }}
                        title={t.isFeatured ? 'Retirer des mis en avant' : 'Mettre en avant'}>
                        <Award size={14} />
                      </button>
                      <button onClick={() => { setExpanded(isExpanded ? null : t._id); setReponseTexte(''); }}
                        style={{ background: '#e8f5e9', color: '#1abc9c', border: 'none', borderRadius: '0.6rem',
                          padding: '0.45rem 0.7rem', cursor: 'pointer', fontSize: '0.82rem',
                          display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Reply size={13} /> {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <button onClick={() => supprimer(t._id)}
                        disabled={aLoading('supprimer')}
                        style={{ background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '0.6rem',
                          padding: '0.45rem 0.7rem', cursor: 'pointer', fontSize: '0.82rem',
                          opacity: aLoading('supprimer') ? 0.6 : 1 }}
                        title="Supprimer définitivement">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Zone réponse dépliable */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: '1rem 1.5rem', background: '#fafafa' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' }}>
                        ✍️ Répondre à ce témoignage
                      </label>
                      <textarea
                        value={reponseTexte}
                        onChange={e => setReponseTexte(e.target.value)}
                        rows={3}
                        placeholder="Votre réponse publique…"
                        style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #ddd',
                          borderRadius: '0.6rem', fontSize: '0.9rem', resize: 'vertical',
                          boxSizing: 'border-box', outline: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => { setExpanded(null); setReponseTexte(''); }}
                          style={{ background: '#f5f5f5', border: 'none', borderRadius: '0.6rem',
                            padding: '0.5rem 1rem', cursor: 'pointer', color: '#666', fontWeight: 600 }}>
                          Annuler
                        </button>
                        <button onClick={() => envoyerReponse(t._id)}
                          disabled={sendingReponse || !reponseTexte.trim()}
                          style={{ background: '#1abc9c', border: 'none', borderRadius: '0.6rem',
                            padding: '0.5rem 1.25rem', cursor: 'pointer', color: '#fff', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 6,
                            opacity: (!reponseTexte.trim() || sendingReponse) ? 0.5 : 1 }}>
                          <Send size={14} /> {sendingReponse ? 'Envoi…' : 'Publier la réponse'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionTemoignages;

