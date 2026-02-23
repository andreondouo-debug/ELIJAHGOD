import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './TemoignagesPage.css';

import { API_URL } from '../config';
import { ClientContext } from '../context/ClientContext';

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
  const [loading, setLoading]         = useState(true);
  const [filtre, setFiltre]           = useState('tous');

  // ── Formulaire soumission témoignage
  const [showForm, setShowForm]       = useState(false);
  const [formData, setFormData]       = useState({ nom: '', email: '', entreprise: '', titre: '', contenu: '', note: 5 });
  const [submitStatus, setSubmitStatus] = useState(''); // '' | 'sending' | 'success' | 'error'

  // Pré-remplir si connecté
  const clientCtx = useContext(ClientContext);
  const clientConnecte = clientCtx?.client;

  useEffect(() => {
    if (clientConnecte) {
      setFormData(prev => ({
        ...prev,
        nom:   `${clientConnecte.prenom || ''} ${clientConnecte.nom || ''}`.trim() || prev.nom,
        email: clientConnecte.email || prev.email,
      }));
    }
  }, [clientConnecte]);

  // ── Chargement depuis l'API
  useEffect(() => {
    const charger = async () => {
      try {
        const res = await fetch(`${API_URL}/api/temoignages?limit=20`);
        if (res.ok) {
          const data = await res.json();
          // Le contrôleur retourne { temoignages: [...] }
          const liste = data.temoignages || data.data || (Array.isArray(data) ? data : []);
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

  // ── Soumission d'un témoignage externe
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('sending');
    try {
      const res = await fetch(`${API_URL}/api/temoignages/externe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFormData({ nom: '', email: '', entreprise: '', titre: '', contenu: '', note: 5 });
        // Pré-remplir de nouveau si connecté
        if (clientConnecte) {
          setFormData(prev => ({
            ...prev,
            nom:   `${clientConnecte.prenom || ''} ${clientConnecte.nom || ''}`.trim(),
            email: clientConnecte.email || '',
          }));
        }
      } else {
        const err = await res.json();
        alert(err.message || 'Erreur lors de la soumission');
        setSubmitStatus('');
      }
    } catch {
      alert('Erreur réseau, veuillez réessayer');
      setSubmitStatus('');
    }
  };

  // ── Helper : extraire les champs depuis le modèle DB ou les données statiques
  const getNom      = (t) => t.auteur?.nom || t.nom       || 'Client';
  const getContenu  = (t) => t.contenu    || t.message    || '';
  const getEvenement= (t) => t.evenement?.type || t.evenement || 'Événement';
  const getDate     = (t) => t.createdAt  || t.date       || null;

  const types = ['tous', 'Mariage', 'Anniversaire', 'Entreprise', 'Église'];

  const filtres = temoignages.filter(t => {
    const ev = getEvenement(t).toLowerCase();
    if (filtre === 'tous')         return true;
    if (filtre === 'Mariage')      return ev.includes('mariage');
    if (filtre === 'Anniversaire') return ev.includes('anniversaire');
    if (filtre === 'Entreprise')   return ev.includes('entreprise') || ev.includes('séminaire') || ev.includes('conférence');
    if (filtre === 'Église')       return ev.includes('culte') || ev.includes('église') || ev.includes('louange');
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
                    <span className="temoignage-evenement">{getEvenement(t)}</span>
                  </div>
                  <blockquote className="temoignage-message">
                    "{getContenu(t)}"
                  </blockquote>
                  <div className="temoignage-card-bottom">
                    <div className="temoignage-avatar">
                      {getNom(t)[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="temoignage-auteur-info">
                      <strong>{getNom(t)}</strong>
                      {t.auteur?.entreprise && <span>{t.auteur.entreprise}</span>}
                      {t.ville && <span>{t.ville}</span>}
                      {getDate(t) && (
                        <span className="temoignage-date">
                          {new Date(getDate(t)).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  {t.reponse?.texte && (
                    <div style={{ marginTop: 12, padding: '0.7rem 1rem', background: '#e8f5e9',
                      borderLeft: '3px solid #1abc9c', borderRadius: '0 0.5rem 0.5rem 0',
                      fontSize: '0.85rem', color: '#2e7d32' }}>
                      <strong>Réponse ELIJAH'GOD :</strong> {t.reponse.texte}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FORMULAIRE TÉMOIGNAGE */}
      <section className="temoignages-cta">
        <div className="container temoignages-cta-content">
          {!showForm && submitStatus !== 'success' ? (
            <>
              <div className="temoignages-cta-icon">✨</div>
              <h2>Vous avez travaillé avec nous ?</h2>
              <p>Votre avis nous aide à nous améliorer et aide d'autres personnes à nous faire confiance.</p>
              <button onClick={() => setShowForm(true)} className="btn-gold" style={{ cursor: 'pointer', border: 'none' }}>
                💬 Laisser un témoignage
              </button>
            </>
          ) : submitStatus === 'success' ? (
            <>
              <div className="temoignages-cta-icon">✅</div>
              <h2>Merci pour votre témoignage !</h2>
              <p>Il sera visible sur le site après validation par notre équipe.</p>
              <button onClick={() => { setShowForm(false); setSubmitStatus(''); }} className="btn-gold"
                style={{ cursor: 'pointer', border: 'none' }}>
                Fermer
              </button>
            </>
          ) : (
            <div style={{ width: '100%', maxWidth: 600, textAlign: 'left' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>💬 Partagez votre expérience</h2>

              {/* Note étoiles */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ marginBottom: 8, fontWeight: 600, color: '#d4af37' }}>Votre note *</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setFormData(p => ({...p, note: n}))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '2rem', color: n <= formData.note ? '#f39c12' : '#ccc',
                        transition: 'color 0.15s' }}>
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.88rem', color: '#555' }}>Votre nom *</label>
                    <input type="text" required
                      value={formData.nom} placeholder="Prénom Nom"
                      onChange={e => setFormData(p => ({...p, nom: e.target.value}))}
                      readOnly={!!clientConnecte?.nom}
                      style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #ddd',
                        borderRadius: '0.6rem', fontSize: '0.9rem', boxSizing: 'border-box',
                        background: clientConnecte?.nom ? '#f9fef9' : '#fff',
                        borderColor: clientConnecte?.nom ? '#81c784' : '#ddd' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.88rem', color: '#555' }}>Email *</label>
                    <input type="email" required
                      value={formData.email} placeholder="votre@email.com"
                      onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                      readOnly={!!clientConnecte?.email}
                      style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #ddd',
                        borderRadius: '0.6rem', fontSize: '0.9rem', boxSizing: 'border-box',
                        background: clientConnecte?.email ? '#f9fef9' : '#fff',
                        borderColor: clientConnecte?.email ? '#81c784' : '#ddd' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.88rem', color: '#555' }}>Entreprise / Organisation</label>
                  <input type="text"
                    value={formData.entreprise} placeholder="(optionnel)"
                    onChange={e => setFormData(p => ({...p, entreprise: e.target.value}))}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #ddd',
                      borderRadius: '0.6rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.88rem', color: '#555' }}>Titre (court résumé)</label>
                  <input type="text"
                    value={formData.titre} placeholder="Ex : Une soirée inoubliable !"
                    onChange={e => setFormData(p => ({...p, titre: e.target.value}))}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #ddd',
                      borderRadius: '0.6rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.88rem', color: '#555' }}>Votre témoignage *</label>
                  <textarea required rows={4}
                    value={formData.contenu}
                    placeholder="Décrivez votre expérience avec ELIJAH'GOD…"
                    onChange={e => setFormData(p => ({...p, contenu: e.target.value}))}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #ddd',
                      borderRadius: '0.6rem', fontSize: '0.9rem', resize: 'vertical',
                      boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 4 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: '2px solid #ddd',
                      background: 'transparent', color: '#666', fontWeight: 600, cursor: 'pointer' }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={submitStatus === 'sending'} className="btn-gold"
                    style={{ cursor: 'pointer', border: 'none',
                      opacity: submitStatus === 'sending' ? 0.7 : 1 }}>
                    {submitStatus === 'sending' ? '⏳ Envoi…' : '✅ Soumettre mon témoignage'}
                  </button>
                </div>
              </form>
            </div>
          )}
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
