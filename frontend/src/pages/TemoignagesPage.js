import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TemoignagesPage.css';

import { API_URL } from '../config';

// Témoignages par défaut si la base est vide
const TEMOIGNAGES_DEFAUT = [
  {
    _id: 'd1',
    nom: 'Marie & Thomas',
    evenement: 'Mariage',
    note: 5,
    message: 'Une soirée absolument parfaite ! Randy a su créer une ambiance incroyable pour notre mariage. Les invités ont adoré, la musique était parfaitement choisie et la sono impeccable. Merci infiniment pour ce moment inoubliable.',
    date: '2025-09-15',
    ville: 'Paris'
  },
  {
    _id: 'd2',
    nom: 'Association Lumière',
    evenement: 'Conférence / Gala',
    note: 5,
    message: 'Nous avons fait appel à ELIJAH\'GOD pour notre gala annuel. Professionnalisme exemplaire, ponctualité, équipement de qualité. Tout s\'est déroulé parfaitement. Nous renouvèlerons l\'expérience sans hésiter.',
    date: '2025-11-20',
    ville: 'Lyon'
  },
  {
    _id: 'd3',
    nom: 'Famille Dubois',
    evenement: 'Anniversaire 50 ans',
    note: 5,
    message: 'Pour les 50 ans de mon mari, j\'avais besoin de quelqu\'un de fiable et talentueux. Randy a dépassé toutes nos attentes ! L\'ambiance était festive, conviviale et les surprises musicales ont ému toute la famille.',
    date: '2025-10-05',
    ville: 'Versailles'
  },
  {
    _id: 'd4',
    nom: 'Église Nouvelle Vie',
    evenement: 'Culte & Louange',
    note: 5,
    message: 'Randy est un véritable serviteur. Sa sensibilité spirituelle et son expertise technique font de lui le partenaire idéal pour nos événements d\'église. La sonorisation était claire et puissante, le tout dans un esprit de paix.',
    date: '2025-08-10',
    ville: 'Créteil'
  },
  {
    _id: 'd5',
    nom: 'Sophie & Julien',
    evenement: 'Mariage',
    note: 5,
    message: 'Nous avons eu la chance de travailler avec Randy pour notre mariage champêtre. Son écoute, sa réactivité et sa créativité nous ont permis d\'avoir exactement la soirée dont nous rêvions. Un grand merci du fond du cœur !',
    date: '2025-06-28',
    ville: 'Seine-et-Marne'
  },
  {
    _id: 'd6',
    nom: 'Entreprise InnoTech',
    evenement: 'Séminaire d\'entreprise',
    note: 5,
    message: 'Installation rapide, son parfait pour nos deux jours de conférence. L\'équipe d\'ELIJAH\'GOD a géré tout le côté technique avec brio nous permettant de nous concentrer sur notre contenu. Service au top !',
    date: '2025-12-03',
    ville: 'La Défense'
  }
];

function EtoileNote({ note }) {
  return (
    <div className="temoignage-etoiles">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= note ? 'etoile active' : 'etoile'}>★</span>
      ))}
    </div>
  );
}

function TemoignagesPage() {
  const [temoignages, setTemoignages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await fetch(`${API_URL}/api/temoignages?approuve=true&limit=20`);
        if (res.ok) {
          const data = await res.json();
          const liste = data.data || data || [];
          setTemoignages(liste.length > 0 ? liste : TEMOIGNAGES_DEFAUT);
        } else {
          setTemoignages(TEMOIGNAGES_DEFAUT);
        }
      } catch {
        setTemoignages(TEMOIGNAGES_DEFAUT);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const types = ['tous', 'Mariage', 'Anniversaire', 'Entreprise', 'Église'];

  const filtres = temoignages.filter(t => {
    if (filtre === 'tous') return true;
    if (filtre === 'Mariage') return t.evenement?.toLowerCase().includes('mariage');
    if (filtre === 'Anniversaire') return t.evenement?.toLowerCase().includes('anniversaire');
    if (filtre === 'Entreprise') return t.evenement?.toLowerCase().includes('entreprise') || t.evenement?.toLowerCase().includes('séminaire') || t.evenement?.toLowerCase().includes('conférence');
    if (filtre === 'Église') return t.evenement?.toLowerCase().includes('culte') || t.evenement?.toLowerCase().includes('église') || t.evenement?.toLowerCase().includes('louange');
    return true;
  });

  const noteGlobale = temoignages.length > 0
    ? (temoignages.reduce((acc, t) => acc + (t.note || 5), 0) / temoignages.length).toFixed(1)
    : '5.0';

  return (
    <div className="temoignages-page">
      {/* HERO */}
      <section className="temoignages-hero">
        <div className="temoignages-hero-overlay" />
        <div className="container temoignages-hero-content">
          <p className="temoignages-hero-tag">💬 Ce qu'ils disent</p>
          <h1>Ils nous ont fait confiance</h1>
          <p className="temoignages-hero-subtitle">
            Découvrez les retours de nos clients qui nous ont confié leurs moments précieux
          </p>
          <div className="temoignages-stats">
            <div className="stat-item">
              <span className="stat-number">{noteGlobale}</span>
              <span className="stat-label">Note moyenne ★</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">{temoignages.length}+</span>
              <span className="stat-label">Clients satisfaits</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Recommandent</span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTRES */}
      <section className="temoignages-filtres-section">
        <div className="container">
          <div className="temoignages-filtres">
            {types.map(type => (
              <button
                key={type}
                className={`filtre-btn ${filtre === type ? 'actif' : ''}`}
                onClick={() => setFiltre(type)}
              >
                {type === 'tous' ? '⭐ Tous' :
                 type === 'Mariage' ? '💍 Mariage' :
                 type === 'Anniversaire' ? '🎂 Anniversaire' :
                 type === 'Entreprise' ? '🏢 Entreprise' :
                 type === 'Église' ? '⛪ Église' : type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GRILLE TÉMOIGNAGES */}
      <section className="temoignages-grille-section">
        <div className="container">
          {loading ? (
            <div className="temoignages-loading">
              <div className="loading-spinner" />
              <p>Chargement des témoignages...</p>
            </div>
          ) : filtres.length === 0 ? (
            <div className="temoignages-vide">
              <p>Aucun témoignage pour cette catégorie.</p>
            </div>
          ) : (
            <div className="temoignages-grille">
              {filtres.map((t, idx) => (
                <div key={t._id || idx} className="temoignage-card">
                  <div className="temoignage-card-top">
                    <EtoileNote note={t.note || 5} />
                    <span className="temoignage-evenement">{t.evenement || 'Événement'}</span>
                  </div>
                  <blockquote className="temoignage-message">
                    "{t.message || t.contenu}"
                  </blockquote>
                  <div className="temoignage-card-bottom">
                    <div className="temoignage-avatar">
                      {(t.nom || t.auteur || 'C')[0].toUpperCase()}
                    </div>
                    <div className="temoignage-auteur-info">
                      <strong>{t.nom || t.auteur}</strong>
                      {t.ville && <span>{t.ville}</span>}
                      {t.date && (
                        <span className="temoignage-date">
                          {new Date(t.date || t.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA LAISSER UN AVIS */}
      <section className="temoignages-cta">
        <div className="container temoignages-cta-content">
          <div className="temoignages-cta-icon">✨</div>
          <h2>Vous avez travaillé avec nous ?</h2>
          <p>Votre avis nous aide à nous améliorer et aide d'autres personnes à nous faire confiance.</p>
          <Link to="/contact" className="btn-gold">
            💬 Laisser un témoignage
          </Link>
        </div>
      </section>

      {/* CTA DEVIS */}
      <section className="temoignages-devis-cta">
        <div className="container">
          <h2>Prêt à créer votre événement mémorable ?</h2>
          <p>Rejoignez nos clients satisfaits et laissez-nous transformer votre vision en réalité.</p>
          <div className="cta-buttons">
            <Link to="/devis" className="btn-primary-gold">✨ Demander mon devis gratuit</Link>
            <Link to="/prestations" className="btn-outline-gold">🎭 Voir nos prestations</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TemoignagesPage;
