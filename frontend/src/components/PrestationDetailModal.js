import React, { useState, useEffect } from 'react';
import './PrestationDetailModal.css';
import axios from 'axios';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

import { API_URL } from '../config';

/**
 * 🎭 MODAL DE DÉTAILS DE PRESTATION
 * Affiche le catalogue complet d'une prestation :
 * - Description détaillée
 * - Galerie photos
 * - Prestataires disponibles avec portfolios
 * - Grille tarifaire selon nombre d'invités
 */
const PrestationDetailModal = ({ prestation, nombreInvites, onClose, onSelect, selectedPrestataire }) => {
  useBodyScrollLock(true);
  const [activeTab, setActiveTab] = useState('apercu'); // apercu, prestataires, tarifs
  const [prestataireChoisi, setPrestataireChoisi] = useState(selectedPrestataire || null);
  const [prestatairesDetails, setPrestatairesDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galerieIndex, setGalerieIndex] = useState(0);

  // Charger les détails des prestataires associés
  useEffect(() => {
    const fetchPrestataires = async () => {
      if (!prestation.prestatairesAssocies || prestation.prestatairesAssocies.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const ids = prestation.prestatairesAssocies.map(p => p.prestataireId);
        const { data } = await axios.post(`${API_URL}/api/prestataires/batch`, { ids });
        
        // Fusionner avec les infos d'association
        const merged = data.data.map(prest => {
          const assoc = prestation.prestatairesAssocies.find(
            a => a.prestataireId === prest._id
          );
          return { ...prest, ...assoc };
        });
        
        setPrestatairesDetails(merged.sort((a, b) => (a.ordre || 0) - (b.ordre || 0)));
        setLoading(false);
      } catch (error) {
        console.error('❌ Erreur chargement prestataires:', error);
        setLoading(false);
      }
    };

    fetchPrestataires();
  }, [prestation]);

  // Calculer le prix pour le nombre d'invités actuel
  const getPrixPourInvites = () => {
    if (!prestation.tarifsParInvites || prestation.tarifsParInvites.length === 0) {
      return prestation.prixBase;
    }

    const tranche = prestation.tarifsParInvites.find(t => {
      const minOk = nombreInvites >= t.min;
      const maxOk = t.max === null || nombreInvites <= t.max;
      return minOk && maxOk;
    });

    if (tranche) return tranche.prix;

    // Prendre la tranche la plus haute si aucune correspondance
    const sorted = [...prestation.tarifsParInvites].sort((a, b) => b.min - a.min);
    return sorted[0]?.prix || prestation.prixBase;
  };

  const prixEstime = getPrixPourInvites();

  // Navigation galerie
  const nextImage = () => {
    if (prestation.galerie && prestation.galerie.length > 0) {
      setGalerieIndex((prev) => (prev + 1) % prestation.galerie.length);
    }
  };

  const prevImage = () => {
    if (prestation.galerie && prestation.galerie.length > 0) {
      setGalerieIndex((prev) => 
        prev === 0 ? prestation.galerie.length - 1 : prev - 1
      );
    }
  };

  const handleSelectionner = () => {
    if (onSelect) {
      onSelect(prestation, prestataireChoisi, prixEstime);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{prestation.nom}</h2>
            <span className="categorie-badge">{prestation.categorie}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs Navigation */}
        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'apercu' ? 'active' : ''}`}
            onClick={() => setActiveTab('apercu')}
          >
            📋 Aperçu
          </button>
          <button 
            className={`tab ${activeTab === 'prestataires' ? 'active' : ''}`}
            onClick={() => setActiveTab('prestataires')}
          >
            👥 Prestataires ({prestatairesDetails.length})
          </button>
          <button 
            className={`tab ${activeTab === 'tarifs' ? 'active' : ''}`}
            onClick={() => setActiveTab('tarifs')}
          >
            💰 Tarifs
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          
          {/* ONGLET APERÇU */}
          {activeTab === 'apercu' && (
            <div className="tab-content">
              
              {/* Galerie */}
              {prestation.galerie && prestation.galerie.length > 0 && (
                <div className="galerie-section">
                  <div className="galerie-main">
                    <button className="galerie-nav prev" onClick={prevImage}>❮</button>
                    <img 
                      src={prestation.galerie[galerieIndex].url} 
                      alt={prestation.galerie[galerieIndex].description || prestation.nom}
                    />
                    <button className="galerie-nav next" onClick={nextImage}>❯</button>
                    <div className="galerie-counter">
                      {galerieIndex + 1} / {prestation.galerie.length}
                    </div>
                  </div>
                  <div className="galerie-thumbs">
                    {prestation.galerie.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img.miniature || img.url}
                        alt={`Vue ${idx + 1}`}
                        className={idx === galerieIndex ? 'active' : ''}
                        onClick={() => setGalerieIndex(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="description-section">
                <h3>📝 Description</h3>
                <p>{prestation.description}</p>

                {/* Caractéristiques */}
                {prestation.caracteristiques && prestation.caracteristiques.length > 0 && (
                  <div className="caracteristiques">
                    <h4>✨ Caractéristiques</h4>
                    <ul>
                      {prestation.caracteristiques.map((car, idx) => (
                        <li key={idx}>
                          <span className="carac-icon">{car.icone}</span>
                          <strong>{car.nom}:</strong> {car.valeur}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Inclus / Non inclus */}
                <div className="inclusions-grid">
                  {prestation.inclus && prestation.inclus.length > 0 && (
                    <div className="inclus">
                      <h4>✅ Inclus</h4>
                      <ul>
                        {prestation.inclus.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {prestation.nonInclus && prestation.nonInclus.length > 0 && (
                    <div className="non-inclus">
                      <h4>❌ Non inclus</h4>
                      <ul>
                        {prestation.nonInclus.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Prix estimé */}
              <div className="prix-estime-box">
                <div className="prix-info">
                  <span className="prix-label">Prix estimé pour {nombreInvites} invités</span>
                  <span className="prix-valeur">{prixEstime}€</span>
                </div>
                {prestation.unite && (
                  <span className="prix-unite">par {prestation.unite}</span>
                )}
              </div>
            </div>
          )}

          {/* ONGLET PRESTATAIRES */}
          {activeTab === 'prestataires' && (
            <div className="tab-content">
              {loading ? (
                <div className="loading-spinner">⏳ Chargement des prestataires...</div>
              ) : prestatairesDetails.length === 0 ? (
                <div className="empty-state">
                  <p>Aucun prestataire associé pour le moment.</p>
                  <p>Cette prestation est gérée directement par ELIJAHGOD.</p>
                </div>
              ) : (
                <div className="prestataires-list">
                  {prestatairesDetails.map((prest) => (
                    <div 
                      key={prest._id}
                      className={`prestataire-card ${prestataireChoisi === prest._id ? 'selected' : ''}`}
                      onClick={() => setPrestataireChoisi(prest._id)}
                    >
                      <div className="prestataire-photo">
                        {prest.logo ? (
                          <img src={prest.logo} alt={prest.nomEntreprise} />
                        ) : (
                          <div className="photo-placeholder">👤</div>
                        )}
                      </div>
                      
                      <div className="prestataire-info">
                        <h3>{prest.nomEntreprise}</h3>
                        <p className="prestataire-contact">{prest.prenom} {prest.nom}</p>
                        
                        {prest.specialites && prest.specialites.length > 0 && (
                          <div className="specialites">
                            {prest.specialites.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="spec-tag">{spec}</span>
                            ))}
                          </div>
                        )}

                        {prest.noteMoyenne > 0 && (
                          <div className="prestataire-note">
                            <span className="etoiles">{'⭐'.repeat(Math.round(prest.noteMoyenne))}</span>
                            <span className="note-valeur">{prest.noteMoyenne.toFixed(1)}</span>
                            <span className="note-count">({prest.nombreAvis} avis)</span>
                          </div>
                        )}

                        {prest.disponibilite && (
                          <div className={`dispo-badge ${prest.disponibilite}`}>
                            {prest.disponibilite === 'disponible' && '✅ Disponible'}
                            {prest.disponibilite === 'sur_demande' && '📞 Sur demande'}
                            {prest.disponibilite === 'indisponible' && '❌ Indisponible'}
                          </div>
                        )}

                        {prest.tarifSpecifique && (
                          <div className="tarif-specifique">
                            Prix: <strong>{prest.tarifSpecifique}€</strong>
                          </div>
                        )}
                      </div>

                      {prestataireChoisi === prest._id && (
                        <div className="selection-checkmark">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ONGLET TARIFS */}
          {activeTab === 'tarifs' && (
            <div className="tab-content">
              {prestation.tarifsParInvites && prestation.tarifsParInvites.length > 0 ? (
                <div className="tarifs-grid">
                  <h3>💰 Grille tarifaire selon le nombre d'invités</h3>
                  <div className="tarifs-table">
                    <div className="tarifs-header">
                      <span>Nombre d'invités</span>
                      <span>Prix</span>
                    </div>
                    {prestation.tarifsParInvites
                      .sort((a, b) => a.min - b.min)
                      .map((tarif, idx) => {
                        const isActive = nombreInvites >= tarif.min && 
                          (tarif.max === null || nombreInvites <= tarif.max);
                        
                        return (
                          <div 
                            key={idx} 
                            className={`tarif-row ${isActive ? 'active' : ''}`}
                          >
                            <span className="tarif-range">
                              {tarif.label && <strong>{tarif.label}</strong>}
                              {tarif.min === 0 ? 'Jusqu\'à' : tarif.min}{' '}
                              {tarif.max ? `- ${tarif.max}` : '+'} invités
                            </span>
                            <span className="tarif-prix">
                              {tarif.prix}€
                              {isActive && <span className="prix-actif-badge">Votre tarif</span>}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="tarif-simple">
                  <h3>💰 Tarif forfaitaire</h3>
                  <div className="prix-box-large">
                    <span className="prix-montant">{prestation.prixBase}€</span>
                    <span className="prix-description">
                      par {prestation.unite || 'forfait'}
                    </span>
                  </div>
                  <p>Ce tarif s'applique quel que soit le nombre d'invités.</p>
                </div>
              )}

              {/* Tarifs supplémentaires */}
              {(prestation.tarifWeekend > 0 || prestation.tarifNuit > 0) && (
                <div className="tarifs-supplements">
                  <h4>💡 Suppléments tarifaires</h4>
                  <ul>
                    {prestation.tarifWeekend > 0 && (
                      <li>Weekend: <strong>+{prestation.tarifWeekend}€</strong></li>
                    )}
                    {prestation.tarifNuit > 0 && (
                      <li>Soirée (après 22h): <strong>+{prestation.tarifNuit}€</strong></li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer avec CTA */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Retour
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSelectionner}
            disabled={prestatairesDetails.length > 0 && !prestataireChoisi}
          >
            {prestatairesDetails.length > 0 && !prestataireChoisi 
              ? '👆 Choisissez un prestataire'
              : '✅ Sélectionner cette prestation'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrestationDetailModal;
