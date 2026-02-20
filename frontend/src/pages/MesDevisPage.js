import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClientContext } from '../context/ClientContext';
import './MesDevisPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * 📋 PAGE SUIVI DES DEVIS CLIENT
 * Affiche tous les devis du client connecté avec filtres et actions
 */
function MesDevisPage() {
  const { client, isAuthenticated, token } = useContext(ClientContext);
  const navigate = useNavigate();
  
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/client/login');
      return;
    }
    chargerDevis();
  }, [isAuthenticated, navigate]);

  const chargerDevis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/devis/client/mes-devis`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📋 Devis chargés:', response.data);
      setDevis(response.data.devis || []);
      setError('');
    } catch (err) {
      console.error('❌ Erreur chargement devis:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const telechargerPDF = async (devisId, numeroDevis) => {
    try {
      const response = await axios.get(`${API_URL}/api/devis/${devisId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${numeroDevis}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Erreur téléchargement PDF:', err);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'brouillon': { icon: '📝', label: 'Brouillon', color: '#95a5a6' },
      'envoye': { icon: '📤', label: 'Envoyé', color: '#3498db' },
      'en_attente': { icon: '⏳', label: 'En attente', color: '#f39c12' },
      'accepte': { icon: '✅', label: 'Accepté', color: '#27ae60' },
      'refuse': { icon: '❌', label: 'Refusé', color: '#e74c3c' },
      'annule': { icon: '🚫', label: 'Annulé', color: '#7f8c8d' },
      'en_cours': { icon: '🔄', label: 'En cours', color: '#9b59b6' },
      'termine': { icon: '🎉', label: 'Terminé', color: '#16a085' }
    };
    
    const badge = badges[statut] || { icon: '❓', label: statut, color: '#95a5a6' };
    return (
      <span className="statut-badge" style={{ backgroundColor: badge.color }}>
        {badge.icon} {badge.label}
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
      d.evenement?.lieu?.nom?.toLowerCase().includes(recherche.toLowerCase());
    return matchStatut && matchRecherche;
  });

  if (loading) {
    return (
      <div className="mes-devis-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement de vos devis...</p>
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
            <h1>📋 Mes Devis</h1>
            <p>Suivez l'état de vos demandes de devis et téléchargez les documents</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => navigate('/devis/nouveau')}
          >
            ➕ Nouveau devis
          </button>
        </div>

        {/* Filtres */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Rechercher par numéro, type ou lieu..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filtreStatut === 'tous' ? 'active' : ''}`}
              onClick={() => setFiltreStatut('tous')}
            >
              Tous ({devis.length})
            </button>
            <button
              className={`filter-tab ${filtreStatut === 'brouillon' ? 'active' : ''}`}
              onClick={() => setFiltreStatut('brouillon')}
            >
              📝 Brouillon
            </button>
            <button
              className={`filter-tab ${filtreStatut === 'en_attente' ? 'active' : ''}`}
              onClick={() => setFiltreStatut('en_attente')}
            >
              ⏳ En attente
            </button>
            <button
              className={`filter-tab ${filtreStatut === 'accepte' ? 'active' : ''}`}
              onClick={() => setFiltreStatut('accepte')}
            >
              ✅ Accepté
            </button>
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
                ? "Vous n'avez pas encore créé de devis. Commencez dès maintenant !"
                : "Aucun devis ne correspond à vos critères de recherche."
              }
            </p>
            {devis.length === 0 && (
              <button 
                className="btn-primary"
                onClick={() => navigate('/devis/nouveau')}
              >
                ➕ Créer mon premier devis
              </button>
            )}
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

                  {d.montants && (
                    <div className="devis-montant">
                      <span className="montant-label">Total TTC:</span>
                      <span className="montant-value">
                        {formatMontant(d.montants.totalTTC)}
                      </span>
                    </div>
                  )}

                  {d.dateCreation && (
                    <div className="devis-date-creation">
                      Créé le {formatDate(d.dateCreation)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="devis-card-actions">
                  {d.statut !== 'brouillon' && (
                    <button
                      className="btn-action btn-download"
                      onClick={() => telechargerPDF(d._id, d.numeroDevis)}
                    >
                      📄 Télécharger PDF
                    </button>
                  )}
                  
                  {d.statut === 'brouillon' && (
                    <button
                      className="btn-action btn-continue"
                      onClick={() => navigate(`/devis/${d._id}/continuer`)}
                    >
                      ✏️ Continuer
                    </button>
                  )}

                  <button
                    className="btn-action btn-view"
                    onClick={() => navigate(`/devis/${d._id}/details`)}
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
              <span className="stat-label">Devis total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {devis.filter(d => d.statut === 'en_attente').length}
              </span>
              <span className="stat-label">En attente</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {devis.filter(d => d.statut === 'accepte').length}
              </span>
              <span className="stat-label">Acceptés</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MesDevisPage;
