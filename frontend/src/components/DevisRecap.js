import React from 'react';
import './DevisRecap.css';

/**
 * 📋 Composant de récapitulatif détaillé du devis
 * Affiche tous les détails de la sélection avant validation
 */
const DevisRecap = ({ devisData, onModifier, onValider, loading = false }) => {
  
  // Calculer les totaux
  const calculerTotaux = () => {
    const sousTotalPrestations = devisData.prestations?.reduce((acc, p) => 
      acc + (p.prixUnitaire * p.quantite), 0) || 0;
    
    const sousTotalMateriels = devisData.materiels?.reduce((acc, m) => 
      acc + (m.prixLocation * m.quantite), 0) || 0;
    
    const fraisKilometriques = devisData.fraisKilometriques?.montant || 0;
    
    const autresFrais = devisData.fraisSupplementaires?.reduce((acc, f) => 
      acc + f.montant, 0) || 0;
    
    const totalHT = sousTotalPrestations + sousTotalMateriels + fraisKilometriques + autresFrais;
    
    const remise = devisData.remise?.valeur || 0;
    const montantRemise = devisData.remise?.type === 'pourcentage' 
      ? (totalHT * remise / 100) 
      : remise;
    
    const totalApresRemise = totalHT - montantRemise;
    
    const tauxTVA = devisData.tauxTVA || 20;
    const montantTVA = totalApresRemise * tauxTVA / 100;
    
    const totalTTC = totalApresRemise + montantTVA;
    
    const pourcentageAcompte = devisData.acompte?.pourcentage || 30;
    const montantAcompte = totalTTC * pourcentageAcompte / 100;
    
    return {
      sousTotalPrestations,
      sousTotalMateriels,
      fraisKilometriques,
      autresFrais,
      totalHT,
      montantRemise,
      totalApresRemise,
      montantTVA,
      totalTTC,
      montantAcompte,
      resteAPayer: totalTTC - montantAcompte
    };
  };
  
  const totaux = calculerTotaux();
  
  // Formater la date
  const formaterDate = (date) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Formater le prix
  const formaterPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(prix);
  };
  
  return (
    <div className="devis-recap">
      <div className="recap-header">
        <h2>📋 Récapitulatif de votre devis</h2>
        <p className="recap-subtitle">Vérifiez les détails avant validation</p>
      </div>
      
      {/* SECTION ÉVÉNEMENT */}
      <section className="recap-section">
        <h3>🎉 Informations événement</h3>
        <div className="recap-grid">
          <div className="recap-item">
            <span className="recap-label">Type d'événement :</span>
            <span className="recap-value">{devisData.evenement?.type || 'Non défini'}</span>
          </div>
          <div className="recap-item">
            <span className="recap-label">Date :</span>
            <span className="recap-value">{formaterDate(devisData.evenement?.date)}</span>
          </div>
          <div className="recap-item">
            <span className="recap-label">Lieu :</span>
            <span className="recap-value">
              {devisData.evenement?.lieu?.nom || devisData.evenement?.lieu?.adresse || 'Non défini'}
              {devisData.evenement?.lieu?.ville && `, ${devisData.evenement.lieu.ville}`}
            </span>
          </div>
          <div className="recap-item">
            <span className="recap-label">Nombre d'invités :</span>
            <span className="recap-value">{devisData.evenement?.nbInvites || 'Non défini'}</span>
          </div>
          {devisData.evenement?.heureDebut && (
            <div className="recap-item">
              <span className="recap-label">Horaires :</span>
              <span className="recap-value">
                {devisData.evenement.heureDebut} - {devisData.evenement.heureFin || '?'}
              </span>
            </div>
          )}
        </div>
        {devisData.evenement?.description && (
          <div className="recap-description">
            <p><strong>Description :</strong> {devisData.evenement.description}</p>
          </div>
        )}
      </section>
      
      {/* SECTION PRESTATIONS */}
      {devisData.prestations && devisData.prestations.length > 0 && (
        <section className="recap-section">
          <h3>🎬 Prestations sélectionnées</h3>
          <div className="recap-table">
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th className="text-center">Qté</th>
                  <th className="text-right">Prix unitaire</th>
                  <th className="text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {devisData.prestations.map((prestation, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{prestation.nom}</strong>
                      {prestation.categorie && (
                        <span className="categorie-badge">{prestation.categorie}</span>
                      )}
                      {prestation.options && prestation.options.length > 0 && (
                        <div className="options-list">
                          {prestation.options.map((opt, i) => (
                            <span key={i} className="option-tag">• {opt}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-center">{prestation.quantite || 1}</td>
                    <td className="text-right">{formaterPrix(prestation.prixUnitaire)}</td>
                    <td className="text-right">
                      <strong>{formaterPrix(prestation.prixUnitaire * (prestation.quantite || 1))}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-right"><strong>Sous-total prestations :</strong></td>
                  <td className="text-right"><strong>{formaterPrix(totaux.sousTotalPrestations)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
      
      {/* SECTION MATÉRIELS */}
      {devisData.materiels && devisData.materiels.length > 0 && (
        <section className="recap-section">
          <h3>🎛️ Matériels loués</h3>
          <div className="recap-table">
            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th className="text-center">Qté</th>
                  <th className="text-center">Durée</th>
                  <th className="text-right">Prix location</th>
                  <th className="text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {devisData.materiels.map((materiel, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{materiel.nom}</strong>
                      {materiel.categorie && (
                        <span className="categorie-badge">{materiel.categorie}</span>
                      )}
                    </td>
                    <td className="text-center">{materiel.quantite || 1}</td>
                    <td className="text-center">{materiel.dureeLocation || '1 jour'}</td>
                    <td className="text-right">{formaterPrix(materiel.prixLocation)}</td>
                    <td className="text-right">
                      <strong>{formaterPrix(materiel.prixLocation * (materiel.quantite || 1))}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-right"><strong>Sous-total matériels :</strong></td>
                  <td className="text-right"><strong>{formaterPrix(totaux.sousTotalMateriels)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
      
      {/* SECTION FRAIS SUPPLÉMENTAIRES */}
      {(totaux.fraisKilometriques > 0 || totaux.autresFrais > 0) && (
        <section className="recap-section">
          <h3>💰 Frais supplémentaires</h3>
          <div className="recap-table">
            <table>
              <tbody>
                {totaux.fraisKilometriques > 0 && (
                  <tr>
                    <td>
                      <strong>🚗 Frais de déplacement</strong>
                      {devisData.fraisKilometriques && (
                        <div className="frais-detail">
                          <span>Distance : {devisData.fraisKilometriques.distanceAllerRetour} km aller-retour</span>
                          <span>Dont {devisData.fraisKilometriques.kmGratuits} km offerts</span>
                          <span>
                            {devisData.fraisKilometriques.kmFacturables} km × {devisData.fraisKilometriques.tarifParKm}€/km
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="text-right"><strong>{formaterPrix(totaux.fraisKilometriques)}</strong></td>
                  </tr>
                )}
                {devisData.fraisSupplementaires?.map((frais, index) => (
                  <tr key={index}>
                    <td><strong>{frais.libelle}</strong></td>
                    <td className="text-right"><strong>{formaterPrix(frais.montant)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      
      {/* SECTION TOTAUX */}
      <section className="recap-section recap-totaux">
        <h3>💵 Totaux</h3>
        <div className="totaux-grid">
          <div className="totaux-item">
            <span className="totaux-label">Total HT :</span>
            <span className="totaux-value">{formaterPrix(totaux.totalHT)}</span>
          </div>
          
          {totaux.montantRemise > 0 && (
            <div className="totaux-item remise">
              <span className="totaux-label">
                Remise {devisData.remise?.type === 'pourcentage' && `(${devisData.remise.valeur}%)`} :
              </span>
              <span className="totaux-value">- {formaterPrix(totaux.montantRemise)}</span>
            </div>
          )}
          
          <div className="totaux-item">
            <span className="totaux-label">Total après remise :</span>
            <span className="totaux-value">{formaterPrix(totaux.totalApresRemise)}</span>
          </div>
          
          <div className="totaux-item">
            <span className="totaux-label">TVA ({devisData.tauxTVA || 20}%) :</span>
            <span className="totaux-value">{formaterPrix(totaux.montantTVA)}</span>
          </div>
          
          <div className="totaux-item total-principal">
            <span className="totaux-label">Total TTC :</span>
            <span className="totaux-value">{formaterPrix(totaux.totalTTC)}</span>
          </div>
          
          <div className="separateur"></div>
          
          <div className="totaux-item acompte">
            <span className="totaux-label">
              Acompte à verser ({devisData.acompte?.pourcentage || 30}%) :
            </span>
            <span className="totaux-value">{formaterPrix(totaux.montantAcompte)}</span>
          </div>
          
          <div className="totaux-item reste">
            <span className="totaux-label">Reste à payer :</span>
            <span className="totaux-value">{formaterPrix(totaux.resteAPayer)}</span>
          </div>
        </div>
      </section>
      
      {/* ACTIONS */}
      <div className="recap-actions">
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={onModifier}
          disabled={loading}
        >
          ← Modifier
        </button>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={onValider}
          disabled={loading}
        >
          {loading ? 'Validation en cours...' : 'Valider et continuer →'}
        </button>
      </div>
    </div>
  );
};

export default DevisRecap;
