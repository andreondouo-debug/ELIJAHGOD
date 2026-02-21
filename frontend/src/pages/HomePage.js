import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';
import { API_URL } from '../config';
import './HomePage.css';

// Image de fond contextuelle par défaut (musique / événements)
// Photo festive : mariage avec groupe de musique en live (Pexels)
const IMAGE_HERO_DEFAUT = 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';

function HomePage() {
  const { settings } = useContext(SettingsContext);
  
  // Récupérer les paramètres du carousel et des sections
  const carousel = settings?.carousel || {
    titre: "ELIJAH'GOD",
    tagline: "Servir avec excellence, inspiré par la foi.",
    boutonPrincipal: { texte: "✨ Créons votre devis", lien: "/devis" },
    boutonSecondaire: { texte: "Découvrir nos services", lien: "/prestations" },
    disposition: "centre",
    alignement: "centre"
  };

  const sections = settings?.homepage?.sections || [];
  const activeSections = sections.filter(s => s.actif).sort((a, b) => a.ordre - b.ordre);
  
  // Animation au scroll avec Intersection Observer
  useEffect(() => {
    const triggerAnimation = (el) => {
      const animationType = el.getAttribute('data-animation');
      if (animationType && animationType !== 'none') {
        el.classList.add(`animate-${animationType}`);
      } else {
        el.classList.add('animate-fade-in');
      }
    };

    const observerOptions = {
      threshold: 0.12,
      rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerAnimation(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observer toutes les sections animées
    const sections = document.querySelectorAll('.section-animated');
    sections.forEach(el => observer.observe(el));

    // Déclencher immédiatement les sections déjà visibles dans le viewport
    setTimeout(() => {
      document.querySelectorAll('.section-animated').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && !el.classList.contains('animate-fade-in') &&
            !el.classList.contains('animate-slide-in-left') &&
            !el.classList.contains('animate-slide-in-right') &&
            !el.classList.contains('animate-slide-in-up') &&
            !el.classList.contains('animate-slide-in-down') &&
            !el.classList.contains('animate-zoom-in') &&
            !el.classList.contains('animate-flip-in')) {
          triggerAnimation(el);
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, [activeSections]); // Re-run quand les sections changent

  // Fonction pour rendre une section selon son type
  const renderSection = (section) => {
    // Configuration de l'animation
    const animation = section.animation || { type: 'fade-in', delay: 0, duration: 800, easing: 'ease-out' };
    const animationClass = animation.type !== 'none' ? 'section-animated' : '';
    
    const className = `section ${section.type}-section section-${section.disposition} ${animationClass}`;
    
    const sectionStyle = {
      backgroundColor: section.couleurs?.arrierePlan || '#ffffff',
      color: section.couleurs?.texte || '#1a1a1a',
      // Variables CSS pour l'animation
      '--animation-duration': `${animation.duration}ms`,
      '--animation-delay': `${animation.delay}ms`,
      '--animation-easing': animation.easing
    };
    const titleStyle = {
      color: section.couleurs?.titre || section.couleurs?.texte || '#1a1a1a'
    };
    
    switch (section.type) {
      case 'mission':
        return (
          <section key={section.id} className={className} style={sectionStyle} data-animation={animation.type}>
            <div className="container">
              <h2 className="section-title" style={titleStyle}>
                {section.titre.includes("ELIJAH'GOD") ? (
                  <>
                    {section.titre.split("ELIJAH'GOD")[0]}
                    <span className="brand-name-gold-shadow">ELIJAH'GOD</span>
                    {section.titre.split("ELIJAH'GOD")[1]}
                  </>
                ) : section.titre}
              </h2>
              <div className="section-divider"></div>
              <div className="mission-content">
                <p className="mission-intro">{section.contenu}</p>
                {section.sousTitre && <p className="mission-text">{section.sousTitre}</p>}
              </div>
            </div>
          </section>
        );

      case 'team':
        return (
          <section key={section.id} className={className} style={sectionStyle} data-animation={animation.type}>
            <div className="container">
              <h2 className="section-title" style={titleStyle}>{section.titre}</h2>
              <div className="section-divider"></div>
              {section.sousTitre && (
                <p className="section-subtitle">{section.sousTitre}</p>
              )}
              <div className="team-grid">
                {['🎧 DJs', '🎤 Animateurs', '🎵 Groupes de louange', '🍽️ Traiteurs', 
                  '📸 Photographes', '🎥 Vidéastes', '🔊 Techniciens son', '💡 Techniciens lumière']
                  .map((item, idx) => {
                    const [icon, name] = item.split(' ');
                    return (
                      <div key={idx} className="team-card stagger-item hover-lift">
                        <div className="team-icon">{icon}</div>
                        <h3>{name}</h3>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        );

      case 'values':
        return (
          <section key={section.id} className={className} style={sectionStyle} data-animation={animation.type}>
            <div className="container">
              <h2 className="section-title" style={titleStyle}>
                {section.titre.includes("ELIJAH'GOD") ? (
                  <>
                    {section.titre.split("ELIJAH'GOD")[0]}
                    <span className="brand-name-gold-shadow">ELIJAH'GOD</span>
                    {section.titre.split("ELIJAH'GOD")[1]}
                  </>
                ) : section.titre}
              </h2>
              <div className="values-content">
                {section.contenu && <p className="values-text">{section.contenu}</p>}
                <div className="values-grid">
                  <div className="value-item stagger-item hover-lift">
                    <div className="value-icon">❤️</div>
                    <h3>Cœur</h3>
                    <p>Chaque événement est traité avec passion et dévouement</p>
                  </div>
                  <div className="value-item stagger-item hover-lift">
                    <div className="value-icon">✨</div>
                    <h3>Intégrité</h3>
                    <p>Transparence et honnêteté dans chacune de nos actions</p>
                  </div>
                  <div className="value-item stagger-item hover-lift">
                    <div className="value-icon">🌟</div>
                    <h3>Excellence</h3>
                    <p>Un service de qualité professionnelle à chaque prestation</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key={section.id} className={className} style={sectionStyle} data-animation={animation.type}>
            <div className="container">
              <div className="final-cta-content">
                <h2 className="final-cta-title" style={titleStyle}>
                  {section.titre.includes("ELIJAH'GOD") ? (
                    <>
                      {section.titre.split("ELIJAH'GOD")[0]}
                      <span className="brand-name-gold-shadow">ELIJAH'GOD</span>
                      {section.titre.split("ELIJAH'GOD")[1]}
                    </>
                  ) : section.titre}
                </h2>
                {section.sousTitre && <p className="final-cta-text">{section.sousTitre}</p>}
                <div className="final-cta-buttons">
                  <Link to="/devis" className="btn btn-accent btn-lg hover-lift btn-ripple">
                    {section.contenu || "Demander mon devis gratuit"}
                  </Link>
                  <Link to="/contact" className="btn btn-primary-outline btn-lg hover-lift">
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section 
        className={`hero hero-${carousel.disposition} hero-align-${carousel.alignement}`}
        style={{
          backgroundImage: (() => {
            const banniere = settings?.entreprise?.banniere;
            // Ignorer les chemins locaux cassés (.jpg qui n'existe pas)
            const banniereBrisee = !banniere ||
              banniere === '/images/banniere.jpg' ||
              banniere === '/images/banniere.svg';
            const imgUrl = banniereBrisee
              ? IMAGE_HERO_DEFAUT
              : banniere.startsWith('http')
                ? banniere                          // URL externe (Pexels, Cloudinary…)
                : banniere.startsWith('/images/')   // fichier dans public/ de Vercel
                  ? banniere
                  : `${API_URL}${banniere}`;        // upload sur le backend (/uploads/…)
            const overlay = carousel.couleurs?.overlay || 'rgba(0, 0, 0, 0.42)';
            return `linear-gradient(${overlay}, ${overlay}), url(${imgUrl})`;
          })(),
          backgroundColor: '#000000',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: carousel.couleurs?.texte || '#ffffff'
        }}
      >
        <div className={`container hero-content hero-content-${carousel.disposition}`} style={{ color: carousel.couleurs?.texte || '#ffffff' }}>
          <h1 className="hero-title fade-in-down">{carousel.titre}</h1>
          <p className="hero-tagline fade-in-down animate-delay-1">{carousel.tagline}</p>
          <div className="hero-buttons fade-in-up animate-delay-2">
            {carousel.boutonPrincipal?.texte && (
              <Link to={carousel.boutonPrincipal.lien} className="btn btn-accent btn-lg hover-lift btn-ripple">
                {carousel.boutonPrincipal.texte}
              </Link>
            )}
            {carousel.boutonSecondaire?.texte && (
              <Link to={carousel.boutonSecondaire.lien} className="btn btn-primary-outline btn-lg hover-lift">
                {carousel.boutonSecondaire.texte}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Sections dynamiques depuis les paramètres */}
      {activeSections.length > 0 ? (
        activeSections.map(section => renderSection(section))
      ) : (
        // Sections par défaut si aucune configuration
        <>
          {/* Mission Section */}
          <section className="section mission-section section-animated" data-animation="fade-in" style={{ '--animation-duration': '800ms', '--animation-delay': '0ms', '--animation-easing': 'ease-out' }}>
            <div className="container">
              <h2 className="section-title">Bienvenue chez <span className="brand-name-gold-shadow">ELIJAH'GOD</span></h2>
              <div className="section-divider"></div>
              <div className="mission-content">
                <p className="mission-intro">
                  Une micro‑entreprise dédiée à la création d'événements harmonieux, professionnels et porteurs de sens.
                </p>
                <p className="mission-text">
                  Ici, nous croyons que chaque célébration — mariage, conférence, soirée, culte ou événement familial — 
                  est une occasion d'apporter de la joie, de la paix et de la lumière.
                </p>
              </div>
            </div>
          </section>

      {/* Team Section */}
      <section className="section team-section section-animated" data-animation="slide-in-left" style={{ '--animation-duration': '800ms', '--animation-delay': '100ms', '--animation-easing': 'ease-out' }}>
        <div className="container">
          <h2 className="section-title">Notre Équipe de Prestataires</h2>
          <div className="section-divider"></div>
          <p className="section-subtitle">
            Je travaille avec une équipe interne de prestataires talentueux, tous engagés, sérieux et passionnés.
          </p>
          
          <div className="team-grid">
            <div className="team-card stagger-item hover-lift">
              <div className="team-icon">🎧</div>
              <h3>DJs</h3>
            </div>
            <div className="team-card stagger-item hover-lift">
              <div className="team-icon">🎤</div>
              <h3>Animateurs</h3>
            </div>
            <div className="team-card stagger-item hover-lift">
              <div className="team-icon">🎵</div>
              <h3>Groupes de louange</h3>
            </div>
            <div className="team-card stagger-item hover-lift">
              <div className="team-icon">🍽️</div>
              <h3>Traiteurs</h3>
            </div>
            <div className="team-card stagger-item hover-lift">
              <div className="team-icon">📸</div>
              <h3>Photographes</h3>
            </div>
            <div className="team-card stagger-item hover-lift">
              <div className="team-icon">🎥</div>
              <h3>Vidéastes</h3>
            </div>
            <div className="team-card stagger-item hover-lift">
              <div className="team-icon">🔊</div>
              <h3>Techniciens son</h3>
            </div>
            <div className="team-card stagger-item hover-lift">
              <div className="team-icon">💡</div>
              <h3>Techniciens lumière</h3>
            </div>
          </div>
        </div>
      </section>

          {/* Values Section */}
          <section className="section values-section section-animated" data-animation="slide-in-right" style={{ '--animation-duration': '800ms', '--animation-delay': '200ms', '--animation-easing': 'ease-out' }}>
            <div className="container">
              <h2 className="section-title">Chez <span className="brand-name-gold-shadow">ELIJAH'GOD</span>, nous cherchons à offrir plus qu'un service</h2>
              <div className="section-divider"></div>
              <div className="values-content">
                <p className="values-text">
                  Nous servons avec cœur, intégrité, et avec la conviction que chaque événement 
                  peut devenir un moment qui élève et rassemble.
                </p>
                <div className="values-grid">
                  <div className="value-item stagger-item hover-lift">
                    <div className="value-icon">❤️</div>
                    <h3>Cœur</h3>
                    <p>Chaque événement est traité avec passion et dévouement</p>
                  </div>
                  <div className="value-item stagger-item hover-lift">
                    <div className="value-icon">✨</div>
                    <h3>Intégrité</h3>
                    <p>Transparence et honnêteté dans chacune de nos actions</p>
                  </div>
                  <div className="value-item stagger-item hover-lift">
                    <div className="value-icon">🌟</div>
                    <h3>Excellence</h3>
                    <p>Un service de qualité professionnelle à chaque prestation</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="section final-cta-section section-animated" data-animation="zoom-in" style={{ '--animation-duration': '800ms', '--animation-delay': '300ms', '--animation-easing': 'ease-out' }}>
            <div className="container">
              <div className="final-cta-content">
                <h2 className="final-cta-title">Avec <span className="brand-name-gold-shadow">ELIJAH'GOD</span>,</h2>
                <p className="final-cta-text">
                  vous ne préparez pas seulement un événement…
                </p>
                <p className="final-cta-highlight">
                  vous créez un souvenir.
                </p>
                <div className="final-cta-buttons">
                  <Link to="/devis" className="btn btn-accent btn-lg hover-lift btn-ripple">
                    Demander mon devis gratuit
                  </Link>
                  <Link to="/contact" className="btn btn-primary-outline btn-lg hover-lift">
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Sections fixes (toujours affichées) */}
      {/* Role Section */}
      <section className="section role-section section-animated" data-animation="slide-in-up" style={{ '--animation-duration': '800ms', '--animation-delay': '0ms', '--animation-easing': 'ease-out' }}>
        <div className="container">
          <h2 className="section-title">Mon rôle est simple</h2>
          <div className="section-divider"></div>
          <div className="role-grid">
            <div className="role-card stagger-item hover-lift">
              <div className="role-number">1</div>
              <div className="role-icon">👥</div>
              <h3>Assembler ces talents</h3>
              <p>Je sélectionne les meilleurs prestataires adaptés à votre événement</p>
            </div>
            <div className="role-card stagger-item hover-lift">
              <div className="role-number">2</div>
              <div className="role-icon">📦</div>
              <h3>Construire un forfait tout compris</h3>
              <p>Je crée une solution clé en main parfaitement adaptée à vos besoins</p>
            </div>
            <div className="role-card stagger-item hover-lift">
              <div className="role-number">3</div>
              <div className="role-icon">🤝</div>
              <h3>Vous accompagner du début à la fin</h3>
              <p>Dans la bienveillance et la sérénité, à chaque étape de votre projet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bible Verse Section */}
      <section className="section verse-section section-animated" data-animation="fade-in" style={{ '--animation-duration': '1000ms', '--animation-delay': '0ms', '--animation-easing': 'ease-out' }}>
        <div className="container">
          <div className="verse-card scale-in">
            <div className="verse-quote">
              <span className="quote-mark">"</span>
              <p className="verse-text">
                Que tout ce que vous faites soit fait avec amour.
              </p>
              <span className="quote-mark">"</span>
            </div>
            <p className="verse-reference">— 1 Corinthiens 16:14</p>
          </div>
        </div>
      </section>

      {/* Inclusivity Section */}
      <section className="section inclusivity-section section-animated" data-animation="fade-in" style={{ '--animation-duration': '800ms', '--animation-delay': '0ms', '--animation-easing': 'ease-out' }}>
        <div className="container">
          <div className="inclusivity-content">
            <p className="inclusivity-text">
              Que vous soyez chrétien ou non, vous trouverez ici une équipe à l'écoute, 
              qui respecte pleinement votre vision et met tout en œuvre pour faire de votre événement 
              un moment inoubliable.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
