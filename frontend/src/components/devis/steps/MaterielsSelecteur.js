import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ClientContext } from '../../../context/ClientContext';
import './PrestationsSelecteur.css'; // Réutilise les mêmes styles

/**
 * 🪑 ÉTAPE 6: SÉLECTION DES MATÉRIELS
 */
function MaterielsSelecteur({ data, onNext, onPrevious, loading }) {
  const { API_URL } = useContext(ClientContext);
  const [materiels, setMateriels] = useState([]);
  const [selectedMateriels, setSelectedMateriels] = useState(data?.materiels || []);
  const [loadingMateriels, setLoadingMateriels] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    chargerMateriels();
  }, []);

  const chargerMateriels = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/materiel`);
      setMateriels(response.data.materiels || []);
    } catch (error) {
      console.error('❌ Erreur chargement matériels:', error);
    } finally {
      setLoadingMateriels(false);
    }
  };

  const categories = ['Toutes', ...new Set(materiels.map(m => m.categorie))];

  const materielsFiltres = selectedCategory === 'Toutes'
    ? materiels
    : materiels.filter(m => m.categorie === selectedCategory);

  const toggleMateriel = (materiel) => {
    const exists = selectedMateriels.find(m => m.materiel === materiel._id);
    
    if (exists) {
      setSelectedMateriels(selectedMateriels.filter(m => m.materiel !== materiel._id));
    } else {
      setSelectedMateriels([
        ...selectedMateriels,
        {
          materiel: materiel._id,
          nom: materiel.nom,
          categorie: materiel.categorie,
          prixLocation: materiel.prixLocation,
          quantite: 1,
          options: {
            livraison: false,
            installation: false
          }
        }
      ]);
    }
  };

  const updateQuantite = (materielId, quantite) => {
    setSelectedMateriels(
      selectedMateriels.map(m =>
        m.materiel === materielId ? { ...m, quantite: parseInt(quantite) } : m
      )
    );
  };

  const toggleOption = (materielId, option) => {
    setSelectedMateriels(
      selectedMateriels.map(m =>
        m.materiel === materielId
          ? { ...m, options: { ...m.options, [option]: !m.options[option] } }
          : m
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ materiels: selectedMateriels });
  };

  if (loadingMateriels) {
    return (
      <div className="step-form-container">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Chargement des matériels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-form-container">
      <div className="step-header">
        <h2>🪑 De quel matériel avez-vous besoin ?</h2>
        <p>Sélectionnez le matériel à louer pour votre événement</p>
      </div>

      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="prestations-form">
        <div className="prestations-grid">
          {materielsFiltres.map(materiel => {
            const isSelected = selectedMateriels.find(m => m.materiel === materiel._id);
            const prixAffiche = materiel.prixLocation?.jour || 0;
            
            return (
              <div 
                key={materiel._id}
                className={`prestation-card ${isSelected ? 'selected' : ''}`}
              >
                <div 
                  className="prestation-header"
                  onClick={() => toggleMateriel(materiel)}
                >
                  <div className="prestation-info">
                    <h4>{materiel.nom}</h4>
                    <p className="prestation-category">{materiel.categorie}</p>
                    {materiel.description && (
                      <p className="prestation-description">{materiel.description}</p>
                    )}
                    {materiel.quantiteDisponible !== undefined && (
                      <p className="prestation-stock">
                        Stock: {materiel.quantiteDisponible} disponibles
                      </p>
                    )}
                  </div>
                  <div className="prestation-price">
                    {prixAffiche}€<small>/jour</small>
                  </div>
                  <div className="prestation-checkbox">
                    {isSelected ? '✓' : '+'}
                  </div>
                </div>

                {isSelected && (
                  <div className="prestation-options">
                    <div className="quantity-control">
                      <label>Quantité:</label>
                      <input
                        type="number"
                        min="1"
                        max={materiel.quantiteDisponible || 99}
                        value={isSelected.quantite}
                        onChange={(e) => updateQuantite(materiel._id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    <div className="options-checkboxes">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={isSelected.options.livraison}
                          onChange={() => toggleOption(materiel._id, 'livraison')}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>Livraison</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={isSelected.options.installation}
                          onChange={() => toggleOption(materiel._id, 'installation')}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>Installation</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedMateriels.length === 0 && (
          <div className="empty-selection">
            <span className="empty-icon">🪑</span>
            <p>Aucun matériel sélectionné pour le moment</p>
            <small>Vous pouvez continuer sans matériel et en ajouter plus tard</small>
          </div>
        )}

        {selectedMateriels.length > 0 && (
          <div className="selection-summary">
            <h4>Matériels sélectionnés ({selectedMateriels.length})</h4>
            <div className="selected-items">
              {selectedMateriels.map((m, index) => (
                <div key={index} className="selected-item">
                  <span>
                    {m.nom} x{m.quantite}
                    {(m.options.livraison || m.options.installation) && (
                      <small className="options-badge">
                        {m.options.livraison && ' + Livraison'}
                        {m.options.installation && ' + Installation'}
                      </small>
                    )}
                  </span>
                  <span className="item-price">{m.prixLocation.jour * m.quantite}€</span>
                </div>
              ))}
            </div>
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

export default MaterielsSelecteur;
