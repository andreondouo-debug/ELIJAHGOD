import React, { useState } from 'react';
import './DevisPage.css';

/**
 * 📝 PAGE DE DEMANDE DE DEVIS - Workflow complet en 5 étapes
 */
function DevisPage() {
  const [etape, setEtape] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1 : Informations client
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    
    // Étape 2 : Type d'événement et date
    typeEvenement: '',
    dateEvenement: '',
    heureDebut: '',
    heureFin: '',
    nombreInvites: '',
    lieu: '',
    
    // Étape 3 : Prestations sélectionnées
    prestations: [],
    
    // Étape 4 : Services supplémentaires
    servicesSupp: [],
    
    // Étape 5 : Commentaires
    commentaires: ''
  });

  const typesEvenement = [
    { value: 'mariage', label: '💍 Mariage', icon: '💍' },
    { value: 'anniversaire', label: '🎂 Anniversaire', icon: '🎂' },
    { value: 'entreprise', label: '🏢 Événement d\'entreprise', icon: '🏢' },
    { value: 'culte', label: '⛪ Culte / Événement religieux', icon: '⛪' },
    { value: 'conference', label: '🎤 Conférence', icon: '🎤' },
    { value: 'soiree', label: '🎉 Soirée privée', icon: '🎉' },
    { value: 'autre', label: '📋 Autre', icon: '📋' }
  ];

  const prestationsDisponibles = [
    { 
      id: 'dj', 
      nom: 'Animation DJ', 
      icon: '🎧', 
      prix: 500,
      description: 'DJ professionnel avec playlist personnalisée'
    },
    { 
      id: 'sono', 
      nom: 'Sonorisation', 
      icon: '🔊', 
      prix: 300,
      description: 'Matériel audio haute qualité'
    },
    { 
      id: 'eclairage', 
      nom: 'Éclairage', 
      icon: '💡', 
      prix: 350,
      description: 'Jeux de lumières et effets'
    },
    { 
      id: 'video', 
      nom: 'Vidéo/Photo', 
      icon: '📸', 
      prix: 800,
      description: 'Photographe et vidéaste professionnel'
    },
    { 
      id: 'traiteur', 
      nom: 'Traiteur', 
      icon: '🍽️', 
      prix: 1200,
      description: 'Service traiteur qualité'
    },
    { 
      id: 'louange', 
      nom: 'Groupe de louange', 
      icon: '🎵', 
      prix: 600,
      description: 'Groupe musical chrétien'
    }
  ];

  const servicesSupplementaires = [
    { id: 'decoration', nom: 'Décoration', icon: '🎨', prix: 400 },
    { id: 'animation', nom: 'Animation enfants', icon: '🎪', prix: 250 },
    { id: 'cocktail', nom: 'Service cocktail', icon: '🍹', prix: 300 },
    { id: 'scene', nom: 'Installation scène', icon: '🎭', prix: 500 }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'prestations') {
        const prestationId = value;
        setFormData(prev => ({
          ...prev,
          prestations: checked 
            ? [...prev.prestations, prestationId]
            : prev.prestations.filter(id => id !== prestationId)
        }));
      } else if (name === 'servicesSupp') {
        const serviceId = value;
        setFormData(prev => ({
          ...prev,
          servicesSupp: checked
            ? [...prev.servicesSupp, serviceId]
            : prev.servicesSupp.filter(id => id !== serviceId)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculerTotal = () => {
    let total = 0;
    
    // Prix des prestations
    formData.prestations.forEach(prestId => {
      const prest = prestationsDisponibles.find(p => p.id === prestId);
      if (prest) total += prest.prix;
    });
    
    // Prix des services supplémentaires
    formData.servicesSupp.forEach(serviceId => {
      const service = servicesSupplementaires.find(s => s.id === serviceId);
      if (service) total += service.prix;
    });
    
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // TODO: Envoyer au backend
    console.log('📤 Envoi du devis:', formData);
    alert('✅ Votre demande de devis a été envoyée ! Nous vous répondrons sous 24-48h.');
    
    // Réinitialiser
    setEtape(1);
    setFormData({
      prenom: '', nom: '', email: '', telephone: '', entreprise: '',
      typeEvenement: '', dateEvenement: '', heureDebut: '', heureFin: '',
      nombreInvites: '', lieu: '', prestations: [], servicesSupp: [],
      commentaires: ''
    });
  };

  const etapeSuivante = () => {
    setEtape(etape + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const etapePrecedente = () => {
    setEtape(etape - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const peutContinuer = () => {
    switch(etape) {
      case 1:
        return formData.prenom && formData.nom && formData.email && formData.telephone;
      case 2:
        return formData.typeEvenement && formData.dateEvenement;
      case 3:
        return formData.prestations.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="devis-page">
      <div className="container">
        {/* En-tête */}
        <div className="devis-header">
          <h1 className="page-title">✨ Demande de Devis Gratuit</h1>
          <p className="page-subtitle">
            Suivez notre guide en 5 étapes pour recevoir votre devis personnalisé sous 24-48h
          </p>
        </div>

        {/* Barre de progression */}
        <div className="progress-bar">
          {[1, 2, 3, 4, 5].map(num => (
            <div 
              key={num} 
              className={`progress-step ${etape >= num ? 'active' : ''} ${etape === num ? 'current' : ''}`}
            >
              <div className="step-number">{num}</div>
              <div className="step-label">
                {num === 1 && 'Informations'}
                {num === 2 && 'Événement'}
                {num === 3 && 'Prestations'}
                {num === 4 && 'Options'}
                {num === 5 && 'Récapitulatif'}
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="devis-form">
          {/* ÉTAPE 1 : Informations client */}
          {etape === 1 && (
            <div className="etape-content">
              <h2 className="etape-title">👤 Vos informations</h2>
              <p className="etape-description">Commençons par vos coordonnées</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Jean"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+33 6 12 34 56 78"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Entreprise/Organisation (optionnel)</label>
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  placeholder="Nom de votre entreprise"
                />
              </div>
            </div>
          )}
// Suite des étapes pour DevisPage.js
// À copier après l'étape 1

          {/* ÉTAPE 2 : Type d'événement et date */}
          {etape === 2 && (
            <div className="etape-content">
              <h2 className="etape-title">📅 Votre événement</h2>
              <p className="etape-description">Parlez-nous de votre projet</p>

              <div className="form-group">
                <label>Type d'événement *</label>
                <div className="type-evenement-grid">
                  {typesEvenement.map(type => (
                    <label key={type.value} className="type-card">
                      <input
                        type="radio"
                        name="typeEvenement"
                        value={type.value}
                        checked={formData.typeEvenement === type.value}
                        onChange={handleChange}
                        required
                      />
                      <span className="type-icon">{type.icon}</span>
                      <span className="type-label">{type.label.replace(type.icon + ' ', '')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de l'événement *</label>
                  <input
                    type="date"
                    name="dateEvenement"
                    value={formData.dateEvenement}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Heure de début</label>
                  <input
                    type="time"
                    name="heureDebut"
                    value={formData.heureDebut}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Heure de fin</label>
                  <input
                    type="time"
                    name="heureFin"
                    value={formData.heureFin}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre d'invités estimé</label>
                  <input
                    type="number"
                    name="nombreInvites"
                    value={formData.nombreInvites}
                    onChange={handleChange}
                    placeholder="100"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Lieu de l'événement</label>
                  <input
                    type="text"
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleChange}
                    placeholder="Ville ou adresse"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Sélection des prestations */}
          {etape === 3 && (
            <div className="etape-content">
              <h2 className="etape-title">🎯 Choisissez vos prestations</h2>
              <p className="etape-description">Sélectionnez les services dont vous avez besoin</p>

              <div className="prestations-grid">
                {prestationsDisponibles.map(prestation => (
                  <label key={prestation.id} className="prestation-card">
                    <input
                      type="checkbox"
                      name="prestations"
                      value={prestation.id}
                      checked={formData.prestations.includes(prestation.id)}
                      onChange={handleChange}
                    />
                    <div className="prestation-content">
                      <div className="prestation-icon">{prestation.icon}</div>
                      <h3>{prestation.nom}</h3>
                      <p className="prestation-description">{prestation.description}</p>
                      <p className="prestation-prix">À partir de {prestation.prix}€</p>
                    </div>
                    <div className="prestation-checkmark">✓</div>
                  </label>
                ))}
              </div>

              {formData.prestations.length === 0 && (
                <div className="warning-message">
                  ⚠️ Veuillez sélectionner au moins une prestation
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 4 : Services supplémentaires */}
          {etape === 4 && (
            <div className="etape-content">
              <h2 className="etape-title">✨ Options supplémentaires</h2>
              <p className="etape-description">Complétez votre forfait (optionnel)</p>

              <div className="services-grid">
                {servicesSupplementaires.map(service => (
                  <label key={service.id} className="service-option">
                    <input
                      type="checkbox"
                      name="servicesSupp"
                      value={service.id}
                      checked={formData.servicesSupp.includes(service.id)}
                      onChange={handleChange}
                    />
                    <span className="service-icon">{service.icon}</span>
                    <span className="service-nom">{service.nom}</span>
                    <span className="service-prix">+{service.prix}€</span>
                  </label>
                ))}
              </div>

              <div className="form-group">
                <label>Commentaires ou demandes spéciales</label>
                <textarea
                  name="commentaires"
                  value={formData.commentaires}
                  onChange={handleChange}
                  placeholder="Parlez-nous de vos besoins spécifiques, vos préférences musicales, l'ambiance souhaitée..."
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 5 : Récapitulatif */}
          {etape === 5 && (
            <div className="etape-content">
              <h2 className="etape-title">📋 Récapitulatif de votre demande</h2>
              <p className="etape-description">Vérifiez vos informations avant l'envoi</p>

              <div className="recapitulatif">
                <div className="recap-section">
                  <h3>👤 Informations client</h3>
                  <p><strong>Nom:</strong> {formData.prenom} {formData.nom}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Téléphone:</strong> {formData.telephone}</p>
                  {formData.entreprise && <p><strong>Entreprise:</strong> {formData.entreprise}</p>}
                </div>

                <div className="recap-section">
                  <h3>📅 Détails de l'événement</h3>
                  <p><strong>Type:</strong> {typesEvenement.find(t => t.value === formData.typeEvenement)?.label}</p>
                  <p><strong>Date:</strong> {new Date(formData.dateEvenement).toLocaleDateString('fr-FR')}</p>
                  {formData.heureDebut && <p><strong>Horaire:</strong> {formData.heureDebut} - {formData.heureFin}</p>}
                  {formData.nombreInvites && <p><strong>Invités:</strong> {formData.nombreInvites} personnes</p>}
                  {formData.lieu && <p><strong>Lieu:</strong> {formData.lieu}</p>}
                </div>

                <div className="recap-section">
                  <h3>🎯 Prestations sélectionnées</h3>
                  {formData.prestations.map(prestId => {
                    const prest = prestationsDisponibles.find(p => p.id === prestId);
                    return prest ? (
                      <div key={prestId} className="recap-item">
                        <span>{prest.icon} {prest.nom}</span>
                        <span>{prest.prix}€</span>
                      </div>
                    ) : null;
                  })}
                </div>

                {formData.servicesSupp.length > 0 && (
                  <div className="recap-section">
                    <h3>✨ Options supplémentaires</h3>
                    {formData.servicesSupp.map(serviceId => {
                      const service = servicesSupplementaires.find(s => s.id === serviceId);
                      return service ? (
                        <div key={serviceId} className="recap-item">
                          <span>{service.icon} {service.nom}</span>
                          <span>{service.prix}€</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {formData.commentaires && (
                  <div className="recap-section">
                    <h3>💬 Vos commentaires</h3>
                    <p className="recap-comments">{formData.commentaires}</p>
                  </div>
                )}

                <div className="recap-total">
                  <h3>💰 Estimation totale</h3>
                  <p className="total-prix">{calculerTotal()}€</p>
                  <p className="total-note">
                    * Prix indicatif, le devis final sera personnalisé selon vos besoins
                  </p>
                </div>
              </div>

              <div className="confirmation-message">
                <p>
                  ✅ En soumettant ce formulaire, vous acceptez d'être contacté par ELIJAH'GOD 
                  concernant votre demande de devis. Nous nous engageons à vous répondre sous 24-48h.
                </p>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="form-actions">
            {etape > 1 && (
              <button
                type="button"
                onClick={etapePrecedente}
                className="btn btn-secondary"
              >
                ← Étape précédente
              </button>
            )}

            {etape < 5 ? (
              <button
                type="button"
                onClick={etapeSuivante}
                disabled={!peutContinuer()}
                className="btn btn-primary"
              >
                Étape suivante →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
              >
                📤 Envoyer ma demande de devis
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default DevisPage;
