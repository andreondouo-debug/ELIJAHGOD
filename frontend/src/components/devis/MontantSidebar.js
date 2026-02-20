import './MontantSidebar.css';

/**
 * 💰 SIDEBAR MONTANTS
 * Affiche le récapitulatif des prix en temps réel
 */

function MontantSidebar({ montants }) {
  if (!montants || Object.keys(montants).length === 0) {
    return (
      <div className="montant-sidebar">
        <div className="sidebar-header">
          <h3>Récapitulatif</h3>
          <p>Votre devis</p>
        </div>
        <div className="sidebar-empty">
          <div className="empty-icon">💰</div>
          <p>Les montants apparaîtront au fur et à mesure de votre sélection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="montant-sidebar">
      <div className="sidebar-header">
        <h3>Récapitulatif</h3>
        <p>Votre devis</p>
      </div>

      <div className="sidebar-content">
        {/* Prestations */}
        {montants.sousTotalPrestations > 0 && (
          <div className="montant-line">
            <span>Prestations</span>
            <span className="montant-value">{montants.sousTotalPrestations}€</span>
          </div>
        )}

        {/* Matériels */}
        {montants.sousTotalMateriels > 0 && (
          <div className="montant-line">
            <span>Matériels</span>
            <span className="montant-value">{montants.sousTotalMateriels}€</span>
          </div>
        )}

        {/* Frais supplémentaires */}
        {montants.fraisSupplementaires && montants.fraisSupplementaires.length > 0 && (
          <>
            <div className="section-divider"></div>
            {montants.fraisSupplementaires.map((frais, index) => (
              <div key={index} className="montant-line small">
                <span>{frais.libelle}</span>
                <span className="montant-value">+{frais.montant}€</span>
              </div>
            ))}
          </>
        )}

        {/* Total avant remise */}
        {montants.totalAvantRemise > 0 && (
          <>
            <div className="section-divider"></div>
            <div className="montant-line">
              <span>Sous-total</span>
              <span className="montant-value">{montants.totalAvantRemise}€</span>
            </div>
          </>
        )}

        {/* Remise */}
        {montants.remise && montants.montantRemise > 0 && (
          <div className="montant-line discount">
            <span>
              Remise {montants.remise.type === 'pourcentage' 
                ? `(${montants.remise.valeur}%)` 
                : ''}
            </span>
            <span className="montant-value">-{montants.montantRemise}€</span>
          </div>
        )}

        {/* Total HT */}
        {montants.totalFinal > 0 && (
          <>
            <div className="section-divider"></div>
            <div className="montant-line bold">
              <span>Total HT</span>
              <span className="montant-value">{montants.totalFinal}€</span>
            </div>
          </>
        )}

        {/* TVA */}
        {montants.montantTVA > 0 && (
          <div className="montant-line">
            <span>TVA ({montants.tauxTVA}%)</span>
            <span className="montant-value">{montants.montantTVA}€</span>
          </div>
        )}

        {/* Total TTC */}
        {montants.totalTTC > 0 && (
          <>
            <div className="section-divider strong"></div>
            <div className="montant-line total">
              <span>Total TTC</span>
              <span className="montant-value">{montants.totalTTC}€</span>
            </div>
          </>
        )}

        {/* Acompte */}
        {montants.acompte && montants.acompte.montant > 0 && (
          <>
            <div className="section-divider"></div>
            <div className="acompte-info">
              <div className="acompte-header">
                <span>💳 Acompte requis</span>
                <span className="acompte-percentage">({montants.acompte.pourcentage}%)</span>
              </div>
              <div className="acompte-montant">{montants.acompte.montant}€</div>
            </div>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="info-badge">
          <span>ℹ️</span>
          <p>Les montants peuvent être ajustés après validation par notre équipe</p>
        </div>
      </div>
    </div>
  );
}

export default MontantSidebar;
