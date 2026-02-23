import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ClientContext } from '../../context/ClientContext';
import './DevisConfirmation.css';

/**
 * ✅ PAGE DE CONFIRMATION APRÈS VALIDATION DU DEVIS
 * - Message de remerciement personnalisé
 * - Détail des prestations sélectionnées
 * - Option d'impression avec filigrane "DEVIS NON VALIDÉ"
 */
function DevisConfirmation() {
  const { devisId } = useParams();
  const location = useLocation();
  const { token, API_URL } = useContext(ClientContext);

  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState('');

  const confirmationMessage = location.state?.message || '✅ Votre devis a été soumis avec succès !';
  const numeroDevis = location.state?.numeroDevis;

  useEffect(() => {
    if (devisId) {
      chargerDevis();
    }
  }, [devisId]);

  const chargerDevis = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${API_URL}/api/devis/${devisId}`,
        { headers }
      );
      setDevis(response.data.devis);
    } catch (err) {
      console.error('❌ Erreur chargement devis:', err);
      setError('Impossible de charger les détails du devis');
    } finally {
      setLoading(false);
    }
  };

  const telechargerPDF = async () => {
    setDownloadingPDF(true);
    setError('');

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/api/devis/${devisId}/pdf`,
        {
          headers,
          responseType: 'blob'
        }
      );

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
      setError('Impossible de télécharger le PDF. Veuillez réessayer.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const imprimerDevis = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="devis-confirmation-loading">
        <div className="spinner"></div>
        <p>Chargement de votre devis...</p>
      </div>
    );
  }

  const prenom = devis?.client?.prenom || devis?.informationsContact?.prenom || '';
  const eventType = devis?.evenement?.type || '';
  const prestations = devis?.prestations || [];
  const totalTTC = devis?.montants?.totalTTC;
  const totalHT = devis?.montants?.totalFinal;
  const sousTotalPrestations = devis?.montants?.sousTotalPrestations;

  return (
    <div className="devis-confirmation-page">
      <div className="confirmation-container" id="printable-devis">

        {/* Filigrane impression uniquement */}
        <div className="print-watermark" aria-hidden="true">DEVIS NON VALIDÉ</div>

        {/* En-tête de confirmation */}
        <div className="confirmation-header">
          <div className="success-icon-large">✅</div>
          <h1>Demande de devis envoyée !</h1>

          {/* Message de remerciement personnalisé */}
          <div className="thank-you-message">
            <p className="thank-you-main">
              {prenom ? `Merci ${prenom} pour votre confiance !` : 'Merci pour votre confiance !'} 🌟
            </p>
            <p className="thank-you-sub">
              Notre équipe est ravie de vous accompagner{eventType ? ` pour votre ${eventType.toLowerCase()}` : ''}.
              Nous analysons votre demande avec soin et vous contacterons très prochainement
              (sous 24–48h) pour en discuter et finaliser tous les détails avec vous.
            </p>
          </div>

          {numeroDevis && (
            <div className="numero-devis">
              <span className="label">Numéro de devis :</span>
              <span className="numero">{numeroDevis}</span>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="confirmation-actions no-print">
          <button
            onClick={telechargerPDF}
            disabled={downloadingPDF}
            className="btn-primary btn-large"
          >
            {downloadingPDF ? (
              <>
                <span className="spinner-small"></span>
                Génération du PDF...
              </>
            ) : (
              <>📄 Télécharger le devis en PDF</>
            )}
          </button>

          <button
            onClick={imprimerDevis}
            className="btn-secondary btn-large"
          >
            🖨️ Imprimer ce devis
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Détail des prestations sélectionnées */}
        {prestations.length > 0 && (
          <div className="prestations-detail">
            <h3>🎵 Prestations sélectionnées</h3>
            <table className="prestations-table">
              <thead>
                <tr>
                  <th>Prestation</th>
                  <th>Catégorie</th>
                  <th className="text-center">Qté</th>
                  <th className="text-right">Prix unitaire</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {prestations.map((p, i) => {
                  const nom = p.nom || p.prestation?.nom || p.prestation?.titre || '—';
                  const cat = p.categorie || p.prestation?.categorie || '—';
                  const pu = p.prixUnitaire || p.prestation?.prixBase || 0;
                  const qty = p.quantite || 1;
                  const total = p.prixTotal || pu * qty;
                  return (
                    <tr key={i}>
                      <td>{nom}</td>
                      <td><span className="cat-badge">{cat}</span></td>
                      <td className="text-center">{qty}</td>
                      <td className="text-right">{pu.toLocaleString('fr-FR')} €</td>
                      <td className="text-right total-cell">{total.toLocaleString('fr-FR')} €</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {sousTotalPrestations > 0 && (
                  <tr>
                    <td colSpan="4" className="text-right">Sous-total prestations :</td>
                    <td className="text-right total-cell">{sousTotalPrestations.toLocaleString('fr-FR')} €</td>
                  </tr>
                )}
                {totalHT > 0 && totalHT !== sousTotalPrestations && (
                  <tr>
                    <td colSpan="4" className="text-right">Total HT :</td>
                    <td className="text-right total-cell">{totalHT.toLocaleString('fr-FR')} €</td>
                  </tr>
                )}
                {totalTTC > 0 && (
                  <tr className="row-total-ttc">
                    <td colSpan="4" className="text-right"><strong>Total estimatif TTC :</strong></td>
                    <td className="text-right total-cell"><strong>{totalTTC.toLocaleString('fr-FR')} €</strong></td>
                  </tr>
                )}
              </tfoot>
            </table>
            <p className="disclaimer">
              * Ce montant est une estimation préliminaire. Le devis définitif sera établi par notre équipe après étude de votre demande.
            </p>
          </div>
        )}

        {/* Informations sur la suite */}
        <div className="next-steps">
          <h3>📋 Prochaines étapes</h3>
          <div className="steps-timeline">
            <div className="timeline-item completed">
              <div className="timeline-icon">✅</div>
              <div className="timeline-content">
                <strong>Devis soumis</strong>
                <p>Votre demande a été enregistrée avec succès</p>
              </div>
            </div>

            <div className="timeline-item pending">
              <div className="timeline-icon">🔍</div>
              <div className="timeline-content">
                <strong>Validation par notre équipe</strong>
                <p>Nous analysons votre demande (sous 48h)</p>
              </div>
            </div>

            <div className="timeline-item pending">
              <div className="timeline-icon">📧</div>
              <div className="timeline-content">
                <strong>Réception de votre devis</strong>
                <p>Vous recevrez le devis validé par email</p>
              </div>
            </div>

            {devis?.entretien?.demande && (
              <div className="timeline-item pending">
                <div className="timeline-icon">📞</div>
                <div className="timeline-content">
                  <strong>Entretien planifié</strong>
                  <p>
                    Un conseiller vous contactera pour votre entretien{' '}
                    {devis.entretien.type === 'physique' ? 'en personne' : 'en visioconférence'}
                  </p>
                </div>
              </div>
            )}

            <div className="timeline-item pending">
              <div className="timeline-icon">🎉</div>
              <div className="timeline-content">
                <strong>C'est parti !</strong>
                <p>Préparation de votre événement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif rapide */}
        {devis && (
          <div className="quick-summary">
            <h3>📌 Récapitulatif de votre demande</h3>
            <div className="summary-grid">
              {devis.evenement?.type && (
                <div className="summary-card">
                  <div className="card-icon">🎉</div>
                  <div className="card-content">
                    <strong>{devis.evenement.type}</strong>
                    <p>{devis.evenement.titre}</p>
                  </div>
                </div>
              )}

              {devis.evenement?.date && (
                <div className="summary-card">
                  <div className="card-icon">📅</div>
                  <div className="card-content">
                    <strong>Date</strong>
                    <p>
                      {new Date(devis.evenement.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {(devis.evenement?.lieu?.ville || devis.evenement?.lieu?.adresse) && (
                <div className="summary-card">
                  <div className="card-icon">📍</div>
                  <div className="card-content">
                    <strong>Lieu</strong>
                    <p>{devis.evenement.lieu.ville || devis.evenement.lieu.adresse}</p>
                  </div>
                </div>
              )}

              {totalTTC > 0 && (
                <div className="summary-card highlight">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <strong>Estimation</strong>
                    <p>{totalTTC.toLocaleString('fr-FR')} € TTC</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email de confirmation */}
        <div className="email-info no-print">
          <div className="email-icon">📧</div>
          <div className="email-content">
            <strong>Email de confirmation envoyé</strong>
            <p>
              Vérifiez votre boîte mail {devis?.client?.email && `(${devis.client.email})`}.
              Pensez à consulter vos spams si vous ne voyez rien.
            </p>
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="navigation-buttons no-print">
          <Link to="/" className="btn-secondary">
            ← Retour à l'accueil
          </Link>
          <Link to="/login" className="btn-outline">
            👤 Se connecter pour suivre mon devis
          </Link>
          <Link to="/contact" className="btn-outline">
            💬 Nous contacter
          </Link>
        </div>

        {/* Besoin d'aide */}
        <div className="help-section no-print">
          <h4>❓ Besoin d'aide ?</h4>
          <p>
            Notre équipe est à votre disposition pour répondre à toutes vos questions.
          </p>
          <div className="contact-methods">
            <a href="tel:+33123456789" className="contact-method">
              📞 01 23 45 67 89
            </a>
            <a href="mailto:contact@elijahgod.com" className="contact-method">
              📧 contact@elijahgod.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DevisConfirmation;
