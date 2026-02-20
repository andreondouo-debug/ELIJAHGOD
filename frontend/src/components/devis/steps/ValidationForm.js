import { useState } from 'react';
import './Validation.css';

/**
 * ✅ ÉTAPE 9: VALIDATION FINALE
 */
function ValidationForm({ data, montants, onSubmit, onPrevious, loading }) {
  const [acceptCGV, setAcceptCGV] = useState(false);
  const [acceptData, setAcceptData] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (acceptCGV && acceptData) {
      onSubmit();
    }
  };

  return (
    <div className="step-form-container">
      <div className="step-header">
        <h2>✅ Validation et soumission</h2>
        <p>Dernière étape avant de soumettre votre demande de devis</p>
      </div>

      <div className="validation-container">
        {/* Résumé rapide */}
        <div className="validation-summary">
          <h3>📋 Résumé de votre demande</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-icon">🎉</span>
              <div className="summary-content">
                <strong>{data.evenement?.type}</strong>
                <small>{data.evenement?.titre}</small>
              </div>
            </div>
            {data.evenement?.date && (
              <div className="summary-item">
                <span className="summary-icon">📅</span>
                <div className="summary-content">
                  <strong>
                    {new Date(data.evenement.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </strong>
                  <small>Date de l'événement</small>
                </div>
              </div>
            )}
            {data.prestations && data.prestations.length > 0 && (
              <div className="summary-item">
                <span className="summary-icon">🎵</span>
                <div className="summary-content">
                  <strong>{data.prestations.length} prestations</strong>
                  <small>Services sélectionnés</small>
                </div>
              </div>
            )}
            {montants?.totalTTC && (
              <div className="summary-item highlight">
                <span className="summary-icon">💰</span>
                <div className="summary-content">
                  <strong>{montants.totalTTC}€ TTC</strong>
                  <small>Estimation totale</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations importantes */}
        <div className="validation-info">
          <h3>ℹ️ Informations importantes</h3>
          <ul className="info-list">
            <li>
              <strong>Validation par notre équipe :</strong> Votre devis sera examiné par nos experts qui pourront vous proposer des ajustements pour optimiser votre événement.
            </li>
            <li>
              <strong>Délai de réponse :</strong> Nous nous engageons à vous répondre sous 48 heures ouvrées maximum.
            </li>
            <li>
              <strong>Modification possible :</strong> Après notre retour, vous pourrez accepter, refuser ou demander des modifications.
            </li>
            {data.entretien?.demande && (
              <li>
                <strong>Entretien planifié :</strong> Un conseiller vous contactera pour planifier votre entretien {data.entretien.type === 'physique' ? 'en personne' : 'en visioconférence'}.
              </li>
            )}
            <li>
              <strong>Email de confirmation :</strong> Vous recevrez un email récapitulatif avec votre numéro de devis.
            </li>
          </ul>
        </div>

        {/* Conditions */}
        <div className="validation-conditions">
          <h3>📜 Conditions</h3>
          
          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={acceptCGV}
              onChange={(e) => setAcceptCGV(e.target.checked)}
            />
            <div className="checkbox-content">
              <strong>J'accepte les Conditions Générales de Vente</strong>
              <p>
                Je reconnais avoir pris connaissance et accepter les{' '}
                <a href="/cgv" target="_blank" rel="noopener noreferrer">
                  Conditions Générales de Vente
                </a>{' '}
                d'ElijahGod Events.
              </p>
            </div>
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={acceptData}
              onChange={(e) => setAcceptData(e.target.checked)}
            />
            <div className="checkbox-content">
              <strong>J'accepte le traitement de mes données personnelles</strong>
              <p>
                J'autorise ElijahGod Events à traiter mes données personnelles dans le cadre de ma demande de devis, conformément à notre{' '}
                <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer">
                  Politique de Confidentialité
                </a>.
              </p>
            </div>
          </label>
        </div>

        {/* Zone de soumission */}
        <form onSubmit={handleSubmit} className="validation-form">
          {!acceptCGV || !acceptData ? (
            <div className="warning-box">
              <span className="warning-icon">⚠️</span>
              <p>Vous devez accepter les conditions pour soumettre votre devis</p>
            </div>
          ) : (
            <div className="success-box">
              <span className="success-icon">✅</span>
              <p>Tout est prêt ! Cliquez sur "Soumettre mon devis" pour finaliser</p>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button"
              onClick={onPrevious}
              className="btn-secondary"
              disabled={loading}
            >
              ← Retour au récapitulatif
            </button>
            <button 
              type="submit" 
              className="btn-primary btn-submit"
              disabled={loading || !acceptCGV || !acceptData}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Envoi en cours...
                </>
              ) : (
                '🚀 Soumettre mon devis'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ValidationForm;
