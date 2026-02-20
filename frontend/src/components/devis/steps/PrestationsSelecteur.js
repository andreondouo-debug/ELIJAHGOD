import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ClientContext } from '../../../context/ClientContext';
import './PrestationsSelecteur.css';

/**
 * 🎵 ÉTAPE 5: SÉLECTION DES PRESTATIONS
 */
function PrestationsSelecteur({ data, onNext, onPrevious, loading }) {
  const { API_URL } = useContext(ClientContext);
  const [prestations, setPrestations] = useState([]);
  const [selectedPrestations, setSelectedPrestations] = useState(data?.prestations || []);
  const [loadingPrestations, setLoadingPrestations] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    chargerPrestations();
  }, []);

  const chargerPrestations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/prestations`);
      setPrestations(response.data.prestations || []);
    } catch (error) {
      console.error('❌ Erreur chargement prestations:', error);
    } finally {
      setLoadingPrestations(false);
    }
  };

  const categories = ['Toutes', ...new Set(prestations.map(p => p.categorie))];

  const prestationsFiltrees = selectedCategory === 'Toutes'
    ? prestations
    : prestations.filter(p => p.categorie === selectedCategory);

  const togglePrestation = (prestation) => {
    const exists = selectedPrestations.find(p => p.prestation === prestation._id);
    
    if (exists) {
      setSelectedPrestations(selectedPrestations.filter(p => p.prestation !== prestation._id));
    } else {
      setSelectedPrestations([
        ...selectedPrestations,
        {
          prestation: prestation._id,
          nom: prestation.nom,
          categorie: prestation.categorie,
          prixUnitaire: prestation.tarif,
          quantite: 1,
          duree: prestation.duree || '',
          options: {}
        }
      ]);
    }
  };

  const updateQuantite = (prestationId, quantite) => {
    setSelectedPrestations(
      selectedPrestations.map(p =>
        p.prestation === prestationId ? { ...p, quantite: parseInt(quantite) } : p
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ prestations: selectedPrestations });
  };

  if (loadingPrestations) {
    return (
      <div className="step-form-container">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Chargement des prestations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-form-container">
      <div className="step-header">
        <h2>🎵 Quelles prestations souhaitez-vous ?</h2>
        <p>Sélectionnez les prestations pour votre événement</p>
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
          {prestationsFiltrees.map(prestation => {
            const isSelected = selectedPrestations.find(p => p.prestation === prestation._id);
            
            return (
              <div 
                key={prestation._id}
                className={`prestation-card ${isSelected ? 'selected' : ''}`}
              >
                <div 
                  className="prestation-header"
                  onClick={() => togglePrestation(prestation)}
                >
                  <div className="prestation-info">
                    <h4>{prestation.nom}</h4>
                    <p className="prestation-category">{prestation.categorie}</p>
                    {prestation.description && (
                      <p className="prestation-description">{prestation.description}</p>
                    )}
                  </div>
                  <div className="prestation-price">
                    {prestation.tarif}€
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
                        max="99"
                        value={isSelected.quantite}
                        onChange={(e) => updateQuantite(prestation._id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedPrestations.length === 0 && (
          <div className="empty-selection">
            <span className="empty-icon">🎵</span>
            <p>Aucune prestation sélectionnée pour le moment</p>
            <small>Vous pouvez continuer sans prestation et en ajouter plus tard</small>
          </div>
        )}

        {selectedPrestations.length > 0 && (
          <div className="selection-summary">
            <h4>Prestations sélectionnées ({selectedPrestations.length})</h4>
            <div className="selected-items">
              {selectedPrestations.map((p, index) => (
                <div key={index} className="selected-item">
                  <span>{p.nom} x{p.quantite}</span>
                  <span className="item-price">{p.prixUnitaire * p.quantite}€</span>
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

export default PrestationsSelecteur;
