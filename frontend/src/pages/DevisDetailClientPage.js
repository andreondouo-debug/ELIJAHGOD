import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ClientContext } from '../context/ClientContext';
import { API_URL } from '../config';
import './DevisDetailClientPage.css';

/**
 * 📋 PAGE DÉTAIL D'UN DEVIS — VUE CLIENT
 * Affiche toutes les informations d'un devis : événement, prestations, montants, statut
 */
function DevisDetailClientPage() {
  const { devisId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useContext(ClientContext);

  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/client/login');
      return;
    }
    chargerDevis();
  }, [devisId, isAuthenticated]);

  const chargerDevis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/devis/${devisId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevis(response.data.devis);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Ce devis est introuvable.');
      } else if (err.response?.status === 403) {
        setError("Vous n'êtes pas autorisé à consulter ce devis.");
      } else {
        setError('Impossible de charger le devis. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const soumettre = async () => {
    if (!window.confirm('Soumettre ce devis à notre équipe pour étude ?')) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/api/devis/${devisId}/soumettre`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await chargerDevis();
      alert('✅ Devis soumis avec succès ! Notre équipe vous contactera rapidement.');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const supprimer = async () => {
    if (!window.confirm(`Supprimer définitivement le brouillon ${devis.numeroDevis} ? Cette action est irréversible.`)) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/devis/${devisId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/client/mes-devis', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const telechargerPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await axios.get(`${API_URL}/api/devis/${devisId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${devis.numeroDevis}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const formatMontant = (montant) => {
    if (montant == null) return 'À définir';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  const getStatutInfo = (statut) => {
    const map = {
      brouillon:   { icon: '📝', label: 'Brouillon',   color: '#95a5a6', desc: 'Votre devis est en cours de rédaction. Soumettez-le pour qu\'il soit examiné.' },
      envoye:      { icon: '📤', label: 'Envoyé',      color: '#3498db', desc: 'Votre devis a été soumis. Notre équipe va l\'examiner.' },
      en_attente:  { icon: '⏳', label: 'En attente',  color: '#f39c12', desc: 'Votre devis est en attente de traitement par notre équipe.' },
      en_etude:    { icon: '🔍', label: 'En étude',    color: '#9b59b6', desc: 'Notre équipe étudie votre demande. Nous vous recontacterons bientôt.' },
      accepte:     { icon: '✅', label: 'Accepté',     color: '#27ae60', desc: 'Félicitations ! Votre devis a été accepté. Versez l\'acompte pour confirmer.' },
      refuse:      { icon: '❌', label: 'Refusé',      color: '#e74c3c', desc: 'Votre devis n\'a pas pu être accepté. Contactez-nous pour plus d\'informations.' },
      annule:      { icon: '🚫', label: 'Annulé',      color: '#7f8c8d', desc: 'Ce devis a été annulé.' },
      en_cours:    { icon: '🔄', label: 'En cours',    color: '#1abc9c', desc: 'La prestation est en cours de réalisation.' },
      termine:     { icon: '🎉', label: 'Terminé',     color: '#16a085', desc: 'La prestation a été réalisée avec succès !' }
    };
    return map[statut] || { icon: '❓', label: statut, color: '#95a5a6', desc: '' };
  };

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="devis-detail-page">
        <div className="detail-loading">
          <div className="spinner"></div>
          <p>Chargement du devis...</p>
        </div>
      </div>
    );
  }

  /* ── ERREUR ── */
  if (error || !devis) {
    return (
      <div className="devis-detail-page">
        <div className="detail-error">
          <div className="error-icon">⚠️</div>
          <h2>Impossible d'afficher ce devis</h2>
          <p>{error}</p>
          <Link to="/client/mes-devis" className="btn-back">← Retour à mes devis</Link>
        </div>
      </div>
    );
  }

  const statutInfo = getStatutInfo(devis.statut);
  const acompteMontant = devis.montants?.acompte?.montant || (devis.montants?.totalTTC * 0.3) || 0;

  return (
    <div className="devis-detail-page">
      <div className="detail-container">

        {/* ── NAVIGATION ── */}
        <div className="detail-breadcrumb">
          <Link to="/client/mes-devis">← Mes devis</Link>
          <span> / </span>
          <span>{devis.numeroDevis}</span>
        </div>

        {/* ── EN-TÊTE ── */}
        <div className="detail-header">
          <div className="detail-header-left">
            <h1>Devis {devis.numeroDevis}</h1>
            <p className="detail-event-type">{devis.evenement?.type || 'Événement'}</p>
            <p className="detail-created">Créé le {formatDate(devis.dateCreation)}</p>
          </div>
          <div
            className="detail-statut-badge"
            style={{ background: `${statutInfo.color}22`, border: `2px solid ${statutInfo.color}` }}
          >
            <span style={{ color: statutInfo.color }}>
              {statutInfo.icon} {statutInfo.label}
            </span>
          </div>
        </div>

        {/* ── MESSAGE STATUT ── */}
        {statutInfo.desc && (
          <div className="detail-statut-desc" style={{ borderLeftColor: statutInfo.color }}>
            {statutInfo.desc}
          </div>
        )}

        {/* ── DEUX COLONNES ── */}
        <div className="detail-grid">

          {/* ── COLONNE GAUCHE : INFO ÉVÉNEMENT ── */}
          <div className="detail-card">
            <h2 className="detail-card-title">📅 Événement</h2>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="dr-label">Type</span>
                <span className="dr-value">{devis.evenement?.type || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="dr-label">Date</span>
                <span className="dr-value">{formatDate(devis.evenement?.date)}</span>
              </div>
              <div className="detail-row">
                <span className="dr-label">Lieu</span>
                <span className="dr-value">{devis.evenement?.lieu?.nom || '—'}</span>
              </div>
              {devis.evenement?.lieu?.adresse && (
                <div className="detail-row">
                  <span className="dr-label">Adresse</span>
                  <span className="dr-value">{devis.evenement.lieu.adresse}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="dr-label">Invités</span>
                <span className="dr-value">
                  {devis.evenement?.nbInvites || devis.evenement?.nbInvitesEstime || '—'}
                </span>
              </div>
              {devis.evenement?.duree && (
                <div className="detail-row">
                  <span className="dr-label">Durée</span>
                  <span className="dr-value">{devis.evenement.duree}h</span>
                </div>
              )}
            </div>
          </div>

          {/* ── COLONNE DROITE : MONTANTS ── */}
          {devis.montants && (
            <div className="detail-card">
              <h2 className="detail-card-title">💰 Montants</h2>
              <div className="detail-rows">
                {(devis.montants.totalAvantRemise || 0) > 0 && (
                  <div className="detail-row">
                    <span className="dr-label">Sous-total HT</span>
                    <span className="dr-value">{formatMontant(devis.montants.totalAvantRemise)}</span>
                  </div>
                )}
                {(devis.montants.fraisKilometriques?.montant || 0) > 0 && (
                  <div className="detail-row">
                    <span className="dr-label">🚗 Frais kilométriques</span>
                    <span className="dr-value">+ {formatMontant(devis.montants.fraisKilometriques.montant)}</span>
                  </div>
                )}
                {(devis.montants.montantRemise || 0) > 0 && (
                  <div className="detail-row">
                    <span className="dr-label">
                      🎁 Remise
                      {devis.montants.remise?.type === 'pourcentage'
                        ? ` (${devis.montants.remise.valeur}%)`
                        : ' (montant fixe)'}
                      {devis.montants.remise?.raison ? ` — ${devis.montants.remise.raison}` : ''}
                    </span>
                    <span className="dr-value remise">− {formatMontant(devis.montants.montantRemise)}</span>
                  </div>
                )}
                {(devis.montants.montantRemise || 0) > 0 && (
                  <div className="detail-row">
                    <span className="dr-label">Total HT après remise</span>
                    <span className="dr-value">{formatMontant(devis.montants.totalFinal)}</span>
                  </div>
                )}
              </div>

              <div className="detail-total">
                <span>Total TTC</span>
                <span className="total-ttc">{formatMontant(devis.montants.totalTTC)}</span>
              </div>

              {devis.montants.totalTTC > 0 && (
                <div className="detail-acompte">
                  <div className="acompte-header">
                    <span>💳 Acompte à verser (30 %)</span>
                    <span className="acompte-montant">{formatMontant(acompteMontant)}</span>
                  </div>
                  <p className="acompte-info">
                    L'acompte confirme votre réservation. Le solde ({formatMontant(devis.montants.totalTTC - acompteMontant)}) est dû avant la prestation.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PRESTATIONS ── */}
        {devis.prestations && devis.prestations.length > 0 && (
          <div className="detail-card detail-full-width">
            <h2 className="detail-card-title">🎵 Prestations sélectionnées</h2>
            <div className="prestations-list">
              {devis.prestations.map((item, idx) => (
                <div key={idx} className="prestation-item">
                  <div className="prestation-name">
                    {item.prestation?.nom || item.nom || `Prestation ${idx + 1}`}
                  </div>
                  {item.prixUnitaire > 0 && (
                    <div className="prestation-prix">{formatMontant(item.prixUnitaire)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {devis.notes && (
          <div className="detail-card detail-full-width">
            <h2 className="detail-card-title">📝 Notes & demandes particulières</h2>
            <p className="detail-notes">{devis.notes}</p>
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div className="detail-actions">
          {devis.statut === 'brouillon' && (
            <>
              <button
                className="btn-detail btn-submit"
                onClick={soumettre}
                disabled={submitting}
              >
                {submitting ? '⏳ Envoi en cours...' : '📤 Soumettre le devis'}
              </button>
              <button
                className="btn-detail btn-delete"
                onClick={supprimer}
                disabled={deleting}
              >
                {deleting ? '⏳ Suppression...' : '🗑️ Supprimer ce brouillon'}
              </button>
            </>
          )}

          {devis.statut !== 'brouillon' && (
            <button
              className="btn-detail btn-pdf"
              onClick={telechargerPDF}
              disabled={downloadingPDF}
            >
              {downloadingPDF ? '⏳ Téléchargement...' : '📄 Télécharger le PDF'}
            </button>
          )}

          <Link to="/client/mes-devis" className="btn-detail btn-back-link">
            ← Retour à mes devis
          </Link>
        </div>

      </div>
    </div>
  );
}

export default DevisDetailClientPage;
