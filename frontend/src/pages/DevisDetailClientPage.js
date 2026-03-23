import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ClientContext } from '../context/ClientContext';
import { API_URL } from '../config';
import SignaturePad from '../components/SignaturePad';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import './DevisDetailClientPage.css';
import '../components/SignaturePad.css';

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
  const [submitting, setSubmitting]           = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [downloadingPDF, setDownloadingPDF]   = useState(false);
  const [downloadingContrat, setDownloadingContrat] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  useBodyScrollLock(showSignaturePad);
  const [signing, setSigning]                   = useState(false);
  const [signFeedback, setSignFeedback]         = useState(null); // { type: 'success'|'error', msg }
  const [signataire, setSignataire]             = useState('');
  const [consentements, setConsentements]       = useState({
    cgv: false,
    traitementDonnees: false,
    annulation: false
  });

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

  /* ── Initialiser le nom du signataire depuis le profil client ── */
  useEffect(() => {
    if (devis && !signataire) {
      const prenom = devis.client?.prenom || '';
      const nom    = devis.client?.nom    || '';
      setSignataire(`${prenom} ${nom}`.trim());
    }
  }, [devis]);

  const signerContrat = async (signatureData) => {
    // Vérifier consentements
    if (!consentements.cgv || !consentements.traitementDonnees || !consentements.annulation) {
      setSignFeedback({ type: 'error', msg: 'Vous devez accepter toutes les conditions avant de signer.' });
      return;
    }
    if (!signataire.trim()) {
      setSignFeedback({ type: 'error', msg: 'Veuillez saisir votre nom complet.' });
      return;
    }
    setSigning(true);
    setSignFeedback(null);
    try {
      await axios.post(
        `${API_URL}/api/devis/${devisId}/signer`,
        {
          signatureData,
          partie: 'client',
          signataire: signataire.trim(),
          consentement: consentements
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSignaturePad(false);
      setSignFeedback({ type: 'success', msg: '✅ Votre signature a bien été enregistrée ! Le prestataire va maintenant valider le contrat.' });
      await chargerDevis();
    } catch (err) {
      setSignFeedback({ type: 'error', msg: err.response?.data?.message || 'Erreur lors de la signature. Réessayez.' });
    } finally {
      setSigning(false);
    }
  };

  const telechargerContrat = async () => {
    setDownloadingContrat(true);
    try {
      const response = await axios.get(`${API_URL}/api/devis/${devisId}/contrat`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      const numDoc = devis.numeroContrat || devis.numeroDevis;
      link.setAttribute('download', `contrat-${numDoc}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement du contrat');
    } finally {
      setDownloadingContrat(false);
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
      brouillon:          { icon: '📝', label: 'Brouillon',        color: '#95a5a6', desc: 'Votre devis est en cours de rédaction. Soumettez-le pour qu\'il soit examiné.' },
      soumis:             { icon: '📤', label: 'Soumis',            color: '#3498db', desc: 'Votre devis a été soumis. Notre équipe va l\'examiner.' },
      envoye:             { icon: '📤', label: 'Envoyé',            color: '#3498db', desc: 'Votre devis a été soumis. Notre équipe va l\'examiner.' },
      en_attente:         { icon: '⏳', label: 'En attente',        color: '#f39c12', desc: 'Votre devis est en attente de traitement par notre équipe.' },
      en_etude:           { icon: '🔍', label: 'En étude',          color: '#9b59b6', desc: 'Notre équipe étudie votre demande. Nous vous recontacterons bientôt.' },
      accepte:            { icon: '✅', label: 'Accepté',           color: '#27ae60', desc: 'Félicitations ! Votre devis a été accepté. Un contrat va vous être envoyé.' },
      valide_client:      { icon: '✅', label: 'Validé',            color: '#27ae60', desc: 'Votre devis est validé. Le contrat est en cours de préparation.' },
      devis_final:        { icon: '📌', label: 'Devis final',       color: '#2980b9', desc: 'Le devis final est prêt. Un contrat va être généré.' },
      transforme_contrat: { icon: '📜', label: 'Contrat généré',    color: '#c9a227', desc: 'Votre contrat est prêt ! Téléchargez-le, signez-le et renvoyez-le.' },
      contrat_signe:      { icon: '✍️', label: 'Contrat signé',     color: '#27ae60', desc: 'Votre contrat a été signé. La prestation est confirmée !' },
      valide_final:       { icon: '🏆', label: 'Confirmé',          color: '#16a085', desc: 'Contrat validé par les deux parties. À bientôt pour votre événement !' },
      refuse:             { icon: '❌', label: 'Refusé',            color: '#e74c3c', desc: 'Votre devis n\'a pas pu être accepté. Contactez-nous pour plus d\'informations.' },
      annule:             { icon: '🚫', label: 'Annulé',            color: '#7f8c8d', desc: 'Ce devis a été annulé.' },
      en_cours:           { icon: '🔄', label: 'En cours',          color: '#1abc9c', desc: 'La prestation est en cours de réalisation.' },
      termine:            { icon: '🎉', label: 'Terminé',           color: '#16a085', desc: 'La prestation a été réalisée avec succès !' }
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

        {/* ── SECTION SIGNATURE NUMÉRIQUE ── */}
        {devis.statut === 'transforme_contrat' && (
          <div className="detail-card detail-full-width signature-section">
            <h3>✍️ Signature numérique du contrat</h3>
            <p className="sig-desc">
              Votre contrat est prêt. Lisez-le attentivement, puis signez-le ci-dessous pour confirmer votre commande.
              Vous pouvez aussi le télécharger avant de signer.
            </p>

            {signFeedback && (
              <div className={`sig-feedback ${signFeedback.type}`}>{signFeedback.msg}</div>
            )}

            {!showSignaturePad ? (
              <button
                type="button"
                className="btn-detail btn-submit"
                onClick={() => setShowSignaturePad(true)}
                style={{ background: 'linear-gradient(135deg, #c9a227, #e2b93b)', color: '#1a1a2e', border: 'none' }}
              >
                ✍️ Signer le contrat
              </button>
            ) : (
              <>
                {/* Nom signataire */}
                <label className="sig-input-label">Votre nom complet *</label>
                <input
                  type="text"
                  className="sig-input"
                  value={signataire}
                  onChange={e => setSignataire(e.target.value)}
                  placeholder="Prénom Nom"
                />

                {/* Consentements */}
                <div className="sig-consents">
                  <label className="sig-consent-item">
                    <input
                      type="checkbox"
                      checked={consentements.cgv}
                      onChange={e => setConsentements(p => ({ ...p, cgv: e.target.checked }))}
                    />
                    J'ai lu et j'accepte les{' '}
                    <a href="/cgv" target="_blank" rel="noreferrer">conditions générales de vente</a>.
                  </label>
                  <label className="sig-consent-item">
                    <input
                      type="checkbox"
                      checked={consentements.traitementDonnees}
                      onChange={e => setConsentements(p => ({ ...p, traitementDonnees: e.target.checked }))}
                    />
                    J'accepte le traitement de mes données personnelles conformément à la politique de confidentialité.
                  </label>
                  <label className="sig-consent-item">
                    <input
                      type="checkbox"
                      checked={consentements.annulation}
                      onChange={e => setConsentements(p => ({ ...p, annulation: e.target.checked }))}
                    />
                    J'ai pris connaissance des conditions d'annulation décrites dans le contrat.
                  </label>
                </div>

                {signing ? (
                  <p style={{ color: '#555', textAlign: 'center' }}>⏳ Enregistrement de la signature...</p>
                ) : (
                  <SignaturePad
                    label="Tracez votre signature dans le cadre ci-dessous"
                    onConfirm={signerContrat}
                    onCancel={() => setShowSignaturePad(false)}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Badge signature déjà effectuée */}
        {['contrat_signe', 'valide_final'].includes(devis.statut) && devis.signatures?.client?.dateSignature && (
          <div className="detail-card detail-full-width" style={{ padding: '20px 28px' }}>
            <h3 style={{ margin: '0 0 10px', color: '#1a1a2e' }}>✍️ Signature</h3>
            <div className="sig-signed-badge">
              ✅ Contrat signé le {new Date(devis.signatures.client.dateSignature).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              {devis.signatures.client.signePar && <> par <strong>{devis.signatures.client.signePar}</strong></>}
            </div>
          </div>
        )}

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
              {downloadingPDF ? '⏳ Téléchargement...' : '📄 Télécharger le devis PDF'}
            </button>
          )}

          {/* Bouton contrat — visible quand le contrat est prêt */}
          {['transforme_contrat', 'contrat_signe', 'valide_final'].includes(devis.statut) && (
            <button
              className="btn-detail btn-submit"
              onClick={telechargerContrat}
              disabled={downloadingContrat}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #252540 100%)',
                color: '#c9a227',
                border: '2px solid #c9a227'
              }}
            >
              {downloadingContrat ? '⏳ Téléchargement...' : '📜 Télécharger mon contrat'}
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
