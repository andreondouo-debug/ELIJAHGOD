import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './PrestataireProfilPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function PrestataireProfilPage() {
  const { id } = useParams();
  const [prestataire, setPrestataire] = useState(null);
  const [prestations, setPrestations] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [activeTab, setActiveTab] = useState('apropos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger le profil
      const prestataireRes = await axios.get(`${API_URL}/api/prestataires/${id}`);
      setPrestataire(prestataireRes.data.data);

      // Charger prestations du prestataire
      const prestationsRes = await axios.get(`${API_URL}/api/prestations?prestataireId=${id}`);
      setPrestations(prestationsRes.data.data || []);

      // Charger matériel du prestataire
      const materielRes = await axios.get(`${API_URL}/api/materiel?prestataireId=${id}`);
      setMateriels(materielRes.data.data || []);
      
      setError(null);
    } catch (err) {
      console.error('❌ Erreur chargement:', err);
      setError('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (note) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= note ? 'filled' : 'empty'}`}>
          {i <= note ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error || !prestataire) {
    return (
      <div className="error-page">
        <div className="container">
          <h2>❌ Erreur</h2>
          <p>{error || 'Prestataire introuvable'}</p>
          <Link to="/prestataires" className="btn btn-primary">
            Retour aux prestataires
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="prestataire-profil-page">
      {/* Header / Hero */}
      <section className="profil-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-logo">
              {prestataire.logo?.url ? (
                <img src={prestataire.logo.url} alt={prestataire.nomEntreprise} />
              ) : (
                <div className="logo-placeholder">
                  {prestataire.nomEntreprise.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="hero-info">
              <div className="hero-header">
                <h1>{prestataire.nomEntreprise}</h1>
                {prestataire.isVerified && (
                  <span className="badge-verified" title="Prestataire vérifié">✓ Vérifié</span>
                )}
                {prestataire.plan === 'premium' && (
                  <span className="badge-premium">⭐ Premium</span>
                )}
              </div>
              
              <span className="categorie-badge">{prestataire.categorie}</span>
              
              {prestataire.nombreAvis > 0 && (
                <div className="rating-large">
                  <div className="stars">
                    {renderStars(prestataire.noteGlobale)}
                  </div>
                  <span className="rating-number">{prestataire.noteGlobale}/5</span>
                  <span className="reviews-count">({prestataire.nombreAvis} avis)</span>
                </div>
              )}

              {prestataire.stats && (
                <div className="stats-quick">
                  <div className="stat-item">
                    <span className="stat-value">{prestataire.stats.vuesProfil}</span>
                    <span className="stat-label">vues</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{prestataire.stats.reservationsConfirmees}</span>
                    <span className="stat-label">réservations</span>
                  </div>
                </div>
              )}
            </div>

            <div className="hero-actions">
              <Link to={`/devis?prestataire=${prestataire._id}`} className="btn btn-primary btn-lg">
                Demander un devis
              </Link>
              {prestataire.telephone && (
                <a href={`tel:${prestataire.telephone}`} className="btn btn-outline">
                  📞 {prestataire.telephone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Galerie photos */}
      {prestataire.photos && prestataire.photos.length > 0 && (
        <section className="galerie-photos">
          <div className="container">
            <div className="photos-grid">
              {prestataire.photos.slice(0, 4).map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo.url} alt={photo.description || `Photo ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="container">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'apropos' ? 'active' : ''}`}
            onClick={() => setActiveTab('apropos')}
          >
            À propos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'prestations' ? 'active' : ''}`}
            onClick={() => setActiveTab('prestations')}
          >
           Prestations ({prestations.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'materiel' ? 'active' : ''}`}
            onClick={() => setActiveTab('materiel')}
          >
            Matériel ({materiels.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'avis' ? 'active' : ''}`}
            onClick={() => setActiveTab('avis')}
          >
            Avis ({prestataire.nombreAvis})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* À propos */}
          {activeTab === 'apropos' && (
            <div className="apropos-content">
              <div className="description-section card">
                <h2>À propos</h2>
                <p>{prestataire.description || 'Aucune description disponible.'}</p>
              </div>

              {prestataire.specialites && prestataire.specialites.length > 0 && (
                <div className="specialites-section card">
                  <h3>Spécialités</h3>
                  <div className="specialites-list">
                    {prestataire.specialites.map((spec, index) => (
                      <span key={index} className="specialite-tag">{spec}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="contact-section card">
                <h3>Contact</h3>
                <div className="contact-info">
                  {prestataire.telephone && (
                    <p>📞 {prestataire.telephone}</p>
                  )}
                  {prestataire.siteWeb && (
                    <p>🌐 <a href={prestataire.siteWeb} target="_blank" rel="noopener noreferrer">{prestataire.siteWeb}</a></p>
                  )}
                  {prestataire.reseauxSociaux && (
                    <div className="social-links">
                      {prestataire.reseauxSociaux.facebook && (
                        <a href={prestataire.reseauxSociaux.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                      )}
                      {prestataire.reseauxSociaux.instagram && (
                        <a href={prestataire.reseauxSociaux.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                      )}
                      {prestataire.reseauxSociaux.youtube && (
                        <a href={prestataire.reseauxSociaux.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prestations */}
          {activeTab === 'prestations' && (
            <div className="prestations-content">
              {prestations.length === 0 ? (
                <p className="empty-message">Aucune prestation disponible pour le moment.</p>
              ) : (
                <div className="prestations-grid">
                  {prestations.map(prestation => (
                    <div key={prestation._id} className="prestation-card card">
                      <h4>{prestation.nom}</h4>
                      <p>{prestation.description}</p>
                      <div className="prestation-footer">
                        <span className="prix">{prestation.prixBase}€</span>
                        <Link to={`/devis?prestation=${prestation._id}`} className="btn btn-sm btn-primary">
                          Choisir
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Matériel */}
          {activeTab === 'materiel' && (
            <div className="materiel-content">
              {materiels.length === 0 ? (
                <p className="empty-message">Aucun matériel disponible pour le moment.</p>
              ) : (
                <div className="materiel-grid">
                  {materiels.map(materiel => (
                    <div key={materiel._id} className="materiel-card card">
                      {materiel.photos && materiel.photos[0] && (
                        <div className="materiel-image">
                          <img src={materiel.photos[0].url} alt={materiel.nom} />
                        </div>
                      )}
                      <h4>{materiel.nom}</h4>
                      <span className="categorie-tag">{materiel.categorie}</span>
                      <p>{materiel.description}</p>
                      <div className="materiel-footer">
                        <div className="prix-info">
                          <span className="prix">{materiel.prixLocation.jour}€/jour</span>
                          {materiel.quantiteDisponible > 0 ? (
                            <span className="dispo">✓ Disponible</span>
                          ) : (
                            <span className="indispo">✗ Indisponible</span>
                          )}
                        </div>
                        <Link to={`/materiel/${materiel._id}`} className="btn btn-sm btn-outline">
                          Détails
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Avis */}
          {activeTab === 'avis' && (
            <div className="avis-content">
              {prestataire.avis && prestataire.avis.length > 0 ? (
                <div className="avis-list">
                  {prestataire.avis.map((avis, index) => (
                    <div key={index} className="avis-card card">
                      <div className="avis-header">
                        <span className="client-name">{avis.client}</span>
                        <div className="stars-small">
                          {renderStars(avis.note)}
                        </div>
                      </div>
                      <p className="avis-commentaire">{avis.commentaire}</p>
                      <div className="avis-meta">
                        {avis.typeEvenement && <span>Type: {avis.typeEvenement}</span>}
                        <span>{new Date(avis.dateAvis).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">Aucun avis pour le moment.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrestataireProfilPage;
