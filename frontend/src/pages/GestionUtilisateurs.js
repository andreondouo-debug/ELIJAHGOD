import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './GestionPrestationsAdmin.css'; // Réutilise les styles existants
import { SettingsContext } from '../context/SettingsContext';
import { API_URL } from '../config';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const DEFAULT_CATEGORIES = [
  'DJ', 'Photographe', 'Vidéaste', 'Animateur', 'Groupe de louange',
  'Wedding planner', 'Traiteur', 'Sonorisation', 'Éclairage', 'Décoration',
  'Location matériel', 'Autre'
];

/**
 * 👥 GESTION DES PRESTATAIRES - Page admin
 */
function GestionUtilisateurs() {
  const { settings } = useContext(SettingsContext);
  const CATEGORIES = (settings?.categoriesPrestataires?.length > 0)
    ? settings.categoriesPrestataires
    : DEFAULT_CATEGORIES;
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recherche, setRecherche] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  // Modale édition
  const [isEditing, setIsEditing] = useState(false);
  useBodyScrollLock(isEditing);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nomEntreprise: '', categorie: '', description: '',
    telephone: '', email: '', ville: '',
    isActive: true, isVerified: false
  });

  const getToken = () => localStorage.getItem('adminToken');

  const chargerPrestataires = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/prestataires/admin/tous`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPrestataires(data.data || []);
    } catch (error) {
      console.error('❌ Erreur chargement prestataires:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des prestataires' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerPrestataires();
  }, [chargerPrestataires]);

  // Fermer message après 4s
  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [message.text]);

  // Ouvrir modale édition
  const ouvrirEdition = (prest) => {
    setEditingId(prest._id);
    setEditForm({
      nomEntreprise: prest.nomEntreprise || '',
      categorie: prest.categorie || '',
      description: prest.description || '',
      telephone: prest.telephone || '',
      email: prest.email || '',
      ville: prest.ville || '',
      isActive: prest.isActive !== false,
      isVerified: prest.isVerified === true
    });
    setIsEditing(true);
  };

  // Sauvegarder modification
  const sauvegarderEdition = async () => {
    if (!editForm.nomEntreprise || !editForm.categorie) {
      setMessage({ type: 'error', text: '❌ Nom et catégorie requis' });
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/prestataires/admin/${editingId}`,
        editForm,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMessage({ type: 'success', text: '✅ Prestataire modifié avec succès !' });
      setIsEditing(false);
      setEditingId(null);
      await chargerPrestataires();
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la modification' });
    } finally {
      setSaving(false);
    }
  };

  // Supprimer prestataire
  const supprimerPrestataire = async (prest) => {
    if (!window.confirm(`Supprimer définitivement "${prest.nomEntreprise}" ?\n\nCette action est irréversible.`)) return;
    setSaving(true);
    try {
      await axios.delete(
        `${API_URL}/api/prestataires/admin/${prest._id}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMessage({ type: 'success', text: '✅ Prestataire supprimé' });
      await chargerPrestataires();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la suppression' });
    } finally {
      setSaving(false);
    }
  };

  // Activer/désactiver rapidement
  const toggleActif = async (prest) => {
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/prestataires/admin/${prest._id}`,
        { isActive: !prest.isActive },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      await chargerPrestataires();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(false);
    }
  };

  // Vérifier/dévérifier rapidement
  const toggleVerifie = async (prest) => {
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/prestataires/admin/${prest._id}`,
        { isVerified: !prest.isVerified },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      await chargerPrestataires();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(false);
    }
  };

  // Filtrage
  const prestatairesFiltres = prestataires.filter(p => {
    const matchRecherche = !recherche ||
      p.nomEntreprise?.toLowerCase().includes(recherche.toLowerCase()) ||
      p.email?.toLowerCase().includes(recherche.toLowerCase());
    const matchCat = !filtreCategorie || p.categorie === filtreCategorie;
    const matchStatut =
      !filtreStatut ||
      (filtreStatut === 'actif' && p.isActive) ||
      (filtreStatut === 'inactif' && !p.isActive) ||
      (filtreStatut === 'verifie' && p.isVerified) ||
      (filtreStatut === 'non_verifie' && !p.isVerified);
    return matchRecherche && matchCat && matchStatut;
  });

  const stats = {
    total: prestataires.length,
    actifs: prestataires.filter(p => p.isActive).length,
    verifies: prestataires.filter(p => p.isVerified).length,
    inactifs: prestataires.filter(p => !p.isActive).length,
  };

  if (loading) {
    return (
      <div className="gestion-prestations-admin">
        <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>⏳ Chargement des prestataires...</div>
      </div>
    );
  }

  return (
    <div className="gestion-prestations-admin">
      {/* En-tête */}
      <div className="admin-header">
        <div>
          <h1>👥 Gestion des Prestataires</h1>
          <p>Modifiez, activez ou supprimez les comptes prestataires</p>
        </div>
        <Link to="/admin/dashboard" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: 8 }}>
          ← Retour tableau de bord
        </Link>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: stats.total, color: '#667eea' },
          { label: 'Actifs', value: stats.actifs, color: '#10b981' },
          { label: 'Vérifiés', value: stats.verifies, color: '#f59e0b' },
          { label: 'Inactifs', value: stats.inactifs, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: 12, padding: '1rem 1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flex: '1 1 120px', textAlign: 'center',
            borderTop: `4px solid ${s.color}`
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{
        background: 'white', borderRadius: 12, padding: '1.2rem',
        marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Rechercher par nom ou email..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={{ flex: '2 1 200px', padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none' }}
        />
        <select
          value={filtreCategorie}
          onChange={(e) => setFiltreCategorie(e.target.value)}
          style={{ flex: '1 1 150px', padding: '0.6rem', borderRadius: 8, border: '1px solid #e5e7eb' }}
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          style={{ flex: '1 1 150px', padding: '0.6rem', borderRadius: 8, border: '1px solid #e5e7eb' }}
        >
          <option value="">Tous statuts</option>
          <option value="actif">✅ Actifs</option>
          <option value="inactif">❌ Inactifs</option>
          <option value="verifie">⭐ Vérifiés</option>
          <option value="non_verifie">⏳ Non vérifiés</option>
        </select>
        <button
          onClick={() => { setRecherche(''); setFiltreCategorie(''); setFiltreStatut(''); }}
          style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}
        >
          ✕ Réinitialiser
        </button>
      </div>

      {/* Liste */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#666', fontSize: '0.9rem' }}>
          {prestatairesFiltres.length} prestataire(s) affiché(s)
        </div>

        {prestatairesFiltres.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
            Aucun prestataire trouvé
          </div>
        ) : (
          prestatairesFiltres.map(prest => (
            <div key={prest._id} style={{
              display: 'flex', alignItems: 'center', padding: '1rem 1.5rem',
              borderBottom: '1px solid #f9f9f9', gap: '1rem', flexWrap: 'wrap',
              opacity: prest.isActive ? 1 : 0.6,
              backgroundColor: prest.isActive ? 'white' : '#fafafa'
            }}>
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0
              }}>
                {prest.photos?.[0]?.url
                  ? <img src={prest.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  : (prest.nomEntreprise?.[0] || '?').toUpperCase()
                }
              </div>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{prest.nomEntreprise}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>{prest.email}</div>
                <div style={{ fontSize: '0.8rem', color: '#667eea', marginTop: 2 }}>{prest.categorie}</div>
              </div>

              {/* Badges statut */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                  background: prest.isActive ? '#d1fae5' : '#fee2e2',
                  color: prest.isActive ? '#065f46' : '#991b1b'
                }}>
                  {prest.isActive ? '✅ Actif' : '❌ Inactif'}
                </span>
                <span style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                  background: prest.isVerified ? '#fef3c7' : '#f3f4f6',
                  color: prest.isVerified ? '#92400e' : '#6b7280'
                }}>
                  {prest.isVerified ? '⭐ Vérifié' : '⏳ En attente'}
                </span>
                {prest.notemoyenne > 0 && (
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>
                    ★ {prest.notemoyenne?.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => toggleVerifie(prest)}
                  disabled={saving}
                  title={prest.isVerified ? 'Retirer la vérification' : 'Marquer comme vérifié'}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #fbbf24', background: '#fef3c7', color: '#92400e', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  {prest.isVerified ? '⭐ Vérif.' : '☆ Vérifier'}
                </button>
                <button
                  onClick={() => toggleActif(prest)}
                  disabled={saving}
                  title={prest.isActive ? 'Désactiver' : 'Activer'}
                  style={{
                    padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                    background: prest.isActive ? '#fee2e2' : '#d1fae5',
                    color: prest.isActive ? '#991b1b' : '#065f46'
                  }}
                >
                  {prest.isActive ? '🚫 Désactiver' : '✅ Activer'}
                </button>
                <button
                  onClick={() => ouvrirEdition(prest)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #c7d2fe', background: '#e0e7ff', color: '#3730a3', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => supprimerPrestataire(prest)}
                  disabled={saving}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALE ÉDITION */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>✏️ Modifier le prestataire</h2>
              <button className="modal-close" onClick={() => setIsEditing(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom de l'entreprise *</label>
                  <input type="text" className="form-input"
                    value={editForm.nomEntreprise}
                    onChange={(e) => setEditForm({ ...editForm, nomEntreprise: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select className="form-input"
                    value={editForm.categorie}
                    onChange={(e) => setEditForm({ ...editForm, categorie: e.target.value })}
                  >
                    <option value="">-- Sélectionner --</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="text" className="form-input"
                    value={editForm.telephone}
                    onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ville</label>
                  <input type="text" className="form-input"
                    value={editForm.ville}
                    onChange={(e) => setEditForm({ ...editForm, ville: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  <span>Compte actif</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox"
                    checked={editForm.isVerified}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                  />
                  <span>⭐ Prestataire vérifié</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                Annuler
              </button>
              <button className="btn-primary" onClick={sauvegarderEdition}
                disabled={saving || !editForm.nomEntreprise || !editForm.categorie}
              >
                {saving ? '⏳ Sauvegarde...' : '💾 Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUtilisateurs;
