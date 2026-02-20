import React, { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import './InfoTicker.css';

/**
 * 📰 COMPOSANT INFO TICKER - Bande d'infos défilantes
 * Affiche des messages configurables qui défilent horizontalement
 */
function InfoTicker() {
  const { settings } = useContext(SettingsContext);

  // Récupérer les messages depuis les paramètres
  const messages = settings?.ticker?.messages || [];
  const isActive = settings?.ticker?.actif !== false; // Actif par défaut
  const backgroundColor = settings?.ticker?.couleurFond || '#d4af37';
  const textColor = settings?.ticker?.couleurTexte || '#000000';

  // Si désactivé ou pas de messages, ne rien afficher
  if (!isActive || messages.length === 0) {
    return null;
  }

  // Créer une chaîne de tous les messages séparés par un séparateur
  const tickerText = messages.join('   •   ');
  
  // Dupliquer le texte pour un défilement continu sans blanc
  const fullText = `${tickerText}   •   ${tickerText}   •   ${tickerText}`;

  return (
    <div 
      className="info-ticker" 
      style={{ 
        backgroundColor: backgroundColor,
        color: textColor 
      }}
    >
      <div className="ticker-content">
        <span className="ticker-text">{fullText}</span>
        <span className="ticker-text">{fullText}</span>
      </div>
    </div>
  );
}

export default InfoTicker;
