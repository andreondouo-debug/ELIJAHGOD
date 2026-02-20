import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Header.css';

/**
 * 🎨 COMPOSANT HEADER - ELIJAH'GOD
 * Affiche le logo et la navigation principale
 */

const Header = () => {
  const [logoUrl, setLogoUrl] = useState('/images/logo.png');
  const [entreprise, setEntreprise] = useState({ nom: "ELIJAH'GOD" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer les paramètres du site avec le logo
    const fetchSettings = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/settings');
        
        if (response.data.success) {
          const { entreprise } = response.data.data;
          setEntreprise(entreprise);
          setLogoUrl(entreprise.logo || '/images/logo.png');
        }
      } catch (error) {
        console.error('❌ Erreur chargement settings:', error);
        // Utiliser le logo par défaut en cas d'erreur
        setLogoUrl('/images/logo.png');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleLogoError = () => {
    // Fallback si le logo ne charge pas
    console.warn('⚠️ Logo non trouvé, utilisation du placeholder');
    setLogoUrl('/images/logo-placeholder.png');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <a href="/" aria-label="Retour à l'accueil">
            {isLoading ? (
              <div className="logo-skeleton">
                {/* Placeholder pendant le chargement */}
                <span>⏳</span>
              </div>
            ) : (
              <img
                src={logoUrl}
                alt={`${entreprise.nom} Logo`}
                className="logo-img"
                onError={handleLogoError}
              />
            )}
          </a>
          <span className="logo-text">{entreprise.nom}</span>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <ul className="nav-list">
            <li><a href="/">Accueil</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/devis">Devis</a></li>
            <li><a href="/temoignages">Témoignages</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>

        {/* Actions utilisateur */}
        <div className="header-actions">
          <a href="/login" className="btn-login">Connexion</a>
          <a href="/devis/nouveau" className="btn-cta">Demander un devis</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
