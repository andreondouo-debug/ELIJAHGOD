import React, { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';
import { API_URL } from '../config';
import './HomePage.css';

// Image de fond par défaut = même que la bannière en DB (évite le flash)
const IMAGE_HERO_DEFAUT = 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';

function HomePage() {
  const { settings, loading: settingsLoading } = useContext(SettingsContext);

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
  const activeSections = sections.filter(s => s.actif !== false).sort((a, b) => a.ordre - b.ordre);

  // IntersectionObserver — déclenche les animations au scroll
  // Utilise un ref sur le conteneur pour observer tous les .section après le rendu
  const pageRef = useRef(null);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    // Observer chaque section de la page
    const sectionEls = el.querySelectorAll('section.section');
    sectionEls.forEach(s => observer.observe(s));

    return () => observer.disconnect();
  // Se re-déclenche uniquement si le nombre de sections change (données chargées)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSections.length, settingsLoading]);


  const renderSection = (section) => {
    const anim = section.animation || { type: 'fade-in', delay: 0, duration: 800, easing: 'ease-out' };
    const animClass = anim.type && anim.type !== 'none' ? `animate-${anim.type}` : 'hp-section-enter';
    const className = `section ${section.type}-section ${animClass}`;

    const sectionStyle = {
      backgroundColor: section.couleurs?.arrierePlan || undefined,
      color: section.couleurs?.texte || undefined,
      '--animation-duration': `${anim.duration || 800}ms`,
      '--animation-delay': `${anim.delay || 0}ms`,
      '--animation-easing': anim.easing || 'ease-out',
    };
    const titleStyle = {
      color: section.couleurs?.titre || section.couleurs?.texte || undefined
    };
    
    switch (section.type) {
      case 'mission':
        return (
          <section key={section.id} className={className} style={sectionStyle}>
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
          <section key={section.id} className={className} style={sectionStyle}>
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
          <section key={section.id} className={className} style={sectionStyle}>
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
                  {(section.valeurs || [
                    { icone: '❤️', titre: 'Cœur', description: 'Chaque événement est traité avec passion et dévouement' },
                    { icone: '✨', titre: 'Intégrité', description: 'Transparence et honnêteté dans chacune de nos actions' },
                    { icone: '🌟', titre: 'Excellence', description: 'Un service de qualité professionnelle à chaque prestation' }
                  ]).map((v, i) => (
                    <div key={i} className="value-item stagger-item hover-lift">
                      <div className="value-icon">{v.icone}</div>
                      <h3>{v.titre}</h3>
                      <p>{v.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key={section.id} className={className} style={sectionStyle}>
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
    <div className="home-page" ref={pageRef}>
      {/* Hero Section */}
      <section 
        className={`hero hero-${carousel.disposition} hero-align-${carousel.alignement}`}
        style={{
          backgroundImage: (() => {
            // Pendant le chargement : pas d'image pour éviter le flash
            if (settingsLoading) return 'none';
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
          color: carousel.couleurs?.texte || '#ffffff',
          transition: 'background-image 0.3s ease'
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
          <section className="section mission-section hp-section-enter">
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
          <section className="section team-section hp-section-enter">
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
          <section className="section values-section hp-section-enter">
            <div className="container">
              <h2 className="section-title">Chez <span className="brand-name-gold-shadow">ELIJAH'GOD</span>, nous cherchons à offrir plus qu'un service</h2>
              <div className="section-divider"></div>
              <div className="values-content">
                <p className="values-text">
                  Nous servons avec cœur, intégrité, et avec la conviction que chaque événement 
                  peut devenir un moment qui élève et rassemble.
                </p>
                <div className="values-grid">
                  {(settings?.homepage?.sections?.find(s => s.id === 'values')?.valeurs || [
                    { icone: '❤️', titre: 'Cœur', description: 'Chaque événement est traité avec passion et dévouement' },
                    { icone: '✨', titre: 'Intégrité', description: 'Transparence et honnêteté dans chacune de nos actions' },
                    { icone: '🌟', titre: 'Excellence', description: 'Un service de qualité professionnelle à chaque prestation' }
                  ]).map((v, i) => (
                    <div key={i} className="value-item stagger-item hover-lift">
                      <div className="value-icon">{v.icone}</div>
                      <h3>{v.titre}</h3>
                      <p>{v.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="section final-cta-section hp-section-enter">
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
      {settings?.homepage?.role?.actif !== false && (() => {
        const role = settings?.homepage?.role || {};
        const cartes = role.cartes || [
          { numero: 1, icone: '👥', titre: 'Assembler ces talents', description: 'Je sélectionne les meilleurs prestataires adaptés à votre événement' },
          { numero: 2, icone: '📦', titre: 'Construire un forfait tout compris', description: 'Je crée une solution clé en main parfaitement adaptée à vos besoins' },
          { numero: 3, icone: '🤝', titre: 'Vous accompagner du début à la fin', description: 'Dans la bienveillance et la sérénité, à chaque étape de votre projet' }
        ];
        return (
          <section className="section role-section hp-section-enter">
            <div className="container">
              <h2 className="section-title">{role.titre || 'Mon rôle est simple'}</h2>
              <div className="section-divider"></div>
              <div className="role-grid">
                {cartes.map((c, i) => (
                  <div key={i} className="role-card stagger-item hover-lift">
                    <div className="role-number">{c.numero || i + 1}</div>
                    <div className="role-icon">{c.icone}</div>
                    <h3>{c.titre}</h3>
                    <p>{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Bible Verse Section */}
      {settings?.homepage?.verse?.actif !== false && (() => {
        const verse = settings?.homepage?.verse || {};
        return (
          <section className="section verse-section hp-section-enter">
            <div className="container">
              <div className="verse-card scale-in">
                <div className="verse-quote">
                  <span className="quote-mark">“</span>
                  <p className="verse-text">{verse.texte || 'Que tout ce que vous faites soit fait avec amour.'}</p>
                  <span className="quote-mark">“</span>
                </div>
                <p className="verse-reference">{verse.reference || '— 1 Corinthiens 16:14'}</p>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Inclusivity Section */}
      {settings?.homepage?.inclusivity?.actif !== false && (() => {
        const incl = settings?.homepage?.inclusivity || {};
        return (
          <section className="section inclusivity-section hp-section-enter">
            <div className="container">
              <div className="inclusivity-content">
                <p className="inclusivity-text">
                  {incl.texte || "Que vous soyez chrétien ou non, vous trouverez ici une équipe à l’écoute, qui respecte pleinement votre vision et met tout en œuvre pour faire de votre événement un moment inoubliable."}
                </p>
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
}

export default HomePage;
