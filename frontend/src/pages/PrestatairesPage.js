import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { SettingsContext } from '../context/SettingsContext';
import './PrestatairesPage.css';

import { API_URL } from '../config';
import { getCache, setCache } from '../utils/cache';

function PrestatairesPage() {
  const CACHE_KEY = 'elijahgod_prestataires';
  const cached = getCache(CACHE_KEY);

  const [prestataires, setPrestataires] = useState(cached?.prestataires || []);
  const [categories, setCategories] = useState(cached?.categories || []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    verified: false,
    noteMin: 0
  });

  const { settings } = useContext(SettingsContext);
  const heroConfig = settings?.pages?.prestataires?.hero;
  const sectionsConfig = settings?.pages?.prestataires?.sections;

  // IntersectionObserver pour animer les sections au scroll
  useEffect(() => {
    const animEl = (el) => {
      const animType = el.dataset.animation;
      if (animType && animType !== 'none') {
        el.classList.add(`animate-${animType}`);
      } else {
        el.classList.add('prest-visible');
      }
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { animEl(entry.target); observer.unobserve(entry.target); } });
    }, { threshold: 0.1, rootMargin: '-40px' });
    const timer = setTimeout(() => {
      document.querySelectorAll('.prest-section-animated').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) { animEl(el); }
        else { observer.observe(el); }
      });
    }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [sectionsConfig, selectedCategory]);

  // Animation du hero — déclenché après la fin du loading (quand le hero est dans le DOM)
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      document.querySelectorAll('.section-animated[data-animation]').forEach(el => {
        const animType = el.dataset.animation;
        if (animType && animType !== 'none') {
          el.classList.add(`animate-${animType}`);
        } else {
          el.style.opacity = '1';
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [loading, heroConfig]);

  useEffect(() => {
    loadData();
  }, [selectedCategory, filters]);

  const loadData = async () => {
    try {
      const isDefaultQuery = selectedCategory === 'all' && !filters.verified && filters.noteMin === 0;
      // Si cache dispo et requête par défaut, rafraîchissement silencieux
      if (!getCache(CACHE_KEY) || !isDefaultQuery) setLoading(true);
      
      // Charger les catégories
      const categoriesRes = await axios.get(`${API_URL}/api/prestataires/categories`);
      setCategories(categoriesRes.data.data);

      // Charger les prestataires
      const params = {};
      if (selectedCategory !== 'all') params.categorie = selectedCategory;
      if (filters.verified) params.verified = 'true';
      if (filters.noteMin > 0) params.noteMin = filters.noteMin;

      const prestataireRes = await axios.get(`${API_URL}/api/prestataires`, { params });
      const newPrestataires = prestataireRes.data.data;
      setPrestataires(newPrestataires);
      
      // Mettre en cache uniquement la requête par défaut
      if (isDefaultQuery) {
        setCache(CACHE_KEY, { prestataires: newPrestataires, categories: categoriesRes.data.data });
      }
      setError(null);
    } catch (err) {
      console.error('❌ Erreur chargement:', err);
      if (!cached) setError('Impossible de charger les prestataires');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (note) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(note)) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === Math.ceil(note) && note % 1 !== 0) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement des prestataires...</p>
      </div>
    );
  }

  return (
    <div className="prestataires-page">
      {/* Hero */}
      <section
        className={`prestataires-hero${heroConfig?.animation?.type && heroConfig.animation.type !== 'none' ? ' section-animated' : ''}`}
        data-animation={heroConfig?.animation?.type || 'none'}
        style={{
          backgroundColor: heroConfig?.couleurs?.arrierePlan || undefined,
          '--animation-duration': `${heroConfig?.animation?.duration || 800}ms`,
          '--animation-delay': `${heroConfig?.animation?.delay || 0}ms`,
        }}
      >
        <div className="container">
          <h1 className="page-title" style={{ color: heroConfig?.couleurs?.texte || undefined }}>
            {heroConfig?.titre || 'Nos Prestataires Partenaires'}
          </h1>
          <p className="page-subtitle" style={{ color: heroConfig?.couleurs?.texte || undefined }}>
            {heroConfig?.sousTitre || 'Découvrez notre réseau de professionnels de l\'événementiel'}
          </p>
        </div>
      </section>

      <div className="container">
        {/* Filtres */}
        <div
          className="filters-section prest-section-animated"
          data-animation={sectionsConfig?.filtres?.animation?.type || 'slide-in-up'}
          style={{
            '--animation-duration': `${sectionsConfig?.filtres?.animation?.duration || 700}ms`,
            '--animation-delay': `${sectionsConfig?.filtres?.animation?.delay || 100}ms`
          }}
        >
          <div className="filters-categories">
            <button 
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Tous les prestataires
            </button>
            {categories.map(cat => (
              <button 
                key={cat.categorie}
                className={`filter-btn ${selectedCategory === cat.categorie ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.categorie)}
              >
                {cat.categorie} ({cat.nombre})
              </button>
            ))}
          </div>

          <div className="filters-options">
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => setFilters({...filters, verified: e.target.checked})}
              />
              <span>Prestataires vérifiés uniquement</span>
            </label>

            <div className="filter-note">
              <label>Note minimum :</label>
              <select 
                value={filters.noteMin}
                onChange={(e) => setFilters({...filters, noteMin: parseFloat(e.target.value)})}
              >
                <option value="0">Toutes les notes</option>
                <option value="3">3★ et plus</option>
                <option value="4">4★ et plus</option>
                <option value="4.5">4.5★ et plus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des prestataires */}
        {error && <div className="error">{error}</div>}

        {prestataires.length === 0 ? (
          <div className="no-prestataires">
            <p>Aucun prestataire trouvé pour cette catégorie.</p>
            <button onClick={() => setSelectedCategory('all')} className="btn btn-primary">
              Voir tous les prestataires
            </button>
          </div>
        ) : (
          <div
            className="prestataires-grid prest-section-animated"
            data-animation={sectionsConfig?.grille?.animation?.type || 'zoom-in'}
            style={{
              '--animation-duration': `${sectionsConfig?.grille?.animation?.duration || 600}ms`,
              '--animation-delay': `${sectionsConfig?.grille?.animation?.delay || 150}ms`
            }}
          >
            {prestataires.map(prestataire => (
              <div key={prestataire._id} className="prestataire-card card">
                {/* Logo */}
                <div className="prestataire-logo">
                  {prestataire.logo?.url ? (
                    <img src={prestataire.logo.url} alt={prestataire.nomEntreprise} />
                  ) : (
                    <div className="logo-placeholder">
                      {prestataire.nomEntreprise.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Header */}
                <div className="prestataire-header">
                  <h3 className="prestataire-nom">{prestataire.nomEntreprise}</h3>
                  <span className="prestataire-categorie">{prestataire.categorie}</span>
                  {prestataire.isVerified && (
                    <span className="badge-verified" title="Prestataire vérifié">✓</span>
                  )}
                </div>

                {/* Note */}
                {prestataire.nombreAvis > 0 && (
                  <div className="prestataire-rating">
                    <div className="stars">
                      {renderStars(prestataire.noteGlobale)}
                    </div>
                    <span className="rating-text">
                      {prestataire.noteGlobale}/5 ({prestataire.nombreAvis} avis)
                    </span>
                  </div>
                )}

                {/* Description */}
                {prestataire.description && (
                  <p className="prestataire-description">
                    {prestataire.description.substring(0, 150)}
                    {prestataire.description.length > 150 && '...'}
                  </p>
                )}

                {/* Spécialités */}
                {prestataire.specialites && prestataire.specialites.length > 0 && (
                  <div className="prestataire-specialites">
                    {prestataire.specialites.slice(0, 3).map((spec, index) => (
                      <span key={index} className="specialite-tag">{spec}</span>
                    ))}
                  </div>
                )}

                {/* Tarifs */}
                {prestataire.tarifsPublics?.afficher && (
                  <div className="prestataire-tarifs">
                    <span className="tarif-label">À partir de</span>
                    <span className="tarif-montant">{prestataire.tarifsPublics.tarifMin}€</span>
                  </div>
                )}

                {/* Actions */}
                <div className="prestataire-actions">
                  <Link 
                    to={`/prestataires/${prestataire._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Voir le profil
                  </Link>
                  {prestataire.plan === 'premium' && (
                    <span className="badge-premium">⭐ Premium</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Inscription Prestataire */}
        <div
          className="prestataire-cta prest-section-animated"
          data-animation={sectionsConfig?.cta?.animation?.type || 'fade-in'}
          style={{
            '--animation-duration': `${sectionsConfig?.cta?.animation?.duration || 800}ms`,
            '--animation-delay': `${sectionsConfig?.cta?.animation?.delay || 0}ms`
          }}
        >
          <h2>Vous êtes prestataire ?</h2>
          <p>Rejoignez notre réseau et développez votre activité</p>
          <Link to="/prestataire/inscription" className="btn btn-accent btn-lg">
            Créer mon compte prestataire
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PrestatairesPage;
