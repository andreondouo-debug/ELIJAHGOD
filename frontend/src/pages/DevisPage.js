import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DevisPage.css';
import PrestationDetailModal from '../components/PrestationDetailModal';
import { SettingsContext } from '../context/SettingsContext';

import { API_URL } from '../config';

/**
 * 🎯 PAGE DEVIS - Workflow interactif moderne
 * Système de quiz par étape avec formulaire simplifié pour prospects
 */
function DevisPage() {
  const navigate = useNavigate();
  const { settings } = useContext(SettingsContext);
  const heroConfig = settings?.pages?.devis?.hero;

  // Animation du header au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.section-animated[data-animation]').forEach(el => {
        const animType = el.dataset.animation;
        if (animType && animType !== 'none') {
          el.classList.add(`animate-${animType}`);
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [heroConfig]);

  const [etape, setEtape] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [modalPrestation, setModalPrestation] = useState(null);
  const [prestationsDetail, setPrestationsDetail] = useState([]);

  // Données du formulaire (simplifié pour prospects)
  const [formData, setFormData] = useState({
    // Infos prospect (étape 1)
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    
    // Type événement (étape 2 - quiz)
    typeEvenement: '',
    dateEvenement: '',
    lieu: '',
    
    // Prestations (étape 3 - quiz)
    prestations: [],
    budget: '',
    
    // Articles supplémentaires (étape 4 - quiz)
    articlesSup: [],
    
    // Détails finaux (étape 5 - quiz)
    nombreInvites: '',
    commentaires: ''
  });

  const etapes = [
    { numero: 1, titre: 'Vos coordonnées', icon: '👤', couleur: '#3498db' },
    { numero: 2, titre: 'Votre événement', icon: '🎉', couleur: '#9b59b6' },
    { numero: 3, titre: 'Vos prestations', icon: '🎧', couleur: '#e67e22' },
    { numero: 4, titre: 'Articles supplémentaires', icon: '✨', couleur: '#f39c12' },
    { numero: 5, titre: 'Confirmation', icon: '✅', couleur: '#27ae60' }
  ];

  const typesEvenement = [
    { value: 'mariage', label: 'Mariage', icon: '💍', description: 'Célébration de votre union' },
    { value: 'anniversaire', label: 'Anniversaire', icon: '🎂', description: 'Fête d\'anniversaire inoubliable' },
    { value: 'entreprise', label: 'Événement pro', icon: '🏢', description: 'Soirée d\'entreprise' },
    { value: 'culte', label: 'Culte', icon: '⛪', description: 'Événement religieux' },
    { value: 'autre', label: 'Autre', icon: '✨', description: 'Autre type d\'événement' }
  ];

  const prestationsDisponibles = [
    { id: 'dj', nom: 'DJ Animation', icon: '🎧', description: 'Ambiance musicale professionnelle', categorie: 'DJ' },
    { id: 'sono', nom: 'Sonorisation', icon: '🔊', description: 'Matériel audio haute qualité', categorie: 'Sonorisation' },
    { id: 'eclairage', nom: 'Éclairage', icon: '💡', description: 'Jeux de lumières et effets', categorie: 'Éclairage' },
    { id: 'video', nom: 'Photo/Vidéo', icon: '📸', description: 'Capturer vos moments', categorie: 'Photographe' },
    { id: 'louange', nom: 'Groupe de louange', icon: '🎵', description: 'Musique chrétienne live', categorie: 'Groupe de louange' },
    { id: 'traiteur', nom: 'Traiteur', icon: '🍽️', description: 'Service restauration', categorie: 'Traiteur' }
  ];

  // Charger les prestations détaillées depuis l'API
  useEffect(() => {
    const fetchPrestations = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/prestations`);
        setPrestationsDetail(data.data || []);
      } catch (error) {
        console.error('❌ Erreur chargement prestations:', error);
      }
    };
    fetchPrestations();
  }, []);

  // 💰 CALCUL AUTOMATIQUE DU BUDGET selon les prestations sélectionnées
  useEffect(() => {
    if (formData.prestations.length === 0) {
      return; // Pas de calcul si aucune prestation
    }

    let prixTotal = 0;

    // Calculer le prix total des prestations sélectionnées
    formData.prestations.forEach(prestationId => {
      // Trouver la prestation dans les détails chargés
      const prestation = prestationsDetail.find(p => {
        // Matcher par ID ou par nom de catégorie
        if (typeof prestationId === 'string') {
          return p._id === prestationId || 
                 p.categorie.toLowerCase() === prestationId.toLowerCase() ||
                 p.nom.toLowerCase().includes(prestationId.toLowerCase());
        }
        return p._id === prestationId.prestationId;
      });

      if (prestation) {
        prixTotal += prestation.prixBase || 0;
      } else {
        // Valeur par défaut si prestation non trouvée
        prixTotal += 500;
      }
    });

    // Déterminer la tranche de budget automatiquement
    let budgetAuto = '';
    if (prixTotal <= 1000) {
      budgetAuto = '500-1000';
    } else if (prixTotal <= 2000) {
      budgetAuto = '1000-2000';
    } else if (prixTotal <= 5000) {
      budgetAuto = '2000-5000';
    } else {
      budgetAuto = '5000+';
    }

    // Mettre à jour le budget uniquement s'il a changé
    if (budgetAuto !== formData.budget) {
      setFormData(prev => ({ ...prev, budget: budgetAuto }));
    }
  }, [formData.prestations, prestationsDetail]);

  const budgets = [
    { value: '500-1000', label: '500€ - 1000€', icon: '💰' },
    { value: '1000-2000', label: '1000€ - 2000€', icon: '💰💰' },
    { value: '2000-5000', label: '2000€ - 5000€', icon: '💰💰💰' },
    { value: '5000+', label: '5000€ et plus', icon: '💎' }
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [etape]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const togglePrestation = (prestationId) => {
    setFormData(prev => ({
      ...prev,
      prestations: prev.prestations.includes(prestationId)
        ? prev.prestations.filter(p => p !== prestationId)
        : [...prev.prestations, prestationId]
    }));
  };

  const ouvrirModalPrestation = (prestation, event) => {
    event.stopPropagation(); // Empêcher la sélection de la prestation
    // Trouver les détails complets depuis l'API
    const detailsComplets = prestationsDetail.find(p => 
      p.nom.toLowerCase().includes(prestation.nom.toLowerCase()) ||
      p.categorie === prestation.categorie
    );
    
    if (detailsComplets) {
      setModalPrestation(detailsComplets);
    } else {
      // Utiliser les infos basiques si pas trouvé dans l'API
      setModalPrestation({
        ...prestation,
        prixBase: 500,
        inclus: [],
        nonInclus: [],
        galerie: [],
        prestatairesAssocies: [],
        tarifsParInvites: []
      });
    }
  };

  const selectionnerDepuisModal = (prestation, prestataireId, prixEstime) => {
    // Ajouter la prestation avec le prestataire choisi
    const prestationData = {
      prestationId: prestation._id || prestation.id,
      nom: prestation.nom,
      prix: prixEstime
    };
    
    if (prestataireId) {
      prestationData.prestataireId = prestataireId;
    }
    
    setFormData(prev => ({
      ...prev,
      prestations: [...prev.prestations.filter(p => 
        (typeof p === 'string' ? p : p.prestationId) !== prestationData.prestationId
      ), prestationData]
    }));
  };

  const validerEtape = () => {
    // Validation selon l'étape
    switch (etape) {
      case 1:
        if (!formData.prenom || !formData.nom || !formData.email || !formData.telephone) {
          setError('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        if (!formData.email.includes('@')) {
          setError('Email invalide');
          return false;
        }
        break;
      case 2:
        if (!formData.typeEvenement || !formData.dateEvenement || !formData.lieu) {
          setError('Veuillez compléter les informations de votre événement');
          return false;
        }
        break;
      case 3:
        if (formData.prestations.length === 0 || !formData.budget) {
          setError('Veuillez sélectionner au moins une prestation et un budget');
          return false;
        }
        break;      case 4:
        // Étape articles supplémentaires - optionnelle, pas de validation stricte
        break;      default:
        break;
    }
    
    setError('');
    setEtape(prev => prev + 1);
    return true;
  };

  const soumettreDevis = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Créer le compte client si besoin (avec mot de passe optionnel)
      const clientData = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        ...(formData.motDePasse && { password: formData.motDePasse })
      };

      // 2. Créer le devis
      const devisData = {
        typeEvenement: formData.typeEvenement,
        dateEvenement: formData.dateEvenement,
        lieu: formData.lieu,
        prestations: formData.prestations,
        articlesSup: formData.articlesSup || [],
        budget: formData.budget,
        nombreInvites: formData.nombreInvites || 'Non précisé',
        commentaires: formData.commentaires,
        client: clientData
      };

      console.log('📤 Envoi devis:', JSON.stringify(devisData, null, 2));
      console.log('📞 Téléphone:', formData.telephone);

      const response = await axios.post(`${API_URL}/api/devis/brouillon`, devisData);

      console.log('✅ Devis créé:', response.data);
      setSuccess(true);
      
      // Redirection après 3 secondes
      setTimeout(() => {
        if (response.data.clientId) {
          navigate(`/client/dashboard`);
        } else {
          navigate('/');
        }
      }, 3000);

    } catch (err) {
      console.error('❌ Erreur création devis:', err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission du devis');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="devis-page">
        <div className="container">
          <div className="success-message">
            <div className="success-icon">🎉</div>
            <h2>Merci pour votre demande !</h2>
            <p>Votre devis a été créé avec succès.</p>
            <p>Nous vous contactons sous 24-48h pour finaliser votre projet.</p>
            <div className="loader-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="devis-page">
      <div className="container">
        {/* En-tête */}
        <div
          className={`devis-header${heroConfig?.animation?.type && heroConfig.animation.type !== 'none' ? ' section-animated' : ''}`}
          data-animation={heroConfig?.animation?.type || 'none'}
          style={{
            '--animation-duration': `${heroConfig?.animation?.duration || 800}ms`,
            '--animation-delay': `${heroConfig?.animation?.delay || 0}ms`,
          }}
        >
          <h1 className="devis-title" style={{ color: heroConfig?.couleurs?.texte || undefined }}>
            {heroConfig?.titre || '✨ Créons votre devis ensemble'}
          </h1>
          <p className="devis-subtitle" style={{ color: heroConfig?.couleurs?.texte || undefined }}>
            {heroConfig?.sousTitre || 'Un processus simple et rapide en 4 étapes'}
          </p>
        </div>

        {/* Workflow horizontal avec flèches */}
        <div className="workflow-container">
          {etapes.map((step, index) => (
            <React.Fragment key={step.numero}>
              <div 
                className={`workflow-step ${etape === step.numero ? 'active' : ''} ${etape > step.numero ? 'completed' : ''}`}
                style={{ '--step-color': step.couleur }}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-numero">{step.numero}</div>
                <div className="step-titre">{step.titre}</div>
              </div>
              
              {index < etapes.length - 1 && (
                <div className={`workflow-arrow ${etape > step.numero ? 'completed' : ''}`}>
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Contenu de l'étape */}
        <div className="etape-content">
          
          {/* ÉTAPE 1 : Coordonnées */}
          {etape === 1 && (
            <div className="etape-card fade-in">
              <h2 className="etape-title">👤 Vos coordonnées</h2>
              <p className="etape-description">Commençons par faire connaissance !</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    placeholder="Votre prénom"
                    className="input-modern"
                  />
                </div>

                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    placeholder="Votre nom"
                    className="input-modern"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="votre@email.com"
                    className="input-modern"
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="input-modern"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Mot de passe (optionnel)</label>
                  <input
                    type="password"
                    value={formData.motDePasse}
                    onChange={(e) => handleChange('motDePasse', e.target.value)}
                    placeholder="Pour créer votre espace client"
                    className="input-modern"
                  />
                  <small>Si vous souhaitez suivre votre devis en ligne</small>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Type d'événement */}
          {etape === 2 && (
            <div className="etape-card fade-in">
              <h2 className="etape-title">🎉 Parlez-nous de votre événement</h2>
              <p className="etape-description">Quel type d'événement organisez-vous ?</p>
              
              <div className="options-grid">
                {typesEvenement.map(type => (
                  <div
                    key={type.value}
                    className={`option-card ${formData.typeEvenement === type.value ? 'selected' : ''}`}
                    onClick={() => handleChange('typeEvenement', type.value)}
                  >
                    <div className="option-icon">{type.icon}</div>
                    <div className="option-label">{type.label}</div>
                    <div className="option-desc">{type.description}</div>
                  </div>
                ))}
              </div>

              <div className="form-grid" style={{ marginTop: '2rem' }}>
                <div className="form-group">
                  <label>Date de l'événement *</label>
                  <input
                    type="date"
                    value={formData.dateEvenement}
                    onChange={(e) => handleChange('dateEvenement', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-modern"
                  />
                </div>

                <div className="form-group">
                  <label>Lieu *</label>
                  <input
                    type="text"
                    value={formData.lieu}
                    onChange={(e) => handleChange('lieu', e.target.value)}
                    placeholder="Ville ou adresse"
                    className="input-modern"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Prestations */}
          {etape === 3 && (
            <div className="etape-card fade-in">
              <h2 className="etape-title">🎧 De quoi avez-vous besoin ?</h2>
              <p className="etape-description">Sélectionnez les prestations qui vous intéressent</p>
              
              <div className="prestations-grid">
                {prestationsDisponibles.map(prestation => (
                  <div
                    key={prestation.id}
                    className={`prestation-card ${formData.prestations.includes(prestation.id) ? 'selected' : ''}`}
                  >
                    <div className="prestation-content" onClick={() => togglePrestation(prestation.id)}>
                      <div className="prestation-icon">{prestation.icon}</div>
                      <div className="prestation-nom">{prestation.nom}</div>
                      <div className="prestation-desc">{prestation.description}</div>
                      <div className="prestation-check">
                        {formData.prestations.includes(prestation.id) && '✓'}
                      </div>
                    </div>
                    <button
                      className="btn-voir-details"
                      onClick={(e) => ouvrirModalPrestation(prestation, e)}
                    >
                      👁️ Voir détails
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: '2rem' }}>
                <label>Budget estimé *</label>
                <div className="budget-options">
                  {budgets.map(budget => (
                    <div
                      key={budget.value}
                      className={`budget-option ${formData.budget === budget.value ? 'selected' : ''}`}
                      onClick={() => handleChange('budget', budget.value)}
                    >
                      <span className="budget-icon">{budget.icon}</span>
                      <span className="budget-label">{budget.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : Articles supplémentaires */}
          {etape === 4 && (
            <div className="etape-card fade-in">
              <h2 className="etape-title">✨ Articles supplémentaires</h2>
              <p className="etape-description">Ajoutez une touche spéciale à votre événement (optionnel)</p>
              
              <div className="articles-grid">
                <div
                  className={`article-card ${formData.articlesSup?.includes('machine-fumee') ? 'selected' : ''}`}
                  onClick={() => {
                    const current = formData.articlesSup || [];
                    setFormData(prev => ({
                      ...prev,
                      articlesSup: current.includes('machine-fumee')
                        ? current.filter(a => a !== 'machine-fumee')
                        : [...current, 'machine-fumee']
                    }));
                  }}
                >
                  <div className="article-icon">💨</div>
                  <div className="article-nom">Machine à fumée</div>
                  <div className="article-desc">Créez une ambiance mystérieuse</div>
                  <div className="article-check">
                    {formData.articlesSup?.includes('machine-fumee') && '✓'}
                  </div>
                </div>

                <div
                  className={`article-card ${formData.articlesSup?.includes('feu-artifice') ? 'selected' : ''}`}
                  onClick={() => {
                    const current = formData.articlesSup || [];
                    setFormData(prev => ({
                      ...prev,
                      articlesSup: current.includes('feu-artifice')
                        ? current.filter(a => a !== 'feu-artifice')
                        : [...current, 'feu-artifice']
                    }));
                  }}
                >
                  <div className="article-icon">🎆</div>
                  <div className="article-nom">Jet d'artifice</div>
                  <div className="article-desc">Un final spectaculaire</div>
                  <div className="article-check">
                    {formData.articlesSup?.includes('feu-artifice') && '✓'}
                  </div>
                </div>

                <div
                  className={`article-card ${formData.articlesSup?.includes('photomaton') ? 'selected' : ''}`}
                  onClick={() => {
                    const current = formData.articlesSup || [];
                    setFormData(prev => ({
                      ...prev,
                      articlesSup: current.includes('photomaton')
                        ? current.filter(a => a !== 'photomaton')
                        : [...current, 'photomaton']
                    }));
                  }}
                >
                  <div className="article-icon">📸</div>
                  <div className="article-nom">Photomaton</div>
                  <div className="article-desc">Souvenirs instantanés amusants</div>
                  <div className="article-check">
                    {formData.articlesSup?.includes('photomaton') && '✓'}
                  </div>
                </div>

                <div
                  className={`article-card ${formData.articlesSup?.includes('saxophone') ? 'selected' : ''}`}
                  onClick={() => {
                    const current = formData.articlesSup || [];
                    setFormData(prev => ({
                      ...prev,
                      articlesSup: current.includes('saxophone')
                        ? current.filter(a => a !== 'saxophone')
                        : [...current, 'saxophone']
                    }));
                  }}
                >
                  <div className="article-icon">🎷</div>
                  <div className="article-nom">Joueur de saxophone</div>
                  <div className="article-desc">Pour l'entrée des mariés</div>
                  <div className="article-check">
                    {formData.articlesSup?.includes('saxophone') && '✓'}
                  </div>
                </div>

                <div
                  className={`article-card ${formData.articlesSup?.includes('violon') ? 'selected' : ''}`}
                  onClick={() => {
                    const current = formData.articlesSup || [];
                    setFormData(prev => ({
                      ...prev,
                      articlesSup: current.includes('violon')
                        ? current.filter(a => a !== 'violon')
                        : [...current, 'violon']
                    }));
                  }}
                >
                  <div className="article-icon">🎻</div>
                  <div className="article-nom">Joueur de violon</div>
                  <div className="article-desc">Musique classique élégante</div>
                  <div className="article-check">
                    {formData.articlesSup?.includes('violon') && '✓'}
                  </div>
                </div>

                <div
                  className={`article-card ${formData.articlesSup?.includes('confettis') ? 'selected' : ''}`}
                  onClick={() => {
                    const current = formData.articlesSup || [];
                    setFormData(prev => ({
                      ...prev,
                      articlesSup: current.includes('confettis')
                        ? current.filter(a => a !== 'confettis')
                        : [...current, 'confettis']
                    }));
                  }}
                >
                  <div className="article-icon">🎊</div>
                  <div className="article-nom">Canon à confettis</div>
                  <div className="article-desc">Moment magique et festif</div>
                  <div className="article-check">
                    {formData.articlesSup?.includes('confettis') && '✓'}
                  </div>
                </div>
              </div>

              <p className="etape-note">💡 Ces articles sont optionnels. Vous pouvez passer cette étape si vous n'en avez pas besoin.</p>
            </div>
          )}

          {/* ÉTAPE 5 : Confirmation */}
          {etape === 5 && (
            <div className="etape-card fade-in">
              <h2 className="etape-title">✅ Derniers détails</h2>
              <p className="etape-description">Un dernier effort avant de finaliser !</p>
              
              <div className="form-group">
                <label>Nombre d'invités (approximatif)</label>
                <input
                  type="number"
                  value={formData.nombreInvites}
                  onChange={(e) => handleChange('nombreInvites', e.target.value)}
                  placeholder="Ex: 100"
                  className="input-modern"
                />
              </div>

              <div className="form-group">
                <label>Commentaires ou demandes spéciales</label>
                <textarea
                  value={formData.commentaires}
                  onChange={(e) => handleChange('commentaires', e.target.value)}
                  placeholder="Partagez-nous tous les détails importants..."
                  rows="5"
                  className="input-modern"
                />
              </div>

              <div className="recapitulatif">
                <h3>📋 Récapitulatif</h3>
                <div className="recap-item"><strong>Contact:</strong> {formData.prenom} {formData.nom}</div>
                <div className="recap-item"><strong>Email:</strong> {formData.email}</div>
                <div className="recap-item"><strong>Événement:</strong> {typesEvenement.find(t => t.value === formData.typeEvenement)?.label}</div>
                <div className="recap-item"><strong>Date:</strong> {new Date(formData.dateEvenement).toLocaleDateString('fr-FR')}</div>
                <div className="recap-item"><strong>Lieu:</strong> {formData.lieu}</div>
                <div className="recap-item"><strong>Prestations:</strong> {formData.prestations.length} sélectionnée(s)</div>
                {formData.articlesSup && formData.articlesSup.length > 0 && (
                  <div className="recap-item"><strong>Articles supplémentaires:</strong> {formData.articlesSup.length} article(s)</div>
                )}
                <div className="recap-item"><strong>Budget:</strong> {budgets.find(b => b.value === formData.budget)?.label}</div>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="alert alert-danger">
              ⚠️ {error}
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="navigation-buttons">
            {etape > 1 && (
              <button 
                onClick={() => setEtape(prev => prev - 1)}
                className="btn btn-secondary"
                disabled={loading}
              >
                ← Retour
              </button>
            )}
            
            {etape < 5 ? (
              <button 
                onClick={validerEtape}
                className="btn btn-primary"
                disabled={loading}
              >
                Continuer →
              </button>
            ) : (
              <button 
                onClick={soumettreDevis}
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : '🎉 Soumettre mon devis'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails de prestation */}
      {modalPrestation && (
        <PrestationDetailModal
          prestation={modalPrestation}
          nombreInvites={parseInt(formData.nombreInvites) || 100}
          onClose={() => setModalPrestation(null)}
          onSelect={selectionnerDepuisModal}
        />
      )}
    </div>
  );
}

export default DevisPage;
