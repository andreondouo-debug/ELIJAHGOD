import DevisRecap from '../../DevisRecap';
import './Recapitulatif.css';

/**
 * 📋 ÉTAPE 8: RÉCAPITULATIF DÉTAILLÉ
 * Utilise le composant DevisRecap professionnel avec calcul complet
 */
function RecapitulatifForm({ data, montants, onNext, onPrevious, loading }) {
  
  const handleValider = () => {
    // Passer à l'étape de validation
    onNext({});
  };

  const handleModifier = () => {
    // Retour en arrière pour modifier
    onPrevious();
  };

  // Préparer les données pour DevisRecap
  const devisData = {
    evenement: data.evenement || {},
    prestations: data.prestations || [],
    materiels: data.materiels || [],
    fraisKilometriques: montants?.fraisKilometriques || null,
    fraisSupplementaires: montants?.fraisSupplementaires || [],
    remise: montants?.remise || null,
    tauxTVA: montants?.tauxTVA || 20,
    acompte: montants?.acompte || { pourcentage: 30 }
  };

  return (
    <div className="step-form-container recapitulatif-container">
      <DevisRecap 
        devisData={devisData}
        onModifier={handleModifier}
        onValider={handleValider}
        loading={loading}
      />
    </div>
  );
}

export default RecapitulatifForm;
