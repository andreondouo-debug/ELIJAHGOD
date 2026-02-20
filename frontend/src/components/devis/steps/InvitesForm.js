import { useState } from 'react';
import './StepForms.css';

/**
 * 👥 ÉTAPE 4: NOMBRE D'INVITÉS
 */
function InvitesForm({ data, onNext, onPrevious, loading }) {
  const [formData, setFormData] = useState({
    nbInvites: data?.evenement?.nbInvites || '',
    nbInvitesEstime: data?.evenement?.nbInvitesEstime || ''
  });
  const [isEstimation, setIsEstimation] = useState(
    !!data?.evenement?.nbInvitesEstime && !data?.evenement?.nbInvites
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ evenement: formData });
  };

  const toggleMode = () => {
    setIsEstimation(!isEstimation);
    setFormData({
      nbInvites: '',
      nbInvitesEstime: ''
    });
  };

  return (
    <div className="step-form-container">
      <div className="step-header">
        <h2>👥 Combien d'invités attendez-vous ?</h2>
        <p>Cette information nous aide à dimensionner les prestations et matériels</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="mode-selector">
          <button
            type="button"
            className={`mode-btn ${!isEstimation ? 'active' : ''}`}
            onClick={() => !isEstimation || toggleMode()}
          >
            <span className="mode-icon">📊</span>
            <span>Nombre exact</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${isEstimation ? 'active' : ''}`}
            onClick={() => isEstimation || toggleMode()}
          >
            <span className="mode-icon">📈</span>
            <span>Estimation</span>
          </button>
        </div>

        {!isEstimation ? (
          <div className="invites-input-large">
            <label htmlFor="nbInvites">Nombre d'invités</label>
            <input
              type="number"
              id="nbInvites"
              name="nbInvites"
              value={formData.nbInvites}
              onChange={handleChange}
              min="1"
              max="10000"
              placeholder="150"
              required
              className="large-number-input"
            />
            <small>Nombre exact de participants attendus</small>
          </div>
        ) : (
          <div className="invites-range">
            <label>Fourchette estimée d'invités</label>
            <div className="range-selector">
              <button
                type="button"
                className={`range-btn ${formData.nbInvitesEstime === '1-50' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, nbInvitesEstime: '1-50' })}
              >
                1-50<br/><small>Petit comité</small>
              </button>
              <button
                type="button"
                className={`range-btn ${formData.nbInvitesEstime === '50-100' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, nbInvitesEstime: '50-100' })}
              >
                50-100<br/><small>Moyen</small>
              </button>
              <button
                type="button"
                className={`range-btn ${formData.nbInvitesEstime === '100-200' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, nbInvitesEstime: '100-200' })}
              >
                100-200<br/><small>Grand</small>
              </button>
              <button
                type="button"
                className={`range-btn ${formData.nbInvitesEstime === '200+' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, nbInvitesEstime: '200+' })}
              >
                200+<br/><small>Très grand</small>
              </button>
            </div>
          </div>
        )}

        <div className="info-box">
          <span className="info-icon">💡</span>
          <div className="info-content">
            <strong>Conseil :</strong> Plus le nombre d'invités est précis, plus votre devis sera adapté. Vous pourrez toujours ajuster ce nombre plus tard.
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button"
            onClick={onPrevious}
            className="btn-secondary"
          >
            ← Retour
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || (!formData.nbInvites && !formData.nbInvitesEstime)}
          >
            {loading ? 'Sauvegarde...' : 'Continuer →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvitesForm;
