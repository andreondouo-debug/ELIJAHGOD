import './ProgressBar.css';

/**
 * 📊 BARRE DE PROGRESSION
 */

const ETAPES_LABELS = {
  informations: 'Informations',
  type_evenement: 'Type d\'événement',
  date_lieu: 'Date & Lieu',
  invites: 'Invités',
  prestations: 'Prestations',
  materiels: 'Matériels',
  demandes_speciales: 'Demandes spéciales',
  recapitulatif: 'Récapitulatif',
  validation: 'Validation'
};

function ProgressBar({ etapeActuelle, progression, etapes }) {
  const currentIndex = etapes.indexOf(etapeActuelle);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        <h2>Création de votre devis</h2>
        <div className="progress-percentage">{progression}%</div>
      </div>

      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progression}%` }}
        ></div>
      </div>

      <div className="progress-steps">
        {etapes.map((etape, index) => (
          <div 
            key={etape}
            className={`progress-step ${
              index <= currentIndex ? 'active' : ''
            } ${index === currentIndex ? 'current' : ''}`}
          >
            <div className="step-circle">
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <div className="step-label">{ETAPES_LABELS[etape]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressBar;
