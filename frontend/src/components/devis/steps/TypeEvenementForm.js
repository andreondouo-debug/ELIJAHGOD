import { useState } from 'react';
import './StepForms.css';

/**
 * 🎉 ÉTAPE 2: TYPE D'ÉVÉNEMENT
 */

const TYPES_EVENEMENT = [
  { value: 'Mariage', emoji: '💒', description: 'Célébrez votre union' },
  { value: 'Anniversaire', emoji: '🎂', description: 'Fête d\'anniversaire' },
  { value: 'Soirée d\'entreprise', emoji: '🏢', description: 'Événement corporate' },
  { value: 'Bar/Bat Mitzvah', emoji: '✡️', description: 'Célébration religieuse' },
  { value: 'Baptême', emoji: '👶', description: 'Cérémonie de baptême' },
  { value: 'Concert', emoji: '🎸', description: 'Concert live' },
  { value: 'Festival', emoji: '🎪', description: 'Festival / Grande fête' },
  { value: 'Séminaire', emoji: '🎓', description: 'Séminaire professionnel' },
  { value: 'Gala', emoji: '🎭', description: 'Soirée de gala' },
  { value: 'Autre', emoji: '🎉', description: 'Autre type d\'événement' }
];

function TypeEvenementForm({ data, onNext, onPrevious, loading }) {
  const [formData, setFormData] = useState({
    type: data?.evenement?.type || '',
    titre: data?.evenement?.titre || '',
    description: data?.evenement?.description || '',
    thematique: data?.evenement?.thematique || '',
    ambiance: data?.evenement?.ambiance || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const selectType = (type) => {
    setFormData({
      ...formData,
      type
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ evenement: formData });
  };

  return (
    <div className="step-form-container">
      <div className="step-header">
        <h2>🎉 Quel type d'événement organisez-vous ?</h2>
        <p>Sélectionnez le type d'événement pour personnaliser votre devis</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="type-grid">
          {TYPES_EVENEMENT.map((type) => (
            <button
              key={type.value}
              type="button"
              className={`type-card ${formData.type === type.value ? 'selected' : ''}`}
              onClick={() => selectType(type.value)}
            >
              <div className="type-emoji">{type.emoji}</div>
              <div className="type-name">{type.value}</div>
              <div className="type-description">{type.description}</div>
            </button>
          ))}
        </div>

        {formData.type && (
          <>
            <div className="form-group">
              <label htmlFor="titre">Titre de l'événement *</label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Mariage de Marie et Pierre"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez brièvement votre événement..."
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="thematique">Thématique</label>
                <input
                  type="text"
                  id="thematique"
                  name="thematique"
                  value={formData.thematique}
                  onChange={handleChange}
                  placeholder="Ex: Vintage, Tropical, Glamour..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="ambiance">Ambiance souhaitée</label>
                <input
                  type="text"
                  id="ambiance"
                  name="ambiance"
                  value={formData.ambiance}
                  onChange={handleChange}
                  placeholder="Ex: Festive, Élégante, Décontractée..."
                />
              </div>
            </div>
          </>
        )}

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
            disabled={loading || !formData.type}
          >
            {loading ? 'Sauvegarde...' : 'Continuer →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TypeEvenementForm;
