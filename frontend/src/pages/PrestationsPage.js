import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Headphones, Mic2, Volume2, LampCeiling, Video, Camera,
  Utensils, Sparkles, Music2, Settings2, Clapperboard, CheckCircle2
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import PrestationDetailModal from '../components/PrestationDetailModal';
import './PrestationsPage.css';

import { API_URL } from '../config';
import { getCache, setCache } from '../utils/cache';

/**
 * 🎨 Map des icônes par catégorie de prestation
 */
const CATEGORY_ICONS = {
  'DJ':         (s = 20) => <Headphones size={s} />,
  'Animation':  (s = 20) => <Mic2       size={s} />,
  'Sonorisation':(s= 20) => <Volume2    size={s} />,
  'Lumière':    (s = 20) => <LampCeiling size={s} />,
  'Vidéo':      (s = 20) => <Video      size={s} />,
  'Photo':      (s = 20) => <Camera     size={s} />,
  'Traiteur':   (s = 20) => <Utensils   size={s} />,
  'Décoration': (s = 20) => <Sparkles   size={s} />,
  'Musique':    (s = 20) => <Music2     size={s} />,
  'Technique':  (s = 20) => <Settings2  size={s} />,
};

const getCategoryIcon = (category, size = 20) => {
  const fn = CATEGORY_ICONS[category];
  return fn ? fn(size) : <Clapperboard size={size} />;
};

function PrestationsPage() {
  const CACHE_KEY = 'elijahgod_prestations';
  const cached = getCache(CACHE_KEY);

  const [prestations, setPrestations] = useState(cached?.prestations || []);
  const [categories, setCategories] = useState(cached?.categories || []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  // Éléments visibles — jamais effacés au re-render
  const [visibleEls, setVisibleEls] = useState(() => new Set());
  const [heroVisible, setHeroVisible] = useState(false);

  const markElVisible = (key) => {
    setVisibleEls(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev); next.add(key); return next;
    });
  };

  const { settings } = useContext(SettingsContext);
  const heroConfig = settings?.pages?.prestations?.hero;
  const sectionsConfig = settings?.pages?.prestations?.sections;

  // Observer sections — React state pour survivre aux re-renders
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const key = entry.target.dataset.animKey;
          if (key) markElVisible(key);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '-40px' });
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-anim-key]').forEach(el => {
        const key = el.dataset.animKey;
        if (!key || visibleEls.has(key)) return;
        if (el.getBoundingClientRect().top < window.innerHeight) { markElVisible(key); }
        else { observer.observe(el); }
      });
    }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsConfig, selectedCategory]);

  // Animation du hero via React state
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => setHeroVisible(true), 50);
    return () => clearTimeout(timer);
  }, [loading, heroConfig]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Si cache dispo, rafraîchissement silencieux (pas de spinner)
      if (!getCache(CACHE_KEY)) setLoading(true);
      const [prestationsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/prestations`),
        axios.get(`${API_URL}/api/prestations/categories`)
      ]);
      
      const newPrestations = prestationsRes.data.data;
      const newCategories = categoriesRes.data.data;
      setPrestations(newPrestations);
      setCategories(newCategories);
      setCache(CACHE_KEY, { prestations: newPrestations, categories: newCategories });
      setError(null);
    } catch (err) {
      console.error('❌ Erreur chargement:', err);
      if (!cached) setError('Impossible de charger les prestations');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrestations = selectedCategory === 'all' 
    ? prestations 
    : prestations.filter(p => p.categorie === selectedCategory);

  const [modalPrestation, setModalPrestation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openDetails = (prestation) => {
    setModalPrestation(prestation);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setModalPrestation(null);
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement des prestations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prestations-page">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="prestations-page">
      {/* Hero */}
      <section
        className={`prestations-hero${heroConfig?.animation?.type && heroConfig.animation.type !== 'none' ? (heroVisible ? ` animate-${heroConfig.animation.type}` : ' section-animated') : ''}`}
        data-animation={heroConfig?.animation?.type || 'none'}
        style={{
          backgroundColor: heroConfig?.couleurs?.arrierePlan || undefined,
          '--animation-duration': `${heroConfig?.animation?.duration || 800}ms`,
          '--animation-delay': `${heroConfig?.animation?.delay || 0}ms`,
        }}
      >
        <div className="container">
          <h1 className="page-title" style={{ color: heroConfig?.couleurs?.texte || undefined }}>
            {heroConfig?.titre || 'Nos Prestations'}
          </h1>
          <p className="page-subtitle" style={{ color: heroConfig?.couleurs?.texte || undefined }}>
            {heroConfig?.sousTitre || 'Découvrez nos services pour rendre vos événements inoubliables'}
          </p>
        </div>
      </section>

      <div className="container">
        {/* Filtres */}
        <div
          className={`filters${visibleEls.has('filters') ? ' prest-visible' : ' prest-section-animated'}`}
          data-anim-key="filters"
          data-animation={sectionsConfig?.filtres?.animation?.type || 'slide-in-up'}
          style={{
            '--animation-duration': `${sectionsConfig?.filtres?.animation?.duration || 700}ms`,
            '--animation-delay': `${sectionsConfig?.filtres?.animation?.delay || 100}ms`
          }}
        >
          <button 
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            ⭐ Toutes les prestations
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="filter-icon">{getCategoryIcon(cat)}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* Liste des prestations */}
        {filteredPrestations.length === 0 ? (
          <div className="no-prestations">
            <p>❓ Aucune prestation disponible pour le moment.</p>
            <Link to="/contact" className="btn btn-primary">
              💬 Contactez-nous pour plus d'informations
            </Link>
          </div>
        ) : (
          <div
            className={`prestations-grid${visibleEls.has('grid') ? ' prest-visible' : ' prest-section-animated'}`}
            data-anim-key="grid"
            data-animation={sectionsConfig?.grille?.animation?.type || 'zoom-in'}
            style={{
              '--animation-duration': `${sectionsConfig?.grille?.animation?.duration || 600}ms`,
              '--animation-delay': `${sectionsConfig?.grille?.animation?.delay || 150}ms`
            }}
          >
            {filteredPrestations.map(prestation => (
              <div key={prestation._id} className="prestation-card card">
                <div className="prestation-icon-badge">
                  {getCategoryIcon(prestation.categorie)}
                </div>
                
                <div className="prestation-header">
                  <span className="prestation-category">
                    {getCategoryIcon(prestation.categorie)} {prestation.categorie}
                  </span>
                  {prestation.disponible ? (
                    <span className="badge-disponible"><CheckCircle2 size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} /> Disponible</span>
                  ) : (
                    <span className="badge-indisponible">❌ Indisponible</span>
                  )}
                </div>

                <h3 className="prestation-title">{prestation.nom}</h3>
                
                {prestation.descriptionCourte && (
                  <p className="prestation-short">{prestation.descriptionCourte}</p>
                )}
                
                <p className="prestation-description">{prestation.description}</p>

                {prestation.inclus && prestation.inclus.length > 0 && (
                  <div className="prestation-inclus">
                    <h4>📦 Inclus :</h4>
                    <ul>
                      {prestation.inclus.slice(0, 3).map((item, index) => (
                        <li key={index}><CheckCircle2 size={13} style={{ verticalAlign: 'middle', marginRight: 5, color: '#2ecc71' }} /> {item}</li>
                      ))}
                    </ul>
                    {prestation.inclus.length > 3 && (
                      <button className="inclus-voir-plus" onClick={() => openDetails(prestation)}>
                        +{prestation.inclus.length - 3} autres → voir les détails
                      </button>
                    )}
                  </div>
                )}

                <div className="prestation-footer">
                  <div className="prestation-prix">
                    <span className="prix-label">💰 À partir de</span>
                    <span className="prix-montant">{prestation.prixBase}€</span>
                    <span className="prix-unite">/ {prestation.unite}</span>
                  </div>
                  <div className="footer-actions">
                    <button className="btn btn-outline details-btn" onClick={() => openDetails(prestation)}>
                      🔍 Détails
                    </button>
                    <Link 
                      to={`/devis?prestation=${prestation._id}`} 
                      className="btn btn-primary"
                    >
                      📋 Demander un devis
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className={`prestations-cta${visibleEls.has('cta') ? ' prest-visible' : ' prest-section-animated'}`}
          data-anim-key="cta"
          data-animation={sectionsConfig?.cta?.animation?.type || 'fade-in'}
          style={{
            '--animation-duration': `${sectionsConfig?.cta?.animation?.duration || 800}ms`,
            '--animation-delay': `${sectionsConfig?.cta?.animation?.delay || 0}ms`
          }}
        >
          <h2>🤔 Vous ne trouvez pas ce que vous cherchez ?</h2>
          <p>Contactez-nous pour une prestation sur mesure adaptée à vos besoins</p>
          <Link to="/contact" className="btn btn-accent btn-lg">
            💬 Nous contacter
          </Link>
        </div>
      </div>
    </div>
    {modalOpen && modalPrestation && (
      <PrestationDetailModal
        prestation={modalPrestation}
        nombreInvites={0}
        onClose={closeDetails}
      />
    )}
    </>
  );
}

export default PrestationsPage;
