import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Headphones, Sparkles, Heart, Handshake, Flame, Target,
  User, ImageIcon, Gem, Calendar, MessageCircle, Search, ShieldCheck
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import './AProposPage.css';

import { API_URL } from '../config';

function AProposPage() {
  const { settings } = useContext(SettingsContext);

  // --- Données paramétrables avec valeurs par défaut ---
  const ap = settings?.aPropos || {};

  const hero = ap.hero || {
    surTitre: "Créateur d'événements qui marquent les cœurs",
    titre: "Bienvenue, je suis Randy ODOUNGA",
    citation: "Votre événement mérite plus qu'un souvenir\u00a0: il mérite une histoire.",
    photo: null,
  };

  const presentation = ap.presentation || {
    actif: true,
    titre: 'Mon histoire',
    photo: null,
    contenu:
      "Tout a commencé dans mon adolescence, quand on me confiait spontanément l'organisation de petits événements : anniversaires, temps forts à l'église, rencontres entre amis.\n\nJ'ai vite compris que j'aimais faire les choses bien, et même plus que bien : transformer un \"c'est bien\" en un vrai \"wouaou\" qui restait gravé dans les mémoires.",
  };

  const motivation = ap.motivation || {
    actif: true,
    icone: '🔥',
    titre: "De l'église aux mariages",
    photo: null,
    contenu:
      "Au fil des ans, je me suis retrouvé impliqué dans l'organisation de mariages, d'événements d'église et de moments forts en tous genres. Pour mon propre mariage, j'avais à cœur que chaque détail soit maîtrisé : que les invités se sentent attendus, et que tout se déroule dans la paix, même face aux imprévus.\n\nSouvent, on m'invitait pour une petite prestation : gérer le son, la musique, ou une partie de la coordination. Et je finissais par dépasser ce cadre : trouver des solutions en cas de pépin, coordonner les prestataires, rassurer les mariés. C'est comme ça que j'ai appris à anticiper, à toujours avoir un plan B, et à transformer les obstacles en opportunités.\n\nToutes ces expériences m'ont permis de tisser un réseau solide de prestataires de confiance : musiciens, techniciens son, décorateurs et bien d'autres. C'est cette richesse accumulée qui m'a poussé à créer ce projet : mettre ce réseau au service de vos événements pour les rendre vraiment mémorables.",
  };

  const mission = ap.mission || {
    actif: true,
    icone: '🎯',
    titre: 'Qui je suis aujourd\'hui',
    photo: null,
    contenu:
      "Je suis musicien, chantre, chef de projet, manager, artiste et créatif. Mais par-dessus tout, je suis à l'écoute.\n\nMon objectif est de prendre vos idées, vos envies, même les plus simples, et de les transformer en réalité concrète, avec ce détail en plus qui fait toute la différence.",
  };

  const valeurs = ap.valeurs?.length
    ? ap.valeurs
    : [
        { icone: 'foi', titre: "Ma foi, mon moteur", description: "Dieu m'a apporté soutien et grâce dans tout ce que j'ai entrepris. Seul, on va plus vite. Mais avec Dieu et avec les autres, on va plus loin et dans l'excellence." },
        { icone: 'excellence', titre: "L'exigence comme culture", description: "Diplômé d'un master en management de projet et excellence opérationnelle, j'applique la même rigueur de préparation et de suivi à chaque événement que j'accompagne." },
        { icone: 'service', titre: "À l'écoute avant tout", description: "Je ne vous vends pas une formule toute faite. Je prends le temps de comprendre vos envies, même les plus simples, pour les transformer en réalité avec ce détail en plus qui fait la différence." },
        { icone: 'confiance', titre: "Un réseau de confiance", description: "Des années d'expérience m'ont permis de tisser un réseau solide de prestataires sérieux : musiciens, techniciens son, décorateurs. Ce réseau, je le mets entièrement au service de votre événement." },
      ];

  const galerie = ap.galerie?.filter(img => img?.url) || [];

  const parcours = ap.parcours?.length
    ? ap.parcours
    : [
        { annee: 'Ado', titre: 'Les premières responsabilités', description: "On me confiait spontanément l'organisation d'anniversaires, de temps forts à l'église, de rencontres entre amis. La passion était déjà là." },
        { annee: 'Mariage', titre: 'Coordonner, anticiper, rassurer', description: "Impliqué dans de nombreux mariages et événements d'église, j'ai appris à avoir un plan B, à coordonner les prestataires et à transformer les imprévus en opportunités." },
        { annee: 'Master', titre: 'Management de projet', description: "Diplômé d'un master en management de projet et excellence opérationnelle. Cette culture de l'exigence et du suivi s'applique désormais à chaque événement." },
        { annee: 'Aujourd\'hui', titre: "Création d'ELIJAH'GOD", description: "Fort d'un réseau solide de prestataires de confiance, je lance ce projet pour mettre toutes ces expériences au service de vos événements." },
      ];

  // Animation au scroll
  const [lightbox, setLightbox] = useState(null); // index image ouverte
  const [heroImgError, setHeroImgError] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.ap-reveal, .ap-reveal-left, .ap-reveal-right, .ap-reveal-scale').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Photos d'exemple (Unsplash) affichées quand aucune photo admin n'est configurée
  const PHOTO_EXEMPLE = {
    presentation: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    motivation:   'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    mission:      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  };

  // Résoudre les URLs photos :
  // - URLs Cloudinary (https://) → valides
  // - Chemins /uploads/... → null (fichiers éphémères perdus à chaque restart Render)
  const resolvePhoto = (url) => {
    if (!url) return null;
    if (url.startsWith('https://') || url.startsWith('http://')) return url;
    return null; // chemin local /uploads/ inutilisable sur Render
  };

  const getPhoto = (section, key) => resolvePhoto(section?.photo) || PHOTO_EXEMPLE[key];

  return (
    <div className="a-propos-page">

      {/* ====== HERO ====== */}
      <section className="ap-hero">
        <div className="ap-hero-bg-shapes">
          <div className="ap-shape ap-shape-1" />
          <div className="ap-shape ap-shape-2" />
          <div className="ap-shape ap-shape-3" />
        </div>
        <div className="container">
          <div className="ap-hero-inner">
            <div className="ap-hero-photo-wrap">
              {resolvePhoto(hero.photo) && !heroImgError ? (
                <img
                  src={resolvePhoto(hero.photo)}
                  alt="Portrait de Randy ODOUNGA"
                  className="ap-hero-photo"
                  onError={() => setHeroImgError(true)}
                />
              ) : (
                <div className="ap-hero-photo-placeholder">
                  <Headphones size={64} strokeWidth={1.2} />
                </div>
              )}
              <div className="ap-hero-photo-ring" />
            </div>
            <div className="ap-hero-text">
              <span className="ap-hero-sur-titre">{hero.surTitre}</span>
              <h1 className="ap-hero-titre">{hero.titre}</h1>
              <p className="ap-hero-citation">"{hero.citation}"</p>
              <div className="ap-hero-cta">
                <Link to="/devis" className="btn btn-primary">
                  <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                  Créons quelque chose ensemble
                </Link>
                <Link to="/prestations" className="btn btn-secondary">Voir mes services</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== QUI SUIS-JE ====== */}
      {presentation.actif !== false && (
        <section className="ap-section ap-section-light">
          <div className="container">
            <div className="ap-bio-split">
              <div className="ap-bio-texte ap-reveal-left">
                <div className="ap-section-badge ap-reveal-scale ap-delay-1">
                  <User size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                  Présentation
                </div>
                <h2 className="ap-section-titre ap-reveal ap-delay-1">{presentation.titre}</h2>
                <div className="ap-qui-contenu">
                  {presentation.contenu.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="ap-reveal ap-delay-2">{para}</p>
                  ))}
                </div>
              </div>
              <div className="ap-bio-photo ap-reveal-right">
                <div className="ap-photo-placeholder-wrap">
                  <img
                    src={getPhoto(presentation, 'presentation')}
                    alt={presentation.titre}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====== CE QUI M'A POUSSÉ ====== */}
      {motivation.actif !== false && (
        <section className="ap-section ap-section-dark">
          <div className="container">
            <div className="ap-bio-split">
              <div className="ap-bio-photo ap-reveal-left">
                <div className="ap-photo-placeholder-wrap">
                  <img
                    src={getPhoto(motivation, 'motivation')}
                    alt={motivation.titre}
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="ap-bio-texte ap-reveal-right">
                <div className="ap-section-badge ap-badge-light ap-reveal-scale ap-delay-1">
                  <Flame size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Mon histoire
                </div>
                <h2 className="ap-section-titre ap-titre-light ap-reveal ap-delay-1">{motivation.titre}</h2>
                <div className="ap-texte-light">
                  {motivation.contenu.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="ap-reveal ap-delay-2">{para}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====== CE QUE JE DONNE ====== */}
      {mission.actif !== false && (
        <section className="ap-section ap-section-light ap-section-accent">
          <div className="container">
            <div className="ap-bio-split">
              <div className="ap-bio-texte ap-reveal-left">
                <div className="ap-section-badge ap-reveal-scale ap-delay-1">
                  <Target size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Ma mission
                </div>
                <h2 className="ap-section-titre ap-reveal ap-delay-1">{mission.titre}</h2>
                <div className="ap-qui-contenu">
                  {mission.contenu.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="ap-reveal ap-delay-2">{para}</p>
                  ))}
                </div>
              </div>
              <div className="ap-bio-photo ap-reveal-right">
                <div className="ap-photo-placeholder-wrap">
                  <img
                    src={getPhoto(mission, 'mission')}
                    alt={mission.titre}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====== GALERIE RÉALISATIONS ====== */}
      {galerie.length > 0 && (
        <section className="ap-section ap-section-light">
          <div className="container">
            <div className="ap-reveal">
              <div className="ap-section-badge">
                <ImageIcon size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                Mes réalisations
              </div>
              <h2 className="ap-section-titre" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Mon travail en images</h2>
              <p style={{ textAlign: 'center', color: '#777', marginBottom: '2.5rem', fontSize: '1rem' }}>Chaque photo raconte un moment unique accompagné avec passion.</p>
            </div>
            <div className="ap-galerie-grid ap-reveal">
              {galerie.map((img, idx) => (
                <div key={idx} className="ap-galerie-item" onClick={() => setLightbox(idx)}>
                  <img
                    src={img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`}
                    alt={img.legende || `Réalisation ${idx + 1}`}
                    loading="lazy"
                  />
                  <div className="ap-galerie-overlay">
                    <span className="ap-galerie-zoom"><Search size={18} /></span>
                    {img.legende && <p>{img.legende}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lightbox */}
          {lightbox !== null && (
            <div className="ap-lightbox" onClick={() => setLightbox(null)}>
              <button className="ap-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
              {lightbox > 0 && (
                <button className="ap-lightbox-nav ap-lightbox-prev"
                  onClick={(e) => { e.stopPropagation(); setLightbox(l => l - 1); }}>&#8249;</button>
              )}
              <div className="ap-lightbox-content" onClick={e => e.stopPropagation()}>
                <img
                  src={galerie[lightbox].url.startsWith('http') ? galerie[lightbox].url : `${API_URL}${galerie[lightbox].url}`}
                  alt={galerie[lightbox].legende || `Réalisation ${lightbox + 1}`}
                />
                {galerie[lightbox].legende && (
                  <p className="ap-lightbox-legende">{galerie[lightbox].legende}</p>
                )}
                <span className="ap-lightbox-count">{lightbox + 1} / {galerie.length}</span>
              </div>
              {lightbox < galerie.length - 1 && (
                <button className="ap-lightbox-nav ap-lightbox-next"
                  onClick={(e) => { e.stopPropagation(); setLightbox(l => l + 1); }}>&#8250;</button>
              )}
            </div>
          )}
        </section>
      )}

      {/* ====== VALEURS ====== */}
      {valeurs.length > 0 && (
        <section className="ap-section ap-section-light">
          <div className="container">
            <div className="ap-reveal">
              <div className="ap-section-badge">
                <Gem size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                Mes engagements
              </div>
              <h2 className="ap-section-titre" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Ce en quoi je crois
              </h2>
            </div>
            <div className="ap-valeurs-grid">
              {valeurs.map((v, i) => (
                <div key={i} className="ap-valeur-card ap-reveal-scale" style={{ transitionDelay: `${i * 0.12}s` }}>
                  <div className="ap-valeur-icone">
                    {v.icone === 'foi' ? <ShieldCheck size={32} /> :
                     v.icone === 'excellence' ? <Headphones size={32} /> :
                     v.icone === 'service' ? <Heart size={32} /> :
                     v.icone === 'confiance' ? <Handshake size={32} /> :
                     typeof v.icone === 'string' && v.icone.length > 3 ? <Sparkles size={32} /> :
                     <span>{v.icone}</span>}
                  </div>
                  <h3 className="ap-valeur-titre">{v.titre}</h3>
                  <p className="ap-valeur-desc">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== PARCOURS ====== */}
      {parcours.length > 0 && (
        <section className="ap-section ap-section-dark">
          <div className="container">
            <div className="ap-reveal">
              <div className="ap-section-badge ap-badge-light">
                <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                Mon parcours
              </div>
              <h2 className="ap-section-titre ap-titre-light" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Une histoire qui continue
              </h2>
            </div>
            <div className="ap-timeline">
              {parcours.map((p, i) => (
                <div key={i} className={`ap-timeline-item ${i % 2 === 0 ? 'ap-reveal-left gauche' : 'ap-reveal-right droite'}`} style={{ transitionDelay: `${i * 0.15}s` }}>
                  <div className="ap-timeline-annee">{p.annee}</div>
                  <div className="ap-timeline-dot" />
                  <div className="ap-timeline-carte">
                    <h3>{p.titre}</h3>
                    <p>{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== CTA FINAL ====== */}
      <section className="ap-cta-final">
        <div className="container">
          <div className="ap-cta-inner ap-reveal">
            <h2>Prêt à créer quelque chose d'exceptionnel ?</h2>
            <p>Contactez-moi pour discuter de votre projet. Je serai ravi d'y mettre tout mon cœur.</p>
            <div className="ap-cta-buttons">
              <Link to="/devis" className="btn btn-primary btn-lg">
                <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                Demander un devis
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                <MessageCircle size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                Me contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default AProposPage;
