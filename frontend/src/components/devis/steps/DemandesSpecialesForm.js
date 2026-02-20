import { useState } from 'react';
import './StepForms.css';

/**
 * ✍️ ÉTAPE 7: DEMANDES SPÉCIALES
 */
function DemandesSpecialesForm({ data, onNext, onPrevious, loading }) {
  const [formData, setFormData] = useState({
    description: data?.demandesClient?.description || '',
    besoinsSpecifiques: data?.demandesClient?.besoinsSpecifiques || [],
    budget: {
      minimum: data?.demandesClient?.budget?.minimum || '',
      maximum: data?.demandesClient?.budget?.maximum || '',
      flexible: data?.demandesClient?.budget?.flexible || false
    },
    priorites: data?.demandesClient?.priorites || [],
    demandeEntretien: data?.entretien?.demande || false,
    typeEntretien: data?.entretien?.type || 'physique'
  });

  const [besoinInput, setBesoinInput] = useState('');
  const [prioriteInput, setPrioriteInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleBudgetChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      budget: {
        ...formData.budget,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const ajouterBesoin = () => {
    if (besoinInput.trim()) {
      setFormData({
        ...formData,
        besoinsSpecifiques: [...formData.besoinsSpecifiques, besoinInput.trim()]
      });
      setBesoinInput('');
    }
  };

  const retirerBesoin = (index) => {
    setFormData({
      ...formData,
      besoinsSpecifiques: formData.besoinsSpecifiques.filter((_, i) => i !== index)
    });
  };

  const ajouterPriorite = () => {
    if (prioriteInput.trim()) {
      setFormData({
        ...formData,
        priorites: [...formData.priorites, prioriteInput.trim()]
      });
      setPrioriteInput('');
    }
  };

  const retirerPriorite = (index) => {
    setFormData({
      ...formData,
      priorites: formData.priorites.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({
      demandesClient: {
        description: formData.description,
        besoinsSpecifiques: formData.besoinsSpecifiques,
        budget: formData.budget,
        priorites: formData.priorites
      },
      entretien: {
        demande: formData.demandeEntretien,
        type: formData.demandeEntretien ? formData.typeEntretien : 'non_necessaire'
      }
    });
  };

  return (
    <div className="step-form-container">
      <div className="step-header">
        <h2>✍️ Demandes et besoins spécifiques</h2>
        <p>Partagez vos attentes particulières et votre budget</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="form-group">
          <label htmlFor="description">Description générale</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez vos attentes, besoins spécifiques, contraintes particulières..."
            rows={6}
          />
        </div>

        <div className="section-divider">
          <span>📋 Besoins spécifiques</span>
        </div>

        <div className="input-with-add">
          <input
            type="text"
            value={besoinInput}
            onChange={(e) => setBesoinInput(e.target.value)}
            placeholder="Ajouter un besoin spécifique..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterBesoin())}
          />
          <button type="button" onClick={ajouterBesoin} className="btn-add">
            Ajouter
          </button>
        </div>

        {formData.besoinsSpecifiques.length > 0 && (
          <div className="tags-list">
            {formData.besoinsSpecifiques.map((besoin, index) => (
              <div key={index} className="tag">
                <span>{besoin}</span>
                <button type="button" onClick={() => retirerBesoin(index)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div className="section-divider">
          <span>💰 Budget</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minimum">Budget minimum (€)</label>
            <input
              type="number"
              id="minimum"
              name="minimum"
              value={formData.budget.minimum}
              onChange={handleBudgetChange}
              placeholder="1000"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maximum">Budget maximum (€)</label>
            <input
              type="number"
              id="maximum"
              name="maximum"
              value={formData.budget.maximum}
              onChange={handleBudgetChange}
              placeholder="5000"
              min="0"
            />
          </div>
        </div>

        <label className="checkbox-label-block">
          <input
            type="checkbox"
            name="flexible"
            checked={formData.budget.flexible}
            onChange={handleBudgetChange}
          />
          <span>Mon budget est flexible</span>
        </label>

        <div className="section-divider">
          <span>⭐ Priorités</span>
        </div>

        <div className="input-with-add">
          <input
            type="text"
            value={prioriteInput}
            onChange={(e) => setPrioriteInput(e.target.value)}
            placeholder="Ajouter une priorité..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterPriorite())}
          />
          <button type="button" onClick={ajouterPriorite} className="btn-add">
            Ajouter
          </button>
        </div>

        {formData.priorites.length > 0 && (
          <div className="tags-list">
            {formData.priorites.map((priorite, index) => (
              <div key={index} className="tag">
                <span>{priorite}</span>
                <button type="button" onClick={() => retirerPriorite(index)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div className="section-divider">
          <span>📞 Entretien</span>
        </div>

        <label className="checkbox-label-block">
          <input
            type="checkbox"
            name="demandeEntretien"
            checked={formData.demandeEntretien}
            onChange={handleChange}
          />
          <span>Je souhaite un entretien avec un conseiller</span>
        </label>

        {formData.demandeEntretien && (
          <div className="entretien-type">
            <label className="radio-label">
              <input
                type="radio"
                name="typeEntretien"
                value="physique"
                checked={formData.typeEntretien === 'physique'}
                onChange={handleChange}
              />
              <span>🏢 Entretien physique (en personne)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="typeEntretien"
                value="visio"
                checked={formData.typeEntretien === 'visio'}
                onChange={handleChange}
              />
              <span>💻 Visioconférence</span>
            </label>
          </div>
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
            disabled={loading}
          >
            {loading ? 'Sauvegarde...' : 'Continuer →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DemandesSpecialesForm;
