import { useState } from 'react';
import './StepForms.css';

/**
 * 📝 ÉTAPE 1: INFORMATIONS CLIENT
 */
function InformationsForm({ data, onNext, loading, isAuthenticated }) {
  const [formData, setFormData] = useState({
    nom: data?.client?.nom || '',
    prenom: data?.client?.prenom || '',
    email: data?.client?.email || '',
    telephone: data?.client?.telephone || '',
    adresse: data?.client?.adresse || '',
    entreprise: data?.client?.entreprise || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ client: formData });
  };

  // Si connecté, passer automatiquement à l'étape suivante
  if (isAuthenticated) {
    return (
      <div className="step-form-container">
        <div className="step-header">
          <h2>✅ Informations client</h2>
          <p>Vous êtes connecté, vos informations sont déjà enregistrées.</p>
        </div>
        
        <button 
          onClick={() => onNext({})} 
          className="btn-primary btn-full"
          disabled={loading}
        >
          Continuer →
        </button>
      </div>
    );
  }

  return (
    <div className="step-form-container">
      <div className="step-header">
        <h2>📝 Vos informations</h2>
        <p>Commençons par vos coordonnées pour créer votre devis personnalisé</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prenom">Prénom *</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Jean"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nom">Nom *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Dupont"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="votre@email.com"
            required
          />
          <small>Vous recevrez une copie de votre devis par email</small>
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone *</label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="+33 6 12 34 56 78"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="adresse">Adresse</label>
          <input
            type="text"
            id="adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            placeholder="123 rue de la Paix, 75001 Paris"
          />
        </div>

        <div className="form-group">
          <label htmlFor="entreprise">Entreprise (optionnel)</label>
          <input
            type="text"
            id="entreprise"
            name="entreprise"
            value={formData.entreprise}
            onChange={handleChange}
            placeholder="Nom de votre entreprise"
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Sauvegarde...' : 'Continuer →'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InformationsForm;
