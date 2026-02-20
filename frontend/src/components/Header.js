import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LockKeyhole, LayoutDashboard, LogOut,
  User, Building2, ShieldCheck,
  Phone, Sparkles
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import { ClientContext } from '../context/ClientContext';
import { PrestataireContext } from '../context/PrestataireContext';
import useAuth from '../hooks/useAuth';
import './Header.css';

function Header() {
  const { settings } = useContext(SettingsContext);
  useContext(ClientContext);
  useContext(PrestataireContext);
  const { isAuthenticated, getUserTypeIcon, logout, getDisplayName, userType } = useAuth();
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navRef = useRef(null);

  // Fermer les menus si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAuthMenu(false);
      }
      if (navRef.current && !navRef.current.contains(event.target) &&
          !event.target.closest('.menu-toggle')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Bloquer le scroll body quand menu mobile ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const fermerMenu = () => {
    setMenuOpen(false);
    setShowAuthMenu(false);
  };

  const logoUrl = settings?.entreprise?.logo || '/images/logo.png';
  const nomEntreprise = settings?.entreprise?.nom || "ELIJAH'GOD";
  const slogan = settings?.entreprise?.slogan;

  const authDropdownContent = (
    <>
      {isAuthenticated ? (
        <div className="auth-section authenticated-menu">
          <h4>{getUserTypeIcon()} {getDisplayName()}</h4>
          <Link to={`/${userType}/dashboard`} className="auth-link primary" onClick={fermerMenu}>
            <LayoutDashboard size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Tableau de bord
          </Link>
          <button className="auth-link logout-btn" onClick={() => { logout(); fermerMenu(); }}>
            <LogOut size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Se déconnecter
          </button>
        </div>
      ) : (
        <>
          <div className="auth-section">
            <h4><User size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} /> Client</h4>
            <Link to="/client/login" className="auth-link" onClick={fermerMenu}>Se connecter</Link>
            <Link to="/client/inscription" className="auth-link primary" onClick={fermerMenu}>S'inscrire</Link>
          </div>
          <div className="auth-section">
            <h4><Building2 size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} /> Prestataire</h4>
            <Link to="/prestataire/login" className="auth-link" onClick={fermerMenu}>Se connecter</Link>
            <Link to="/prestataire/inscription" className="auth-link primary" onClick={fermerMenu}>S'inscrire</Link>
          </div>
          <div className="auth-section">
            <h4><ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} /> Administrateur</h4>
            <Link to="/admin/login" className="auth-link" onClick={fermerMenu}>Se connecter</Link>
          </div>
        </>
      )}
    </>
  );

  return (
    <header className="header">
      {/* Overlay sombre derrière le menu mobile */}
      {menuOpen && <div className="nav-overlay" onClick={fermerMenu} />}

      <div className="header-inner">
        <div className="header-content">

          {/* Logo */}
          <Link to="/" className="logo" onClick={fermerMenu}>
            <img
              src={logoUrl}
              alt={`${nomEntreprise} Logo`}
              className="logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="logo-text-container">
              <h1 className="logo-text">{nomEntreprise}</h1>
              {slogan && <p className="logo-slogan">{slogan}</p>}
            </div>
          </Link>

          {/* Navigation (desktop inline, mobile panneau latéral) */}
          <nav className={`nav${menuOpen ? ' nav-open' : ''}`} ref={navRef}>
            <Link to="/" className="nav-link" onClick={fermerMenu}>Accueil</Link>
            <Link to="/prestations" className="nav-link" onClick={fermerMenu}>Prestations</Link>
            <Link to="/prestataires" className="nav-link" onClick={fermerMenu}>Prestataires</Link>
            <Link to="/a-propos" className="nav-link" onClick={fermerMenu}>À propos</Link>
            <Link to="/temoignages" className="nav-link" onClick={fermerMenu}>Témoignages</Link>
            <Link to="/devis" className="nav-link btn-devis" onClick={fermerMenu}>
              <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
              Créons votre devis
            </Link>
            <Link to="/contact" className="nav-link" onClick={fermerMenu}>Contact</Link>

            {/* Bloc connexion visible uniquement dans le panneau mobile */}
            <div className="nav-mobile-auth">
              <div className="auth-menu-container" ref={menuRef}>
                <button
                  className={`btn-connexion ${isAuthenticated ? 'connected' : ''}`}
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                >
                  {isAuthenticated
                    ? <>{getUserTypeIcon()} <span className="connection-status-badge">●</span> Connecté</>
                    : <><LockKeyhole size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Connexion / Inscription</>
                  }
                </button>
                {showAuthMenu && (
                  <div className="auth-dropdown">
                    {authDropdownContent}
                  </div>
                )}
              </div>
              {settings?.contact?.telephone && (
                <a href={`tel:${settings.contact.telephone}`} className="contact-phone" onClick={fermerMenu}>
                  <Phone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {settings.contact.telephone}
                </a>
              )}
            </div>
          </nav>

          {/* Actions desktop + bouton hamburger */}
          <div className="header-right">
            {/* Bouton connexion visible sur desktop uniquement */}
            <div className="header-actions desktop-only" ref={menuRef}>
              <div className="auth-menu-container">
                <button
                  className={`btn-connexion ${isAuthenticated ? 'connected' : ''}`}
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                >
                  {isAuthenticated
                    ? <>{getUserTypeIcon()} <span className="connection-status-badge">●</span> Connecté</>
                    : <><LockKeyhole size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Connexion</>
                  }
                </button>
                {showAuthMenu && (
                  <div className="auth-dropdown">
                    {authDropdownContent}
                  </div>
                )}
              </div>
              {settings?.contact?.telephone && (
                <a href={`tel:${settings.contact.telephone}`} className="contact-phone">
                  <Phone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {settings.contact.telephone}
                </a>
              )}
            </div>

            {/* Bouton hamburger — mobile/tablette uniquement */}
            <button
              className={`menu-toggle${menuOpen ? ' menu-toggle-open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
