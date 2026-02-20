import { useState } from 'react';
import './StepForms.css';

/**
 * 📅 ÉTAPE 3: DATE ET LIEU
 */
function DateLieuForm({ data, onNext, onPrevious, loading }) {
  const [formData, setFormData] = useState({
    date: data?.evenement?.date || '',
    heureDebut: data?.evenement?.heureDebut || '',
    heureFin: data?.evenement?.heureFin || '',
    lieu: {
      nom: data?.evenement?.lieu?.nom || '',
      adresse: data?.evenement?.lieu?.adresse || '',
      ville: data?.evenement?.lieu?.ville || '',
      codePostal: data?.evenement?.lieu?.codePostal || '',
      typeVenue: data?.evenement?.lieu?.typeVenue || ''
    }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLieuChange = (e) => {
    setFormData({
      ...formData,
      lieu: {
        ...formData.lieu,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ evenement: formData });
  };

  return (
    <div className="step-form-container">
      <div className="step-header">
        <h2>📅 Quand et où aura lieu votre événement ?</h2>
        <p>Indiquez la date et le lieu de votre événement</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="form-group">
          <label htmlFor="date">Date de l'événement *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="heureDebut">Heure de début</label>
            <input
              type="time"
              id="heureDebut"
              name="heureDebut"
              value={formData.heureDebut}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="heureFin">Heure de fin (estimée)</label>
            <input
              type="time"
              id="heureFin"
              name="heureFin"
              value={formData.heureFin}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="section-divider">
          <span>📍 Lieu de l'événement</span>
        </div>

        <div className="form-group">
          <label htmlFor="nom">Nom du lieu</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.lieu.nom}
            onChange={handleLieuChange}
            placeholder="Ex: Château de Versailles, Salle des fêtes..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="adresse">Adresse *</label>
          <input
            type="text"
            id="adresse"
            name="adresse"
            value={formData.lieu.adresse}
            onChange={handleLieuChange}
            placeholder="123 rue de la Paix"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="codePostal">Code postal *</label>
            <input
              type="text"
              id="codePostal"
              name="codePostal"
              value={formData.lieu.codePostal}
              onChange={handleLieuChange}
              placeholder="75001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ville">Ville *</label>
            <input
              type="text"
              id="ville"
              name="ville"
              value={formData.lieu.ville}
              onChange={handleLieuChange}
              placeholder="Paris"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="typeVenue">Type de lieu</label>
          <select
            id="typeVenue"
            name="typeVenue"
            value={formData.lieu.typeVenue}
            onChange={handleLieuChange}
          >
            <option value="">-- Sélectionner --</option>
            <option value="Salle de réception">Salle de réception</option>
            <option value="Château">Château</option>
            <option value="Domaine">Domaine</option>
            <option value="Hôtel">Hôtel</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Lieu atypique">Lieu atypique</option>
            <option value="Extérieur">Extérieur</option>
            <option value="Autre">Autre</option>
          </select>
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
            disabled={loading}
          >
            {loading ? 'Sauvegarde...' : 'Continuer →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DateLieuForm;
