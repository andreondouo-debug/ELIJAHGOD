import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ClientContext } from '../../context/ClientContext';
import './DevisConfirmation.css';

/**
 * ✅ PAGE DE CONFIRMATION APRÈS VALIDATION DU DEVIS
 * Affiche le récap et permet de télécharger le PDF
 */
function DevisConfirmation() {
  const { devisId } = useParams();
  const location = useLocation();
  const { token, API_URL } = useContext(ClientContext);

  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState('');

  // Récupérer le message depuis le state de navigation
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
          responseType: 'blob' // Important pour télécharger le fichier
        }
      );

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${numeroDevis || devisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('✅ PDF téléchargé avec succès');
    } catch (err) {
      console.error('❌ Erreur téléchargement PDF:', err);
      setError('Impossible de télécharger le PDF. Veuillez réessayer.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="devis-confirmation-loading">
        <div className="spinner"></div>
        <p>Chargement de votre devis...</p>
      </div>
    );
  }

  return (
    <div className="devis-confirmation-page">
      <div className="confirmation-container">
        
        {/* En-tête de confirmation */}
        <div className="confirmation-header">
          <div className="success-icon-large">✅</div>
          <h1>Devis soumis avec succès !</h1>
          <p className="confirmation-message">{confirmationMessage}</p>
          {numeroDevis && (
            <div className="numero-devis">
              <span className="label">Numéro de devis :</span>
              <span className="numero">{numeroDevis}</span>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="confirmation-actions">
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
              <>
                📄 Télécharger le devis en PDF
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>

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
              <div className="summary-card">
                <div className="card-icon">🎉</div>
                <div className="card-content">
                  <strong>{devis.evenement?.type}</strong>
                  <p>{devis.evenement?.titre}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon">📅</div>
                <div className="card-content">
                  <strong>Date</strong>
                  <p>
                    {devis.evenement?.date && new Date(devis.evenement.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon">📍</div>
                <div className="card-content">
                  <strong>Lieu</strong>
                  <p>{devis.evenement?.lieu?.ville || 'À définir'}</p>
                </div>
              </div>

              {devis.montants?.totalTTC && (
                <div className="summary-card highlight">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <strong>Estimation</strong>
                    <p>{devis.montants.totalTTC}€ TTC</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email de confirmation */}
        <div className="email-info">
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
        <div className="navigation-buttons">
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
        <div className="help-section">
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
