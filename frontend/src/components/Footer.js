import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';
import { FacebookIcon, InstagramIcon, YouTubeIcon, TikTokIcon, XIcon, LinkedInIcon } from './SocialIcons';
import './Footer.css';

function Footer() {
  const { settings, loading } = useContext(SettingsContext);

  if (loading) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Colonne 1 : À propos */}
          <div className="footer-column">
            <h3 className="footer-title">
              <span className="brand-name-gold-shadow">
                {settings?.entreprise?.nom || "ELIJAH'GOD"}
              </span>
            </h3>
            <p className="footer-description">
              {settings?.entreprise?.description || 
               "Prestations événementielles professionnelles : DJ, sonorisation et animation."}
            </p>
          </div>

          {/* Colonne 2 : Navigation */}
          <div className="footer-column">
            <h4 className="footer-subtitle">🧭 Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">🏠 Accueil</Link></li>
              <li><Link to="/prestations">🎭 Nos Prestations</Link></li>
              <li><Link to="/temoignages">💬 Témoignages</Link></li>
              <li><Link to="/devis">✨ Créons votre devis</Link></li>
              <li><Link to="/contact">📞 Contact</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Contact */}
          <div className="footer-column">
            <h4 className="footer-subtitle">📞 Contact</h4>
            <ul className="footer-contact">
              {settings?.contact?.email && (
                <li>
                  <a href={`mailto:${settings.contact.email}`}>
                    ✉️ {settings.contact.email}
                  </a>
                </li>
              )}
              {settings?.contact?.telephone && (
                <li>
                  <a href={`tel:${settings.contact.telephone}`}>
                    📞 {settings.contact.telephone}
                  </a>
                </li>
              )}
              {settings?.contact?.adresse?.ville && (
                <li>
                  📍 {settings.contact.adresse.ville}
                  {settings.contact.adresse.codePostal && 
                    `, ${settings.contact.adresse.codePostal}`}
                </li>
              )}
            </ul>
          </div>

          {/* Colonne 4 : Réseaux sociaux */}
          {settings?.reseauxSociaux && (
            <div className="footer-column">
              <h4 className="footer-subtitle">🌐 Suivez-nous</h4>
              <div className="social-links">
                {settings.reseauxSociaux.facebook && (
                  <a 
                    href={settings.reseauxSociaux.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link facebook"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <FacebookIcon size={24} />
                  </a>
                )}
                {settings.reseauxSociaux.instagram && (
                  <a 
                    href={settings.reseauxSociaux.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link instagram"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <InstagramIcon size={24} />
                  </a>
                )}
                {settings.reseauxSociaux.youtube && (
                  <a 
                    href={settings.reseauxSociaux.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link youtube"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <YouTubeIcon size={24} />
                  </a>
                )}
                {settings.reseauxSociaux.tiktok && (
                  <a 
                    href={settings.reseauxSociaux.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link tiktok"
                    aria-label="TikTok"
                    title="TikTok"
                  >
                    <TikTokIcon size={24} />
                  </a>
                )}
                {settings.reseauxSociaux.twitter && (
                  <a 
                    href={settings.reseauxSociaux.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link twitter"
                    aria-label="X (Twitter)"
                    title="X (Twitter)"
                  >
                    <XIcon size={24} />
                  </a>
                )}
                {settings.reseauxSociaux.linkedin && (
                  <a 
                    href={settings.reseauxSociaux.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link linkedin"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    <LinkedInIcon size={24} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="copyright">
            {settings?.messages?.piedDePage ? (
              <span className="brand-name-gold">
                {settings.messages.piedDePage}
              </span>
            ) : (
              <>
                © {currentYear} <span className="brand-name-gold">ELIJAH'GOD</span> - Tous droits réservés
              </>
            )}
          </p>
          <div className="footer-admin">
            <Link to="/admin/login" className="admin-link">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
