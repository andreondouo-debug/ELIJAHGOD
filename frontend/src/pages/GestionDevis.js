import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminContext from '../context/AdminContext';
import './MesDevisPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * 📝 GESTION DEVIS - Page admin pour valider et gérer tous les devis
 */
function GestionDevis() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useContext(AdminContext);
  
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [changingStatut, setChangingStatut] = useState(null); // id du devis en cours de changement

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    chargerDevis();
  }, [isAuthenticated, navigate]);

  const chargerDevis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/devis/admin/tous`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📋 Devis chargés (admin):', response.data);
      setDevis(response.data.devis || []);
      setError('');
    } catch (err) {
      console.error('❌ Erreur chargement devis:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const STATUTS = [
    { value: 'brouillon',                  icon: '📝', label: 'Brouillon' },
    { value: 'soumis',                     icon: '📤', label: 'Soumis' },
    { value: 'en_etude',                   icon: '🔍', label: 'En étude' },
    { value: 'modifie_admin',              icon: '✏️',  label: 'Modifié par admin' },
    { value: 'attente_validation_client',  icon: '⏳', label: 'Attente validation client' },
    { value: 'valide_client',              icon: '👍', label: 'Validé par client' },
    { value: 'accepte',                    icon: '✅', label: 'Accepté' },
    { value: 'entretien_prevu',            icon: '📅', label: 'Entretien prévu' },
    { value: 'entretien_effectue',         icon: '🤝', label: 'Entretien effectué' },
    { value: 'devis_final',                icon: '📋', label: 'Devis final' },
    { value: 'transforme_contrat',         icon: '📜', label: 'Transformé en contrat' },
    { value: 'contrat_signe',              icon: '🖊️',  label: 'Contrat signé' },
    { value: 'valide_final',               icon: '🏆', label: 'Validé final' },
    { value: 'refuse',                     icon: '❌', label: 'Refusé' },
    { value: 'expire',                     icon: '⌛', label: 'Expiré' },
    { value: 'annule',                     icon: '🚫', label: 'Annulé' },
  ];

  const changerStatut = async (devisId, nouveauStatut) => {
    const s = STATUTS.find(s => s.value === nouveauStatut);
    const label = s ? `${s.icon} ${s.label}` : nouveauStatut;
    if (!window.confirm(`Changer le statut en « ${label} » ?`)) return;
    setChangingStatut(devisId);
    try {
      await axios.patch(
        `${API_URL}/api/devis/${devisId}/statut`,
        { statut: nouveauStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await chargerDevis();
    } catch (err) {
      console.error('❌ Erreur changement statut:', err);
      alert(err.response?.data?.message || 'Erreur lors du changement de statut');
    } finally {
      setChangingStatut(null);
    }
  };

  const telechargerPDF = async (devisId, numeroDevis) => {
    try {
      const response = await axios.get(`${API_URL}/api/devis/admin/${devisId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${numeroDevis || devisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Erreur téléchargement PDF:', err);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const STATUT_CONFIG = {
    'brouillon':                 { icon: '📝', label: 'Brouillon',                   color: '#95a5a6' },
    'soumis':                    { icon: '📤', label: 'Soumis',                       color: '#3498db' },
    'en_etude':                  { icon: '🔍', label: 'En étude',                     color: '#9b59b6' },
    'modifie_admin':             { icon: '✏️',  label: 'Modifié admin',               color: '#e67e22' },
    'attente_validation_client': { icon: '⏳', label: 'Attente client',               color: '#f39c12' },
    'valide_client':             { icon: '👍', label: 'Validé client',                color: '#1abc9c' },
    'accepte':                   { icon: '✅', label: 'Accepté',                      color: '#27ae60' },
    'entretien_prevu':           { icon: '📅', label: 'Entretien prévu',              color: '#2980b9' },
    'entretien_effectue':        { icon: '🤝', label: 'Entretien effectué',           color: '#16a085' },
    'devis_final':               { icon: '📋', label: 'Devis final',                  color: '#8e44ad' },
    'transforme_contrat':        { icon: '📜', label: 'Contrat',                      color: '#2c3e50' },
    'contrat_signe':             { icon: '🖊️',  label: 'Contrat signé',               color: '#27ae60' },
    'valide_final':              { icon: '🏆', label: 'Validé final',                 color: '#f1c40f' },
    'refuse':                    { icon: '❌', label: 'Refusé',                       color: '#e74c3c' },
    'expire':                    { icon: '⌛', label: 'Expiré',                       color: '#7f8c8d' },
    'annule':                    { icon: '🚫', label: 'Annulé',                       color: '#c0392b' },
  };

  const getStatutBadge = (statut) => {
    const cfg = STATUT_CONFIG[statut] || { icon: '❓', label: statut, color: '#95a5a6' };
    return (
      <span className="statut-badge" style={{ backgroundColor: cfg.color }}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatMontant = (montant) => {
    if (!montant && montant !== 0) return 'À définir';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  // Filtrer les devis
  const devisFiltres = devis.filter(d => {
    const matchStatut = filtreStatut === 'tous' || d.statut === filtreStatut;
    const matchRecherche = !recherche || 
      d.numeroDevis?.toLowerCase().includes(recherche.toLowerCase()) ||
      d.evenement?.type?.toLowerCase().includes(recherche.toLowerCase()) ||
      d.client?.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      d.client?.prenom?.toLowerCase().includes(recherche.toLowerCase());
    return matchStatut && matchRecherche;
  });

  if (loading) {
    return (
      <div className="mes-devis-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des devis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mes-devis-page">
      <div className="page-container">
        {/* En-tête */}
        <div className="page-header">
          <div>
            <h1>📋 Gestion des Devis</h1>
            <p>Validez et gérez tous les devis clients</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Retour Dashboard
          </button>
        </div>

        {/* Filtres */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Rechercher par numéro, client, type..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs" style={{ flexWrap: 'wrap' }}>
            <button className={`filter-tab ${filtreStatut === 'tous' ? 'active' : ''}`} onClick={() => setFiltreStatut('tous')}>Tous ({devis.length})</button>
            <button className={`filter-tab ${filtreStatut === 'brouillon' ? 'active' : ''}`} onClick={() => setFiltreStatut('brouillon')}>📝 Brouillon</button>
            <button className={`filter-tab ${filtreStatut === 'soumis' ? 'active' : ''}`} onClick={() => setFiltreStatut('soumis')}>📤 Soumis</button>
            <button className={`filter-tab ${filtreStatut === 'en_etude' ? 'active' : ''}`} onClick={() => setFiltreStatut('en_etude')}>🔍 En étude</button>
            <button className={`filter-tab ${filtreStatut === 'accepte' ? 'active' : ''}`} onClick={() => setFiltreStatut('accepte')}>✅ Accepté</button>
            <button className={`filter-tab ${filtreStatut === 'refuse' ? 'active' : ''}`} onClick={() => setFiltreStatut('refuse')}>❌ Refusé</button>
            <button className={`filter-tab ${filtreStatut === 'annule' ? 'active' : ''}`} onClick={() => setFiltreStatut('annule')}>🚫 Annulé</button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Liste des devis */}
        {devisFiltres.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Aucun devis trouvé</h3>
            <p>
              {devis.length === 0 
                ? "Aucun devis n'a encore été créé."
                : "Aucun devis ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          <div className="devis-grid">
            {devisFiltres.map(d => (
              <div key={d._id} className="devis-card">
                {/* En-tête carte */}
                <div className="devis-card-header">
                  <div>
                    <h3 className="devis-numero">{d.numeroDevis}</h3>
                    <p className="devis-type">{d.evenement?.type || 'Événement'}</p>
                    <p style={{ fontSize: '0.85rem', color: '#b0b0b0', margin: '0.3rem 0 0 0' }}>
                      Client: {d.client?.prenom} {d.client?.nom}
                    </p>
                  </div>
                  {getStatutBadge(d.statut)}
                </div>

                {/* Détails */}
                <div className="devis-card-body">
                  <div className="devis-info-row">
                    <span className="info-label">📅 Date événement:</span>
                    <span className="info-value">{formatDate(d.evenement?.date)}</span>
                  </div>

                  <div className="devis-info-row">
                    <span className="info-label">📍 Lieu:</span>
                    <span className="info-value">{d.evenement?.lieu?.nom || 'Non précisé'}</span>
                  </div>

                  <div className="devis-info-row">
                    <span className="info-label">👥 Invités:</span>
                    <span className="info-value">
                      {d.evenement?.nbInvites || d.evenement?.nbInvitesEstime || 'Non précisé'}
                    </span>
                  </div>

                  {d.prestations && d.prestations.length > 0 && (
                    <div className="devis-info-row">
                      <span className="info-label">🎵 Prestations:</span>
                      <span className="info-value">{d.prestations.length} sélectionnée(s)</span>
                    </div>
                  )}

                  <div className="devis-info-row">
                    <span className="info-label">📧 Email client:</span>
                    <span className="info-value">{d.client?.email || 'N/A'}</span>
                  </div>

                  <div className="devis-info-row">
                    <span className="info-label">📞 Téléphone:</span>
                    <span className="info-value">{d.client?.telephone || 'N/A'}</span>
                  </div>

                  {d.montants && (
                    <div className="devis-montant">
                      <span className="montant-label">Total TTC:</span>
                      <span className="montant-value">
                        {formatMontant(d.montants.totalTTC)}
                      </span>
                    </div>
                  )}

                  {d.createdAt && (
                    <div className="devis-date-creation">
                      Créé le {formatDate(d.createdAt)}
                    </div>
                  )}
                </div>

                {/* Actions ADMIN */}
                <div className="devis-card-actions">
                  {/* Liste déroulante changement de statut */}
                  <div style={{ width: '100%', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>🔄 Changer le statut :</label>
                    <select
                      value={d.statut}
                      disabled={changingStatut === d._id}
                      onChange={(e) => changerStatut(d._id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: `2px solid ${(STATUT_CONFIG[d.statut] || {}).color || '#ccc'}`,
                        background: '#1a1a2e',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: changingStatut === d._id ? 'wait' : 'pointer',
                        outline: 'none',
                      }}
                    >
                      {STATUTS.map(s => (
                        <option key={s.value} value={s.value}>
                          {s.icon} {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {d.statut !== 'brouillon' && (
                    <button
                      className="btn-action btn-download"
                      onClick={() => telechargerPDF(d._id, d.numeroDevis)}
                    >
                      📄 Télécharger PDF
                    </button>
                  )}

                  <button
                    className="btn-action btn-view"
                    onClick={() => navigate(`/admin/devis/${d._id}`)}
                  >
                    👁️ Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {devis.length > 0 && (
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{devis.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{devis.filter(d => d.statut === 'brouillon').length}</span>
              <span className="stat-label">📝 Brouillons</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{devis.filter(d => d.statut === 'soumis').length}</span>
              <span className="stat-label">📤 Soumis</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{devis.filter(d => d.statut === 'accepte').length}</span>
              <span className="stat-label">✅ Acceptés</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{devis.filter(d => ['refuse','annule'].includes(d.statut)).length}</span>
              <span className="stat-label">❌ Refusés/Annulés</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionDevis;

