import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Clapperboard, Phone, Smartphone, MessageSquare,
  Palette, FileText, FileStack, Rocket, User, Settings2,
  ArrowLeft, Hourglass, Home, List
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import axios from 'axios';
import './AdminDashboard.css';

import { API_URL } from '../config';

/**
 * ⚙️ PAGE PARAMÈTRES - Gestion des paramètres du site (Admin uniquement)
 */
function ParametresPage() {
  const navigate = useNavigate();
  const { settings, updateSettings, loading: settingsLoading } = useContext(SettingsContext);
  const [formData, setFormData] = useState({
    // Entreprise
    entreprise: {
      nom: '',
      slogan: '',
      description: '',
      logo: '',
      banniere: ''
    },
    // Contact
    contact: {
      email: '',
      telephone: '',
      adresse: {
        rue: '',
        ville: '',
        codePostal: '',
        pays: 'France'
      },
      horaires: ''
    },
    // Réseaux sociaux
    reseauxSociaux: {
      facebook: '',
      instagram: '',
      youtube: ''
    },
    // Carousel (Hero Section)
    carousel: {
      titre: "ELIJAH'GOD",
      tagline: "Servir avec excellence, inspiré par la foi.",
      boutonPrincipal: {
        texte: "✨ Créons votre devis",
        lien: "/devis"
      },
      boutonSecondaire: {
        texte: "Découvrir nos services",
        lien: "/prestations"
      },
      disposition: 'centre',
      alignement: 'centre',
      couleurs: {
        texte: '#ffffff',
        arrierePlan: 'transparent',
        overlay: 'rgba(0, 0, 0, 0.5)'
      }
    },
    // Sections de la page d'accueil
    homepage: {
      sections: [
        {
          id: 'mission',
          type: 'mission',
          titre: "Bienvenue chez ELIJAH'GOD",
          sousTitre: '',
          contenu: "Une micro‑entreprise dédiée à la création d'événements harmonieux, professionnels et porteurs de sens.",
          disposition: 'vertical',
          ordre: 1,
          actif: true,
          couleurs: {
            texte: '#1a1a1a',
            arrierePlan: '#ffffff',
            titre: '#1a1a1a'
          },
          animation: {
            type: 'fade-in',
            delay: 0,
            duration: 800,
            easing: 'ease-out'
          }
        },
        {
          id: 'team',
          type: 'team',
          titre: "Notre Équipe de Prestataires",
          sousTitre: "Je travaille avec une équipe interne de prestataires talentueux, tous engagés, sérieux et passionnés.",
          contenu: '',
          disposition: 'grille',
          ordre: 2,
          actif: true,
          couleurs: {
            texte: '#1a1a1a',
            arrierePlan: '#f8f9fa',
            titre: '#1a1a1a'
          },
          animation: {
            type: 'slide-in-left',
            delay: 100,
            duration: 800,
            easing: 'ease-out'
          }
        },
        {
          id: 'values',
          type: 'values',
          titre: "Chez ELIJAH'GOD, nous cherchons à offrir plus qu'un service",
          sousTitre: "Nous apportons une expérience.",
          contenu: "Nous servons avec cœur, intégrité, et avec la conviction que chaque événement peut devenir un moment qui élève et rassemble.",
          disposition: 'grille',
          ordre: 3,
          actif: true,
          valeurs: [
            { icone: '❤️', titre: 'Cœur', description: 'Chaque événement est traité avec passion et dévouement' },
            { icone: '✨', titre: 'Intégrité', description: 'Transparence et honnêteté dans chacune de nos actions' },
            { icone: '🌟', titre: 'Excellence', description: 'Un service de qualité professionnelle à chaque prestation' }
          ],
          couleurs: {
            texte: '#1a1a1a',
            arrierePlan: '#ffffff',
            titre: '#1a1a1a'
          },
          animation: {
            type: 'slide-in-right',
            delay: 200,
            duration: 800,
            easing: 'ease-out'
          }
        },
        {
          id: 'cta',
          type: 'cta',
          titre: "Avec ELIJAH'GOD,",
          sousTitre: "chaque événement devient un moment mémorable.",
          contenu: "✨ Créons votre devis personnalisé",
          disposition: 'centre',
          ordre: 4,
          actif: true,
          couleurs: {
            texte: '#1a1a1a',
            arrierePlan: '#f0f0f0',
            titre: '#d4af37'
          },
          animation: {
            type: 'zoom-in',
            delay: 300,
            duration: 800,
            easing: 'ease-out'
          }
        }
      ],
      // Section "Mon rôle" (fixe, toujours affichée)
      role: {
        actif: true,
        titre: 'Mon rôle est simple',
        cartes: [
          { numero: 1, icone: '👥', titre: 'Assembler ces talents', description: 'Je sélectionne les meilleurs prestataires adaptés à votre événement' },
          { numero: 2, icone: '📦', titre: 'Construire un forfait tout compris', description: 'Je crée une solution clé en main parfaitement adaptée à vos besoins' },
          { numero: 3, icone: '🤝', titre: 'Vous accompagner du début à la fin', description: 'Dans la bienveillance et la sérénité, à chaque étape de votre projet' }
        ]
      },
      // Section verset biblique
      verse: {
        actif: true,
        texte: 'Que tout ce que vous faites soit fait avec amour.',
        reference: '— 1 Corinthiens 16:14'
      },
      // Section inclusivité
      inclusivity: {
        actif: true,
        texte: "Que vous soyez chrétien ou non, vous trouverez ici une équipe à l'écoute, qui respecte pleinement votre vision et met tout en œuvre pour faire de votre événement un moment inoubliable."
      }
    },
    // Configuration des autres pages
    pages: {
      prestataires: {
        hero: {
          titre: 'Nos Prestataires',
          sousTitre: 'Des talents dédiés à la réussite de votre événement',
          couleurs: { texte: '#ffffff', arrierePlan: '#1a1a2e', overlay: 'rgba(0,0,0,0.6)' },
          animation: { type: 'fade-in', duration: 800, delay: 0 }
        },
        sections: {
          filtres: { animation: { type: 'slide-in-up', duration: 700, delay: 100 } },
          grille: { animation: { type: 'zoom-in', duration: 600, delay: 150 } },
          cta: { animation: { type: 'fade-in', duration: 800, delay: 0 } }
        },
        actif: true
      },
      prestations: {
        hero: {
          titre: 'Nos Prestations',
          sousTitre: 'Des formules sur-mesure pour chaque événement',
          couleurs: { texte: '#ffffff', arrierePlan: '#16213e', overlay: 'rgba(0,0,0,0.6)' },
          animation: { type: 'fade-in', duration: 800, delay: 0 }
        },
        sections: {
          filtres: { animation: { type: 'slide-in-up', duration: 700, delay: 100 } },
          grille: { animation: { type: 'zoom-in', duration: 600, delay: 150 } },
          cta: { animation: { type: 'fade-in', duration: 800, delay: 0 } }
        },
        actif: true
      },
      contact: {
        hero: {
          titre: 'Contactez-nous',
          sousTitre: 'Nous sommes à votre écoute',
          couleurs: { texte: '#ffffff', arrierePlan: '#0f0f23', overlay: 'rgba(0,0,0,0.5)' },
          animation: { type: 'slide-in-up', duration: 800, delay: 0 }
        },
        actif: true
      },
      devis: {
        hero: {
          titre: 'Votre Devis Personnalisé',
          sousTitre: 'Décrivez votre projet et recevez une offre sur-mesure',
          couleurs: { texte: '#ffffff', arrierePlan: '#1a0a2e', overlay: 'rgba(0,0,0,0.55)' },
          animation: { type: 'zoom-in', duration: 800, delay: 0 }
        },
        actif: true
      }
    },
    // Messages
    messages: {
      accueil: {
        titre: '',
        sousTitre: '',
        description: ''
      },
      apropos: '',
      piedDePage: ''
    },
    // Options du site
    site: {
      afficherPrix: true,
      afficherAvis: true,
      couleurPrincipale: '#d4af37',
      couleurSecondaire: '#f4e5b8'
    },
    // Devis
    devis: {
      messageConfirmation: '',
      cgv: ''
    },
    // SEO
    seo: {
      metaTitre: '',
      metaDescription: '',
      motsCles: []
    },
    // À propos
    aPropos: {
      hero: {
        surTitre: 'Fondateur & Directeur artistique',
        titre: "Bienvenue, je suis Randy ODOUNGA",
        citation: "Servir avec excellence, inspiré par la foi.",
        photo: ''
      },
      presentation: {
        actif: true,
        titre: 'Qui suis-je ?',
        contenu: '',
        photo: ''
      },
      motivation: {
        actif: true,
        icone: '🔥',
        titre: "Ce qui m'a poussé",
        contenu: '',
        photo: ''
      },
      mission: {
        actif: true,
        icone: '🎯',
        titre: 'Ce que je donne à travers mes prestations',
        contenu: '',
        photo: ''
      },
      valeurs: [
        { icone: '🙏', titre: 'Foi & Intégrité', description: 'Mon travail est ancré dans des valeurs solides.' },
        { icone: '🎶', titre: 'Excellence artistique', description: 'Pas de compromis sur la qualité.' },
        { icone: '❤️', titre: 'Service du cœur', description: "Je m'investis dans votre événement comme si c'était le mien." },
        { icone: '🤝', titre: 'Relation de confiance', description: "Un prestataire disponible, à l'écoute et transparent." }
      ],
      parcours: [
        { annee: '2015', titre: 'Les premières notes', description: 'Formation autodidacte en sonorisation.' },
        { annee: '2018', titre: 'Premiers événements', description: 'Mariages et soirées privées.' },
        { annee: '2021', titre: "Création d'ELIJAH'GOD", description: 'Lancement officiel.' },
        { annee: '2024', titre: 'Expansion & équipe', description: 'Prestataires partenaires.' }
      ]
    },
    // Catégories prestataires
    categoriesPrestataires: [
      'DJ','Photographe','Vidéaste','Animateur','Groupe de louange',
      'Wedding planner','Traiteur','Sonorisation','Éclairage','Décoration',
      'Location matériel','Autre'
    ]
  });

  const [activeTab, setActiveTab] = useState('entreprise');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Charger les paramètres au montage
  useEffect(() => {
    if (settings) {
      setFormData({
        entreprise: settings.entreprise || formData.entreprise,
        contact: settings.contact || formData.contact,
        reseauxSociaux: settings.reseauxSociaux || formData.reseauxSociaux,
        carousel: settings.carousel || formData.carousel,
        homepage: settings.homepage
          ? {
              // Deep merge: conserver les defaults si settings ne les a pas
              ...formData.homepage,
              ...settings.homepage,
              // Sections: merger les valeurs[] manquantes
              sections: (settings.homepage.sections || formData.homepage.sections).map(s => {
                const def = formData.homepage.sections.find(d => d.id === s.id);
                return def ? { ...def, ...s, valeurs: s.valeurs || def.valeurs } : s;
              }),
              role: settings.homepage.role
                ? { ...formData.homepage.role, ...settings.homepage.role,
                    cartes: settings.homepage.role.cartes || formData.homepage.role.cartes }
                : formData.homepage.role,
              verse: { ...formData.homepage.verse, ...(settings.homepage.verse || {}) },
              inclusivity: { ...formData.homepage.inclusivity, ...(settings.homepage.inclusivity || {}) }
            }
          : formData.homepage,
        pages: settings.pages || formData.pages,
        messages: settings.messages || formData.messages,
        site: settings.site || formData.site,
        devis: settings.devis || formData.devis,
        seo: settings.seo || formData.seo,
        aPropos: settings.aPropos || formData.aPropos,
        categoriesPrestataires: settings.categoriesPrestataires || formData.categoriesPrestataires
      });
    }
  }, [settings]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  // Helpers pour le paramétrage des pages
  const handlePageHeroChange = (pageName, field, value) => {
    setFormData(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageName]: {
          ...prev.pages[pageName],
          hero: { ...prev.pages[pageName].hero, [field]: value }
        }
      }
    }));
  };

  const handlePageHeroColorChange = (pageName, colorField, value) => {
    setFormData(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageName]: {
          ...prev.pages[pageName],
          hero: {
            ...prev.pages[pageName].hero,
            couleurs: { ...prev.pages[pageName].hero.couleurs, [colorField]: value }
          }
        }
      }
    }));
  };

  const handlePageHeroAnimationChange = (pageName, animField, value) => {
    setFormData(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageName]: {
          ...prev.pages[pageName],
          hero: {
            ...prev.pages[pageName].hero,
            animation: { ...prev.pages[pageName].hero.animation, [animField]: value }
          }
        }
      }
    }));
  };

  const handlePageActiveChange = (pageName, value) => {
    setFormData(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageName]: { ...prev.pages[pageName], actif: value }
      }
    }));
  };

  const handlePageSectionAnimChange = (pageName, sectionKey, animField, value) => {
    setFormData(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageName]: {
          ...prev.pages[pageName],
          sections: {
            ...prev.pages[pageName]?.sections,
            [sectionKey]: {
              ...prev.pages[pageName]?.sections?.[sectionKey],
              animation: {
                ...prev.pages[pageName]?.sections?.[sectionKey]?.animation,
                [animField]: value
              }
            }
          }
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await updateSettings(formData);
      setMessage({ type: 'success', text: '✅ Paramètres enregistrés avec succès !' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'entreprise', label: 'Entreprise',       icon: Building2     },
    { id: 'carousel',   label: 'Carousel',          icon: Clapperboard  },
    { id: 'homepage',   label: "Page d'accueil",    icon: Home          },
    { id: 'contact',    label: 'Contact',            icon: Phone         },
    { id: 'reseaux',    label: 'Réseaux sociaux',    icon: Smartphone    },
    { id: 'messages',   label: 'Messages',           icon: MessageSquare },
    { id: 'site',       label: 'Apparence',          icon: Palette       },
    { id: 'devis',      label: 'Devis',              icon: FileText      },
    { id: 'pages',      label: 'Autres Pages',       icon: FileStack     },
    { id: 'seo',        label: 'SEO',                icon: Rocket        },
    { id: 'aPropos',    label: 'À propos',            icon: User          },
    { id: 'categories', label: 'Catégories',           icon: List          }
  ];

  if (settingsLoading) {
    return (
      <div className="admin-page">
        <div className="container">
          <p style={{ textAlign: 'center', padding: '4rem' }}>
            <Hourglass size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Chargement des paramètres...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        {/* En-tête */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Settings2 size={26} style={{ verticalAlign: 'middle', marginRight: 8, color: '#d4af37' }} />
              Paramètres du site
            </h1>
            <p className="page-subtitle">Configuration globale de votre application</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Retour au tableau de bord
          </button>
        </div>

        {/* Message de statut */}
        {message.text && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '2rem' }}>
            {message.text}
          </div>
        )}

        {/* Onglets */}
        <div className="tabs-container" style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem', 
          flexWrap: 'wrap',
          borderBottom: '3px solid #e9ecef',
          paddingBottom: '1rem'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                padding: '0.8rem 1.4rem',
                border: 'none',
                borderRadius: '1rem 1rem 0 0',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #d4af37 0%, #f4e5b8 100%)' 
                  : 'white',
                color: activeTab === tab.id ? '#1a1a2e' : '#666',
                fontWeight: activeTab === tab.id ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(212,175,55,0.3)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="settings-content" style={{
          background: 'white',
          borderRadius: '2rem',
          padding: '3rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          
          {/* ONGLET ENTREPRISE */}
          {activeTab === 'entreprise' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '2rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={22} color="#d4af37" /> Informations sur l'entreprise
              </h2>
              
              <div className="form-group">
                <label>Nom de l'entreprise *</label>
                <input
                  type="text"
                  value={formData.entreprise.nom}
                  onChange={(e) => handleChange('entreprise', 'nom', e.target.value)}
                  placeholder="Ex: ELIJAH'GOD"
                />
              </div>

              <div className="form-group">
                <label>Slogan</label>
                <input
                  type="text"
                  value={formData.entreprise.slogan}
                  onChange={(e) => handleChange('entreprise', 'slogan', e.target.value)}
                  placeholder="Ex: Servir avec excellence, inspiré par la foi"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.entreprise.description}
                  onChange={(e) => handleChange('entreprise', 'description', e.target.value)}
                  placeholder="Description complète de votre entreprise"
                  rows="5"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>URL du logo</label>
                  <input
                    type="url"
                    value={formData.entreprise.logo}
                    onChange={(e) => handleChange('entreprise', 'logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  {formData.entreprise.logo && (
                    <img src={formData.entreprise.logo} alt="Logo" style={{ 
                      maxWidth: '200px', 
                      marginTop: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '0.5rem'
                    }} />
                  )}
                </div>

                <div className="form-group">
                  <label>🖼️ Image du carrousel (bannière)</label>
                  <input
                    type="text"
                    value={formData.entreprise.banniere}
                    onChange={(e) => handleChange('entreprise', 'banniere', e.target.value)}
                    placeholder="Ex: /images/carousel.jpg ou https://example.com/banner.jpg"
                  />
                  <small style={{ display: 'block', marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    💡 <strong>Pour une image locale:</strong> Placez votre image dans le dossier <code>frontend/public/images/</code> puis entrez le chemin <code>/images/nom-image.jpg</code><br/>
                    💡 <strong>Ou utilisez une URL:</strong> Entrez l'URL complète de l'image (ex: https://...)
                  </small>
                  {formData.entreprise.banniere && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📸 Aperçu :</p>
                      <img src={formData.entreprise.banniere} alt="Bannière" style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px',
                        objectFit: 'cover',
                        border: '2px solid #e9ecef',
                        borderRadius: '0.5rem'
                      }} onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }} />
                      <div style={{ 
                        display: 'none', 
                        padding: '1rem', 
                        background: '#fff3cd', 
                        border: '1px solid #ffc107',
                        borderRadius: '0.5rem',
                        color: '#856404',
                        marginTop: '0.5rem'
                      }}>
                        ⚠️ Impossible de charger l'image. Vérifiez le chemin ou l'URL.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET CAROUSEL & PAGES */}
          {activeTab === 'carousel' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '2rem', color: '#1a1a2e' }}>🎬 Carousel & Sections de la Page d'Accueil</h2>
              
              {/* Section Carousel */}
              <div style={{ 
                background: 'linear-gradient(135deg, #fff9e6 0%, #fffcf0 100%)', 
                padding: '2rem', 
                borderRadius: '1rem',
                marginBottom: '3rem',
                border: '2px solid #d4af37'
              }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
                  🎯 Carousel (Hero Section)
                </h3>

                {/* === UPLOAD IMAGE DE FOND === */}
                <div style={{ marginBottom: '2rem', background: 'white', borderRadius: '0.8rem', padding: '1.5rem', border: '2px dashed #d4af37' }}>
                  <h4 style={{ color: '#1a1a2e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🖼️ Image de fond du Carousel
                  </h4>

                  {/* Aperçu de l'image actuelle */}
                  {formData.entreprise?.banniere && (
                    <div style={{ marginBottom: '1rem', position: 'relative', borderRadius: '0.6rem', overflow: 'hidden', maxHeight: '220px' }}>
                      <img
                        src={formData.entreprise.banniere.startsWith('http') ? formData.entreprise.banniere : `${API_URL}${formData.entreprise.banniere}`}
                        alt="Image carousel"
                        style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block', borderRadius: '0.6rem' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)', display: 'flex', alignItems: 'flex-end', padding: '0.75rem' }}>
                        <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: '600' }}>✅ Image actuelle</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Bouton upload */}
                    <input
                      type="file"
                      accept="image/*"
                      id="upload-carousel-banniere"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('banniere', file);
                        try {
                          setMessage({ type: 'info', text: '⏳ Upload en cours…' });
                          const { data } = await axios.post(`${API_URL}/api/settings/carousel/upload-banniere`, fd, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          if (data.success) {
                            setFormData(prev => ({
                              ...prev,
                              entreprise: { ...prev.entreprise, banniere: data.url }
                            }));
                            setMessage({ type: 'success', text: '✅ Image du carousel mise à jour !' });
                          }
                        } catch {
                          setMessage({ type: 'error', text: '❌ Erreur lors de l\'upload de l\'image' });
                        }
                        e.target.value = '';
                      }}
                    />
                    <label
                      htmlFor="upload-carousel-banniere"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        background: '#d4af37', color: '#1a1a2e', padding: '0.65rem 1.2rem',
                        borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem'
                      }}
                    >
                      📁 {formData.entreprise?.banniere ? 'Changer l\'image' : 'Choisir une image'}
                    </label>

                    {/* Bouton supprimer */}
                    {formData.entreprise?.banniere && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await axios.delete(`${API_URL}/api/settings/carousel/banniere`);
                            setFormData(prev => ({ ...prev, entreprise: { ...prev.entreprise, banniere: '' } }));
                            setMessage({ type: 'success', text: '✅ Image supprimée' });
                          } catch {
                            // Même si l'API échoue, on efface localement
                            setFormData(prev => ({ ...prev, entreprise: { ...prev.entreprise, banniere: '' } }));
                          }
                        }}
                        style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '0.65rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                      >
                        🗑️ Supprimer
                      </button>
                    )}
                  </div>
                  <p style={{ color: '#888', fontSize: '0.82rem', marginTop: '0.6rem' }}>JPG, PNG ou WEBP — max 20 Mo. Recommandé : 1920×1080 px</p>
                </div>

                <div className="form-group">
                  <label>Titre Principal</label>
                  <input
                    type="text"
                    value={formData.carousel?.titre || "ELIJAH'GOD"}
                    onChange={(e) => handleChange('carousel', 'titre', e.target.value)}
                    placeholder="Ex: ELIJAH'GOD"
                    style={{ fontSize: '1.2rem', fontWeight: '600' }}
                  />
                </div>

                <div className="form-group">
                  <label>Sous-titre (Tagline)</label>
                  <input
                    type="text"
                    value={formData.carousel?.tagline || ''}
                    onChange={(e) => handleChange('carousel', 'tagline', e.target.value)}
                    placeholder="Ex: Servir avec excellence, inspiré par la foi."
                  />
                </div>

                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>🎨 Disposition</label>
                    <select
                      value={formData.carousel?.disposition || 'centre'}
                      onChange={(e) => handleChange('carousel', 'disposition', e.target.value)}
                      style={{ padding: '0.8rem', fontSize: '1rem' }}
                    >
                      <option value="centre">🎯 Centre</option>
                      <option value="horizontal">↔️ Horizontal</option>
                      <option value="vertical">↕️ Vertical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>📐 Alignement</label>
                    <select
                      value={formData.carousel?.alignement || 'centre'}
                      onChange={(e) => handleChange('carousel', 'alignement', e.target.value)}
                      style={{ padding: '0.8rem', fontSize: '1rem' }}
                    >
                      <option value="gauche">⬅️ Gauche</option>
                      <option value="centre">⬆️ Centre</option>
                      <option value="droite">➡️ Droite</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '2px dashed #d4af37', paddingTop: '2rem' }}>
                  <h4 style={{ marginBottom: '1.5rem', color: '#d4af37' }}>🔘 Boutons d'Action</h4>
                  
                  <div style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '0.8rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h5 style={{ marginBottom: '1rem' }}>Bouton Principal</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Texte</label>
                        <input
                          type="text"
                          value={formData.carousel?.boutonPrincipal?.texte || ''}
                          onChange={(e) => handleNestedChange('carousel', 'boutonPrincipal', 'texte', e.target.value)}
                          placeholder="Ex: ✨ Créons votre devis"
                        />
                      </div>
                      <div className="form-group">
                        <label>Lien</label>
                        <input
                          type="text"
                          value={formData.carousel?.boutonPrincipal?.lien || ''}
                          onChange={(e) => handleNestedChange('carousel', 'boutonPrincipal', 'lien', e.target.value)}
                          placeholder="Ex: /devis"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '0.8rem'
                  }}>
                    <h5 style={{ marginBottom: '1rem' }}>Bouton Secondaire</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Texte</label>
                        <input
                          type="text"
                          value={formData.carousel?.boutonSecondaire?.texte || ''}
                          onChange={(e) => handleNestedChange('carousel', 'boutonSecondaire', 'texte', e.target.value)}
                          placeholder="Ex: Découvrir nos services"
                        />
                      </div>
                      <div className="form-group">
                        <label>Lien</label>
                        <input
                          type="text"
                          value={formData.carousel?.boutonSecondaire?.lien || ''}
                          onChange={(e) => handleNestedChange('carousel', 'boutonSecondaire', 'lien', e.target.value)}
                          placeholder="Ex: /prestations"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '2px dashed #d4af37', paddingTop: '2rem' }}>
                  <h4 style={{ marginBottom: '1.5rem', color: '#d4af37' }}>🎨 Couleurs du Carousel</h4>
                  
                  <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div className="form-group">
                      <label>Couleur du Texte</label>
                      <input
                        type="color"
                        value={formData.carousel?.couleurs?.texte || '#ffffff'}
                        onChange={(e) => handleNestedChange('carousel', 'couleurs', 'texte', e.target.value)}
                        style={{ width: '100%', height: '50px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={formData.carousel?.couleurs?.texte || '#ffffff'}
                        onChange={(e) => handleNestedChange('carousel', 'couleurs', 'texte', e.target.value)}
                        placeholder="#ffffff"
                        style={{ marginTop: '0.5rem' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Couleur d'Arrière-plan</label>
                      <input
                        type="color"
                        value={formData.carousel?.couleurs?.arrierePlan !== 'transparent' ? formData.carousel?.couleurs?.arrierePlan : '#000000'}
                        onChange={(e) => handleNestedChange('carousel', 'couleurs', 'arrierePlan', e.target.value)}
                        style={{ width: '100%', height: '50px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={formData.carousel?.couleurs?.arrierePlan || 'transparent'}
                        onChange={(e) => handleNestedChange('carousel', 'couleurs', 'arrierePlan', e.target.value)}
                        placeholder="transparent ou #000000"
                        style={{ marginTop: '0.5rem' }}
                      />
                      <small style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                        💡 Utilisez "transparent" pour voir l'image de fond
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Opacité Overlay (voile noir)</label>
                      <input
                        type="text"
                        value={formData.carousel?.couleurs?.overlay || 'rgba(0, 0, 0, 0.5)'}
                        onChange={(e) => handleNestedChange('carousel', 'couleurs', 'overlay', e.target.value)}
                        placeholder="rgba(0, 0, 0, 0.5)"
                      />
                      <small style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                        💡 Exemples: rgba(0,0,0,0.5) = noir 50%, rgba(0,0,0,0) = pas d'overlay
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====== ONGLET PAGE D'ACCUEIL ====== */}
          {activeTab === 'homepage' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '0.5rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Home size={22} color="#d4af37" /> Textes de la Page d'Accueil
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Modifiez tous les textes affichés sur la page d'accueil du site.
              </p>

              {/* Section Sections de la Page d'Accueil */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#1a1a2e', fontSize: '1.2rem', borderBottom: '2px solid #d4af37', paddingBottom: '0.5rem' }}>
                  📑 Sections principales (Mission, Équipe, Valeurs, CTA)
                </h3>
                <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  💡 Glissez-déposez les sections pour changer leur ordre. Décochez pour masquer une section.
                </p>

                {formData.homepage?.sections?.length > 0 ? (
                  formData.homepage.sections
                    .sort((a, b) => a.ordre - b.ordre)
                    .map((section, index) => (
                      <div 
                        key={section.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('sectionIndex', index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const dragIndex = parseInt(e.dataTransfer.getData('sectionIndex'));
                          const sections = [...formData.homepage.sections];
                          const dragSection = sections[dragIndex];
                          sections.splice(dragIndex, 1);
                          sections.splice(index, 0, dragSection);
                          sections.forEach((s, i) => s.ordre = i + 1);
                          setFormData(prev => ({
                            ...prev,
                            homepage: { ...prev.homepage, sections }
                          }));
                        }}
                        style={{
                          background: section.actif ? 'white' : '#f8f9fa',
                          border: '2px solid ' + (section.actif ? '#d4af37' : '#dee2e6'),
                          borderRadius: '1rem',
                          padding: '1.5rem',
                          marginBottom: '1rem',
                          cursor: 'grab',
                          transition: 'all 0.3s ease',
                          opacity: section.actif ? 1 : 0.6
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '1.5rem', cursor: 'grab' }}>☰</span>
                          <span style={{ 
                            background: '#d4af37', 
                            color: 'white', 
                            padding: '0.3rem 0.8rem', 
                            borderRadius: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}>
                            #{section.ordre}
                          </span>
                          <h4 style={{ flex: 1, margin: 0 }}>
                            {section.type === 'mission' && '🎯 Mission'}
                            {section.type === 'team' && '👥 Équipe'}
                            {section.type === 'values' && '⭐ Valeurs'}
                            {section.type === 'cta' && '📢 Appel à l\'action'}
                          </h4>
                          {/* Badge animation */}
                          {section.animation?.type && section.animation.type !== 'none' && (
                            <span style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              padding: '0.2rem 0.7rem',
                              borderRadius: '2rem',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              {section.animation.type === 'fade-in' && '✨ Fondu'}
                              {section.animation.type === 'slide-in-left' && '← Gauche'}
                              {section.animation.type === 'slide-in-right' && '→ Droite'}
                              {section.animation.type === 'slide-in-up' && '↑ Haut'}
                              {section.animation.type === 'slide-in-down' && '↓ Bas'}
                              {section.animation.type === 'zoom-in' && '🔍 Zoom'}
                              {section.animation.type === 'flip-in' && '🔄 Flip'}
                            </span>
                          )}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={section.actif}
                              onChange={(e) => {
                                const sections = [...formData.homepage.sections];
                                sections[index].actif = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  homepage: { ...prev.homepage, sections }
                                }));
                              }}
                              style={{ width: '20px', height: '20px' }}
                            />
                            <span style={{ fontWeight: '600' }}>
                              {section.actif ? '✅ Visible' : '❌ Masquée'}
                            </span>
                          </label>
                        </div>

                        <div className="form-group">
                          <label>Titre</label>
                          <input
                            type="text"
                            value={section.titre || ''}
                            onChange={(e) => {
                              const sections = [...formData.homepage.sections];
                              sections[index].titre = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                homepage: { ...prev.homepage, sections }
                              }));
                            }}
                            placeholder="Titre de la section"
                          />
                        </div>

                        <div className="form-group">
                          <label>Sous-titre</label>
                          <input
                            type="text"
                            value={section.sousTitre || ''}
                            onChange={(e) => {
                              const sections = [...formData.homepage.sections];
                              sections[index].sousTitre = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                homepage: { ...prev.homepage, sections }
                              }));
                            }}
                            placeholder="Sous-titre (optionnel)"
                          />
                        </div>

                        <div className="form-group">
                          <label>Contenu</label>
                          <textarea
                            value={section.contenu || ''}
                            onChange={(e) => {
                              const sections = [...formData.homepage.sections];
                              sections[index].contenu = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                homepage: { ...prev.homepage, sections }
                              }));
                            }}
                            placeholder="Contenu de la section"
                            rows="3"
                          />
                        </div>

                        {/* Éditeur des cartes de valeurs (Cœur / Intégrité / Excellence) */}
                        {section.type === 'values' && (
                          <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fffbea', borderRadius: '1rem', border: '2px dashed #d4af37' }}>
                            <h5 style={{ marginBottom: '1.2rem', color: '#d4af37' }}>⭐ Cartes de Valeurs</h5>
                            {(section.valeurs || []).map((valeur, vi) => (
                              <div key={vi} style={{ background: 'white', border: '1px solid #eee', borderRadius: '0.8rem', padding: '1.2rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                  <span style={{ fontWeight: '700', color: '#d4af37', fontSize: '1.1rem' }}>Carte {vi + 1}</span>
                                </div>
                                <div className="form-row" style={{ gridTemplateColumns: '80px 1fr 2fr' }}>
                                  <div className="form-group">
                                    <label>Icône</label>
                                    <input type="text" value={valeur.icone || ''} onChange={(e) => {
                                      const sections = [...formData.homepage.sections];
                                      sections[index].valeurs = [...(sections[index].valeurs || [])];
                                      sections[index].valeurs[vi] = { ...sections[index].valeurs[vi], icone: e.target.value };
                                      setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, sections } }));
                                    }} placeholder="❤️" style={{ fontSize: '1.4rem', textAlign: 'center' }} />
                                  </div>
                                  <div className="form-group">
                                    <label>Titre</label>
                                    <input type="text" value={valeur.titre || ''} onChange={(e) => {
                                      const sections = [...formData.homepage.sections];
                                      sections[index].valeurs = [...(sections[index].valeurs || [])];
                                      sections[index].valeurs[vi] = { ...sections[index].valeurs[vi], titre: e.target.value };
                                      setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, sections } }));
                                    }} placeholder="Cœur" />
                                  </div>
                                  <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" value={valeur.description || ''} onChange={(e) => {
                                      const sections = [...formData.homepage.sections];
                                      sections[index].valeurs = [...(sections[index].valeurs || [])];
                                      sections[index].valeurs[vi] = { ...sections[index].valeurs[vi], description: e.target.value };
                                      setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, sections } }));
                                    }} placeholder="Description de la valeur" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="form-group">
                          <label>🎨 Disposition</label>
                          <select
                            value={section.disposition || 'vertical'}
                            onChange={(e) => {
                              const sections = [...formData.homepage.sections];
                              sections[index].disposition = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                homepage: { ...prev.homepage, sections }
                              }));
                            }}
                            style={{ padding: '0.8rem' }}
                          >
                            <option value="horizontal">↔️ Horizontal</option>
                            <option value="vertical">↕️ Vertical</option>
                            <option value="grille">🔲 Grille</option>
                            <option value="centre">🎯 Centré</option>
                          </select>
                        </div>

                        <div style={{ 
                          marginTop: '1.5rem', 
                          padding: '1.5rem', 
                          background: '#f9f9f9', 
                          borderRadius: '0.8rem',
                          border: '1px solid #e0e0e0'
                        }}>
                          <h5 style={{ marginBottom: '1rem', color: '#d4af37' }}>🎨 Couleurs de la Section</h5>
                          
                          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <div className="form-group">
                              <label>Couleur du Texte</label>
                              <input
                                type="color"
                                value={section.couleurs?.texte || '#1a1a1a'}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].couleurs = sections[index].couleurs || {};
                                  sections[index].couleurs.texte = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                              />
                              <input
                                type="text"
                                value={section.couleurs?.texte || '#1a1a1a'}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].couleurs = sections[index].couleurs || {};
                                  sections[index].couleurs.texte = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                placeholder="#1a1a1a"
                                style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                              />
                            </div>

                            <div className="form-group">
                              <label>Arrière-plan</label>
                              <input
                                type="color"
                                value={section.couleurs?.arrierePlan || '#ffffff'}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].couleurs = sections[index].couleurs || {};
                                  sections[index].couleurs.arrierePlan = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                              />
                              <input
                                type="text"
                                value={section.couleurs?.arrierePlan || '#ffffff'}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].couleurs = sections[index].couleurs || {};
                                  sections[index].couleurs.arrierePlan = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                placeholder="#ffffff"
                                style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                              />
                            </div>

                            <div className="form-group">
                              <label>Couleur du Titre</label>
                              <input
                                type="color"
                                value={section.couleurs?.titre || '#1a1a1a'}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].couleurs = sections[index].couleurs || {};
                                  sections[index].couleurs.titre = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                              />
                              <input
                                type="text"
                                value={section.couleurs?.titre || '#1a1a1a'}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].couleurs = sections[index].couleurs || {};
                                  sections[index].couleurs.titre = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                placeholder="#1a1a1a"
                                style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section Animation */}
                        <div style={{
                          marginTop: '1.5rem',
                          padding: '1.5rem',
                          background: '#f8f9fa',
                          borderRadius: '1rem',
                          border: '1px solid #e0e0e0'
                        }}>
                          <h5 style={{ marginBottom: '1rem', color: '#d4af37' }}>✨ Animations d'Apparition</h5>
                          
                          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="form-group">
                              <label>Type d'Animation</label>
                              <select
                                value={section.animation?.type || 'fade-in'}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].animation = sections[index].animation || {};
                                  sections[index].animation.type = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  borderRadius: '0.5rem',
                                  border: '1px solid #ddd',
                                  fontSize: '0.95rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="none">Aucune animation</option>
                                <option value="fade-in">✨ Fondu (Fade In)</option>
                                <option value="slide-in-left">← Glissement Gauche</option>
                                <option value="slide-in-right">→ Glissement Droite</option>
                                <option value="slide-in-up">↑ Glissement Haut</option>
                                <option value="slide-in-down">↓ Glissement Bas</option>
                                <option value="zoom-in">🔍 Zoom In</option>
                                <option value="flip-in">🔄 Rotation</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label>Vitesse d'Animation</label>
                              <select
                                value={section.animation?.easing || 'ease-out'}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].animation = sections[index].animation || {};
                                  sections[index].animation.easing = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  borderRadius: '0.5rem',
                                  border: '1px solid #ddd',
                                  fontSize: '0.95rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="linear">Linéaire</option>
                                <option value="ease">Normal</option>
                                <option value="ease-in">Accélération</option>
                                <option value="ease-out">Décélération</option>
                                <option value="ease-in-out">Acc. + Déc.</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                            <div className="form-group">
                              <label>Délai (ms) <span style={{ color: '#999', fontSize: '0.85rem' }}>0-5000</span></label>
                              <input
                                type="number"
                                min="0"
                                max="5000"
                                step="100"
                                value={section.animation?.delay || 0}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].animation = sections[index].animation || {};
                                  sections[index].animation.delay = parseInt(e.target.value) || 0;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  borderRadius: '0.5rem',
                                  border: '1px solid #ddd',
                                  fontSize: '0.95rem'
                                }}
                              />
                              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                Délai avant le démarrage de l'animation
                              </small>
                            </div>

                            <div className="form-group">
                              <label>Durée (ms) <span style={{ color: '#999', fontSize: '0.85rem' }}>100-3000</span></label>
                              <input
                                type="number"
                                min="100"
                                max="3000"
                                step="100"
                                value={section.animation?.duration || 800}
                                onChange={(e) => {
                                  const sections = [...formData.homepage.sections];
                                  sections[index].animation = sections[index].animation || {};
                                  sections[index].animation.duration = parseInt(e.target.value) || 800;
                                  setFormData(prev => ({
                                    ...prev,
                                    homepage: { ...prev.homepage, sections }
                                  }));
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  borderRadius: '0.5rem',
                                  border: '1px solid #ddd',
                                  fontSize: '0.95rem'
                                }}
                              />
                              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                Durée de l'animation (800ms recommandé)
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    background: '#f8f9fa', 
                    borderRadius: '1rem',
                    color: '#666'
                  }}>
                    Aucune section configurée
                  </div>
                )}
              </div>

              {/* ====== SECTION RÔLE (fixe) ====== */}
              <h3 style={{ marginTop: '2.5rem', marginBottom: '1rem', color: '#1a1a2e', fontSize: '1.2rem', borderBottom: '2px solid #d4af37', paddingBottom: '0.5rem' }}>
                📌 Sections fixes (toujours affichées)
              </h3>
              <div style={{ marginTop: '1rem', padding: '2rem', background: '#f9f9f9', borderRadius: '1rem', border: '2px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, color: '#1a1a2e' }}>🎯 Section "Mon Rôle" <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>(toujours affichée)</span></h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.homepage?.role?.actif !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, role: { ...prev.homepage.role, actif: e.target.checked } } }))}
                      style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '600' }}>{formData.homepage?.role?.actif !== false ? '✅ Visible' : '❌ Masquée'}</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Titre de la section</label>
                  <input type="text" value={formData.homepage?.role?.titre || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, role: { ...prev.homepage.role, titre: e.target.value } } }))}
                    placeholder="Mon rôle est simple" />
                </div>
                <h5 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>Cartes des 3 rôles</h5>
                {(formData.homepage?.role?.cartes || []).map((carte, ci) => (
                  <div key={ci} style={{ background: 'white', border: '1px solid #eee', borderRadius: '0.8rem', padding: '1.2rem', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '700', color: '#d4af37', marginBottom: '0.8rem' }}>Étape {carte.numero}</div>
                    <div className="form-row" style={{ gridTemplateColumns: '80px 1fr' }}>
                      <div className="form-group">
                        <label>Icône</label>
                        <input type="text" value={carte.icone || ''} onChange={(e) => {
                          const cartes = [...(formData.homepage.role.cartes || [])];
                          cartes[ci] = { ...cartes[ci], icone: e.target.value };
                          setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, role: { ...prev.homepage.role, cartes } } }));
                        }} placeholder="👥" style={{ fontSize: '1.4rem', textAlign: 'center' }} />
                      </div>
                      <div className="form-group">
                        <label>Titre</label>
                        <input type="text" value={carte.titre || ''} onChange={(e) => {
                          const cartes = [...(formData.homepage.role.cartes || [])];
                          cartes[ci] = { ...cartes[ci], titre: e.target.value };
                          setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, role: { ...prev.homepage.role, cartes } } }));
                        }} placeholder="Titre de l'étape" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input type="text" value={carte.description || ''} onChange={(e) => {
                        const cartes = [...(formData.homepage.role.cartes || [])];
                        cartes[ci] = { ...cartes[ci], description: e.target.value };
                        setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, role: { ...prev.homepage.role, cartes } } }));
                      }} placeholder="Description" />
                    </div>
                  </div>
                ))}
              </div>

              {/* ====== SECTION VERSET ====== */}
              <div style={{ marginTop: '2rem', padding: '2rem', background: '#080810', borderRadius: '1rem', border: '2px solid #d4af37' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, color: '#d4af37' }}>✝️ Verset Biblique</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.homepage?.verse?.actif !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, verse: { ...prev.homepage.verse, actif: e.target.checked } } }))}
                      style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '600', color: 'white' }}>{formData.homepage?.verse?.actif !== false ? '✅ Visible' : '❌ Masqué'}</span>
                  </label>
                </div>
                <div className="form-group">
                  <label style={{ color: '#d4af37' }}>Texte du verset</label>
                  <textarea value={formData.homepage?.verse?.texte || ''} rows="2"
                    onChange={(e) => setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, verse: { ...prev.homepage.verse, texte: e.target.value } } }))}
                    placeholder="Que tout ce que vous faites soit fait avec amour."
                    style={{ background: '#111', color: 'white', border: '1px solid #d4af37' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#d4af37' }}>Référence</label>
                  <input type="text" value={formData.homepage?.verse?.reference || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, verse: { ...prev.homepage.verse, reference: e.target.value } } }))}
                    placeholder="— 1 Corinthiens 16:14"
                    style={{ background: '#111', color: 'white', border: '1px solid #d4af37' }} />
                </div>
              </div>

              {/* ====== SECTION INCLUSIVITÉ ====== */}
              <div style={{ marginTop: '2rem', padding: '2rem', background: '#f0f4ff', borderRadius: '1rem', border: '1px solid #c5d3f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, color: '#1a1a2e' }}>🤝 Message d'Inclusivité</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.homepage?.inclusivity?.actif !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, inclusivity: { ...prev.homepage.inclusivity, actif: e.target.checked } } }))}
                      style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '600' }}>{formData.homepage?.inclusivity?.actif !== false ? '✅ Visible' : '❌ Masqué'}</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Texte</label>
                  <textarea value={formData.homepage?.inclusivity?.texte || ''} rows="3"
                    onChange={(e) => setFormData(prev => ({ ...prev, homepage: { ...prev.homepage, inclusivity: { ...prev.homepage.inclusivity, texte: e.target.value } } }))}
                    placeholder="Que vous soyez chrétien ou non..." />
                </div>
              </div>
            </div>
          )}

          {/* ONGLET CONTACT */}
          {activeTab === 'contact' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '2rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={22} color="#d4af37" /> Informations de contact
              </h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => handleChange('contact', 'email', e.target.value)}
                    placeholder="contact@elijahgod.fr"
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.contact.telephone}
                    onChange={(e) => handleChange('contact', 'telephone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>📍 Adresse</h3>
              
              <div className="form-group">
                <label>Rue</label>
                <input
                  type="text"
                  value={formData.contact.adresse.rue}
                  onChange={(e) => handleNestedChange('contact', 'adresse', 'rue', e.target.value)}
                  placeholder="123 Rue Example"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Code postal</label>
                  <input
                    type="text"
                    value={formData.contact.adresse.codePostal}
                    onChange={(e) => handleNestedChange('contact', 'adresse', 'codePostal', e.target.value)}
                    placeholder="75001"
                  />
                </div>

                <div className="form-group">
                  <label>Ville</label>
                  <input
                    type="text"
                    value={formData.contact.adresse.ville}
                    onChange={(e) => handleNestedChange('contact', 'adresse', 'ville', e.target.value)}
                    placeholder="Paris"
                  />
                </div>

                <div className="form-group">
                  <label>Pays</label>
                  <input
                    type="text"
                    value={formData.contact.adresse.pays}
                    onChange={(e) => handleNestedChange('contact', 'adresse', 'pays', e.target.value)}
                    placeholder="France"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Horaires d'ouverture</label>
                <textarea
                  value={formData.contact.horaires}
                  onChange={(e) => handleChange('contact', 'horaires', e.target.value)}
                  placeholder="Lundi - Vendredi: 9h - 18h&#10;Samedi: Sur rendez-vous"
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* ONGLET RÉSEAUX SOCIAUX */}
          {activeTab === 'reseaux' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '2rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={22} color="#d4af37" /> Réseaux sociaux
              </h2>
              
              <div className="form-group">
                <label>📘 Facebook</label>
                <input
                  type="url"
                  value={formData.reseauxSociaux.facebook}
                  onChange={(e) => handleChange('reseauxSociaux', 'facebook', e.target.value)}
                  placeholder="https://facebook.com/elijahgod"
                />
              </div>

              <div className="form-group">
                <label>📸 Instagram</label>
                <input
                  type="url"
                  value={formData.reseauxSociaux.instagram}
                  onChange={(e) => handleChange('reseauxSociaux', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/elijahgod"
                />
              </div>

              <div className="form-group">
                <label>📹 YouTube</label>
                <input
                  type="url"
                  value={formData.reseauxSociaux.youtube}
                  onChange={(e) => handleChange('reseauxSociaux', 'youtube', e.target.value)}
                  placeholder="https://youtube.com/@elijahgod"
                />
              </div>
            </div>
          )}

          {/* ONGLET MESSAGES */}
          {activeTab === 'messages' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '2rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={22} color="#d4af37" /> Messages du site
              </h2>
              
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>🏠 Page d'accueil</h3>
              
              <div className="form-group">
                <label>Titre principal</label>
                <input
                  type="text"
                  value={formData.messages.accueil.titre}
                  onChange={(e) => handleNestedChange('messages', 'accueil', 'titre', e.target.value)}
                  placeholder="Ex: Bienvenue chez ELIJAH'GOD"
                />
              </div>

              <div className="form-group">
                <label>Sous-titre</label>
                <input
                  type="text"
                  value={formData.messages.accueil.sousTitre}
                  onChange={(e) => handleNestedChange('messages', 'accueil', 'sousTitre', e.target.value)}
                  placeholder="Ex: Servir avec excellence"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.messages.accueil.description}
                  onChange={(e) => handleNestedChange('messages', 'accueil', 'description', e.target.value)}
                  placeholder="Description de votre page d'accueil"
                  rows="4"
                />
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>ℹ️ À propos</h3>
              
              <div className="form-group">
                <label>Texte "À propos"</label>
                <textarea
                  value={formData.messages.apropos}
                  onChange={(e) => handleChange('messages', 'apropos', e.target.value)}
                  placeholder="Présentez votre entreprise, votre équipe, vos valeurs..."
                  rows="6"
                />
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e' }}>👣 Pied de page</h3>
              
              <div className="form-group">
                <label>Message du footer</label>
                <textarea
                  value={formData.messages.piedDePage}
                  onChange={(e) => handleChange('messages', 'piedDePage', e.target.value)}
                  placeholder="© 2026 ELIJAH'GOD - Tous droits réservés"
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* ONGLET APPARENCE */}
          {activeTab === 'site' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '2rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={22} color="#d4af37" /> Apparence du site
              </h2>
              
              <div className="form-row" style={{ alignItems: 'flex-start' }}>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.site.afficherPrix}
                      onChange={(e) => handleChange('site', 'afficherPrix', e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Afficher les prix des prestations
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.site.afficherAvis}
                      onChange={(e) => handleChange('site', 'afficherAvis', e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Afficher les avis clients
                  </label>
                </div>
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Palette size={18} /> Couleurs
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Couleur principale</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.site.couleurPrincipale}
                      onChange={(e) => handleChange('site', 'couleurPrincipale', e.target.value)}
                      style={{ width: '80px', height: '50px', cursor: 'pointer', border: '2px solid #e9ecef', borderRadius: '0.5rem' }}
                    />
                    <input
                      type="text"
                      value={formData.site.couleurPrincipale}
                      onChange={(e) => handleChange('site', 'couleurPrincipale', e.target.value)}
                      placeholder="#d4af37"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Couleur secondaire</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.site.couleurSecondaire}
                      onChange={(e) => handleChange('site', 'couleurSecondaire', e.target.value)}
                      style={{ width: '80px', height: '50px', cursor: 'pointer', border: '2px solid #e9ecef', borderRadius: '0.5rem' }}
                    />
                    <input
                      type="text"
                      value={formData.site.couleurSecondaire}
                      onChange={(e) => handleChange('site', 'couleurSecondaire', e.target.value)}
                      placeholder="#f4e5b8"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET DEVIS */}
          {activeTab === 'devis' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '2rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={22} color="#d4af37" /> Configuration des devis
              </h2>
              
              <div className="form-group">
                <label>Message de confirmation</label>
                <textarea
                  value={formData.devis.messageConfirmation}
                  onChange={(e) => handleChange('devis', 'messageConfirmation', e.target.value)}
                  placeholder="Merci ! Nous avons bien reçu votre demande..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Conditions générales de vente (CGV)</label>
                <textarea
                  value={formData.devis.cgv}
                  onChange={(e) => handleChange('devis', 'cgv', e.target.value)}
                  placeholder="Vos CGV complètes..."
                  rows="10"
                />
              </div>
            </div>
          )}

          {/* ONGLET SEO */}
          {activeTab === 'seo' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '2rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Rocket size={22} color="#d4af37" /> Référencement SEO
              </h2>
              
              <div className="form-group">
                <label>Meta titre</label>
                <input
                  type="text"
                  value={formData.seo.metaTitre}
                  onChange={(e) => handleChange('seo', 'metaTitre', e.target.value)}
                  placeholder="ELIJAH'GOD - Prestations événementielles"
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  Idéalement entre 50-60 caractères
                </small>
              </div>

              <div className="form-group">
                <label>Meta description</label>
                <textarea
                  value={formData.seo.metaDescription}
                  onChange={(e) => handleChange('seo', 'metaDescription', e.target.value)}
                  placeholder="Description pour les moteurs de recherche..."
                  rows="3"
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  Idéalement entre 150-160 caractères
                </small>
              </div>

              <div className="form-group">
                <label>Mots-clés</label>
                <input
                  type="text"
                  value={formData.seo.motsCles.join(', ')}
                  onChange={(e) => handleChange('seo', 'motsCles', e.target.value.split(',').map(k => k.trim()))}
                  placeholder="DJ, sonorisation, éclairage, événementiel"
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  Séparez les mots-clés par des virgules
                </small>
              </div>
            </div>
          )}

          {/* ONGLET À PROPOS */}
          {activeTab === 'aPropos' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '0.5rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={22} color="#d4af37" /> Page À propos
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Personnalisez votre présentation, votre histoire et vos valeurs</p>

              {/* --- HERO --- */}
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
                <h3 style={{ color: '#1a1a2e', marginBottom: '1rem', fontSize: '1rem' }}>🖼️ Section Hero</h3>
                <div className="form-group">
                  <label>Titre (votre prénom / nom)</label>
                  <input type="text" value={formData.aPropos.hero.titre}
                    onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, hero: { ...prev.aPropos.hero, titre: e.target.value } } }))}
                    placeholder="Bienvenue, je suis Randy ODOUNGA" />
                </div>
                <div className="form-group">
                  <label>Sur-titre (rôle / fonction)</label>
                  <input type="text" value={formData.aPropos.hero.surTitre}
                    onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, hero: { ...prev.aPropos.hero, surTitre: e.target.value } } }))}
                    placeholder="Fondateur & Directeur artistique" />
                </div>
                <div className="form-group">
                  <label>Citation inspirante</label>
                  <input type="text" value={formData.aPropos.hero.citation}
                    onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, hero: { ...prev.aPropos.hero, citation: e.target.value } } }))}
                    placeholder="Servir avec excellence, inspiré par la foi." />
                </div>
                {/* Upload photo de profil */}
                <div className="form-group">
                  <label>📷 Photo de profil</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Aperçu */}
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #d4af37', flexShrink: 0, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                      {formData.aPropos.hero.photo
                        ? <img src={formData.aPropos.hero.photo.startsWith('http') ? formData.aPropos.hero.photo : `${API_URL}${formData.aPropos.hero.photo}`} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '🎧'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="file" accept="image/*" id="upload-photo-profil" style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append('photo', file);
                          try {
                            const { data } = await axios.post(`${API_URL}/api/settings/apropos/upload-photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                            if (data.success) {
                              setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, hero: { ...prev.aPropos.hero, photo: data.url } } }));
                              setMessage({ type: 'success', text: '✅ Photo de profil mise à jour !' });
                            }
                          } catch { setMessage({ type: 'error', text: '❌ Erreur lors de l\'upload' }); }
                        }} />
                      <label htmlFor="upload-photo-profil" style={{ display: 'inline-block', background: '#d4af37', color: '#1a1a2e', padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                        📁 Choisir une photo
                      </label>
                      <p style={{ color: '#666', fontSize: '0.82rem', marginTop: '0.4rem' }}>JPG, PNG ou WEBP — max 10 Mo</p>
                      {formData.aPropos.hero.photo && (
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, hero: { ...prev.aPropos.hero, photo: '' } } }))}
                          style={{ marginTop: '0.3rem', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem' }}>🗑️ Supprimer la photo</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- PRÉSENTATION --- */}
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#1a1a2e', fontSize: '1rem', margin:
                0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} /> Qui suis-je ?
              </h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={formData.aPropos.presentation.actif}
                      onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, presentation: { ...prev.aPropos.presentation, actif: e.target.checked } } }))} />
                    Afficher
                  </label>
                </div>
                <div className="form-group">
                  <label>Titre de section</label>
                  <input type="text" value={formData.aPropos.presentation.titre}
                    onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, presentation: { ...prev.aPropos.presentation, titre: e.target.value } } }))}
                    placeholder="Qui suis-je ?" />
                </div>
                <div className="form-group">
                  <label>Votre présentation (texte libre)</label>
                  <textarea value={formData.aPropos.presentation.contenu} rows="5"
                    onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, presentation: { ...prev.aPropos.presentation, contenu: e.target.value } } }))}
                    placeholder="Parlez de vous, votre background, votre passion..." />
                  <small style={{ color: '#666' }}>Sautez une ligne pour créer un nouveau paragraphe</small>
                </div>
                {/* Photo section présentation */}
                <div className="form-group">
                  <label>📷 Photo (affichée à droite du texte)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {formData.aPropos.presentation?.photo && (
                      <div style={{ position: 'relative' }}>
                        <img src={formData.aPropos.presentation.photo.startsWith('http') ? formData.aPropos.presentation.photo : `${API_URL}${formData.aPropos.presentation.photo}`} alt="Présentation" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #d4af37' }} />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, presentation: { ...prev.aPropos.presentation, photo: '' } } }))}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    )}
                    <div>
                      <input type="file" accept="image/*" id="upload-photo-presentation" style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0]; if (!file) return;
                          const fd = new FormData(); fd.append('photo', file);
                          try {
                            const { data } = await axios.post(`${API_URL}/api/settings/apropos/upload-photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                            if (data.success) { setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, presentation: { ...prev.aPropos.presentation, photo: data.url } } })); setMessage({ type: 'success', text: '✅ Photo mise à jour !' }); }
                          } catch { setMessage({ type: 'error', text: '❌ Erreur upload' }); }
                        }} />
                      <label htmlFor="upload-photo-presentation" style={{ display: 'inline-block', background: '#d4af37', color: '#1a1a2e', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                        📁 Choisir une photo
                      </label>
                      <p style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.3rem' }}>Si rien sélectionné, la section s'affiche sans photo</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- MOTIVATION --- */}
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#1a1a2e', fontSize: '1rem', margin: 0 }}>🔥 Ce qui m'a poussé</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={formData.aPropos.motivation.actif}
                      onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, motivation: { ...prev.aPropos.motivation, actif: e.target.checked } } }))} />
                    Afficher
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Icône</label>
                    <input type="text" value={formData.aPropos.motivation.icone}
                      onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, motivation: { ...prev.aPropos.motivation, icone: e.target.value } } }))}
                      placeholder="🔥" style={{ fontSize: '1.5rem', textAlign: 'center' }} />
                  </div>
                  <div className="form-group">
                    <label>Titre</label>
                    <input type="text" value={formData.aPropos.motivation.titre}
                      onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, motivation: { ...prev.aPropos.motivation, titre: e.target.value } } }))}
                      placeholder="Ce qui m'a poussé" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Votre histoire / déclencheur</label>
                  <textarea value={formData.aPropos.motivation.contenu} rows="5"
                    onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, motivation: { ...prev.aPropos.motivation, contenu: e.target.value } } }))}
                    placeholder="Racontez l'événement ou la conviction qui vous a poussé à créer votre activité..." />
                </div>
                {/* Photo section motivation */}
                <div className="form-group">
                  <label>📷 Photo (affichée à gauche du texte)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {formData.aPropos.motivation?.photo && (
                      <div style={{ position: 'relative' }}>
                        <img src={formData.aPropos.motivation.photo.startsWith('http') ? formData.aPropos.motivation.photo : `${API_URL}${formData.aPropos.motivation.photo}`} alt="Motivation" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #d4af37' }} />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, motivation: { ...prev.aPropos.motivation, photo: '' } } }))}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    )}
                    <div>
                      <input type="file" accept="image/*" id="upload-photo-motivation" style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0]; if (!file) return;
                          const fd = new FormData(); fd.append('photo', file);
                          try {
                            const { data } = await axios.post(`${API_URL}/api/settings/apropos/upload-photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                            if (data.success) { setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, motivation: { ...prev.aPropos.motivation, photo: data.url } } })); setMessage({ type: 'success', text: '✅ Photo mise à jour !' }); }
                          } catch { setMessage({ type: 'error', text: '❌ Erreur upload' }); }
                        }} />
                      <label htmlFor="upload-photo-motivation" style={{ display: 'inline-block', background: '#d4af37', color: '#1a1a2e', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                        📁 Choisir une photo
                      </label>
                      <p style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.3rem' }}>Si rien sélectionné, la section s'affiche sans photo</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- MISSION --- */}
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#1a1a2e', fontSize: '1rem', margin: 0 }}>🎯 Ce que je donne</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={formData.aPropos.mission.actif}
                      onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, mission: { ...prev.aPropos.mission, actif: e.target.checked } } }))} />
                    Afficher
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Icône</label>
                    <input type="text" value={formData.aPropos.mission.icone}
                      onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, mission: { ...prev.aPropos.mission, icone: e.target.value } } }))}
                      placeholder="🎯" style={{ fontSize: '1.5rem', textAlign: 'center' }} />
                  </div>
                  <div className="form-group">
                    <label>Titre</label>
                    <input type="text" value={formData.aPropos.mission.titre}
                      onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, mission: { ...prev.aPropos.mission, titre: e.target.value } } }))}
                      placeholder="Ce que je donne à travers mes prestations" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description de votre mission / valeur ajoutée</label>
                  <textarea value={formData.aPropos.mission.contenu} rows="5"
                    onChange={(e) => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, mission: { ...prev.aPropos.mission, contenu: e.target.value } } }))}
                    placeholder="Ce que vos clients reçoivent au-delà du service technique..." />
                </div>
                {/* Photo section mission */}
                <div className="form-group">
                  <label>📷 Photo (affichée à droite du texte)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {formData.aPropos.mission?.photo && (
                      <div style={{ position: 'relative' }}>
                        <img src={formData.aPropos.mission.photo.startsWith('http') ? formData.aPropos.mission.photo : `${API_URL}${formData.aPropos.mission.photo}`} alt="Mission" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #d4af37' }} />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, mission: { ...prev.aPropos.mission, photo: '' } } }))}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    )}
                    <div>
                      <input type="file" accept="image/*" id="upload-photo-mission" style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0]; if (!file) return;
                          const fd = new FormData(); fd.append('photo', file);
                          try {
                            const { data } = await axios.post(`${API_URL}/api/settings/apropos/upload-photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                            if (data.success) { setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, mission: { ...prev.aPropos.mission, photo: data.url } } })); setMessage({ type: 'success', text: '✅ Photo mise à jour !' }); }
                          } catch { setMessage({ type: 'error', text: '❌ Erreur upload' }); }
                        }} />
                      <label htmlFor="upload-photo-mission" style={{ display: 'inline-block', background: '#d4af37', color: '#1a1a2e', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                        📁 Choisir une photo
                      </label>
                      <p style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.3rem' }}>Si rien sélectionné, la section s'affiche sans photo</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- VALEURS --- */}
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
                <h3 style={{ color: '#1a1a2e', marginBottom: '1rem', fontSize: '1rem' }}>💎 Mes valeurs / engagements</h3>
                {formData.aPropos.valeurs.map((valeur, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 2fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem', background: '#fff', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <input type="text" value={valeur.icone} placeholder="🙏" style={{ textAlign: 'center', fontSize: '1.4rem', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '6px' }}
                      onChange={(e) => { const v = [...formData.aPropos.valeurs]; v[idx] = { ...v[idx], icone: e.target.value }; setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, valeurs: v } })); }} />
                    <input type="text" value={valeur.titre} placeholder="Titre" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                      onChange={(e) => { const v = [...formData.aPropos.valeurs]; v[idx] = { ...v[idx], titre: e.target.value }; setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, valeurs: v } })); }} />
                    <input type="text" value={valeur.description} placeholder="Description" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                      onChange={(e) => { const v = [...formData.aPropos.valeurs]; v[idx] = { ...v[idx], description: e.target.value }; setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, valeurs: v } })); }} />
                    <button onClick={() => { const v = formData.aPropos.valeurs.filter((_, i) => i !== idx); setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, valeurs: v } })); }}
                      style={{ padding: '0.4rem 0.7rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, valeurs: [...prev.aPropos.valeurs, { icone: '⭐', titre: '', description: '' }] } }))}
                  style={{ background: '#d4af37', color: '#1a1a2e', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                  + Ajouter une valeur
                </button>
              </div>

              {/* --- PARCOURS --- */}
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e0e0e0' }}>
                <h3 style={{ color: '#1a1a2e', marginBottom: '1rem', fontSize: '1rem' }}>🗓️ Mon parcours (timeline)</h3>
                {formData.aPropos.parcours.map((etape, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem', background: '#fff', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <input type="text" value={etape.annee} placeholder="2024" style={{ textAlign: 'center', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem' }}
                      onChange={(e) => { const p = [...formData.aPropos.parcours]; p[idx] = { ...p[idx], annee: e.target.value }; setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, parcours: p } })); }} />
                    <input type="text" value={etape.titre} placeholder="Titre étape" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                      onChange={(e) => { const p = [...formData.aPropos.parcours]; p[idx] = { ...p[idx], titre: e.target.value }; setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, parcours: p } })); }} />
                    <input type="text" value={etape.description} placeholder="Description" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                      onChange={(e) => { const p = [...formData.aPropos.parcours]; p[idx] = { ...p[idx], description: e.target.value }; setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, parcours: p } })); }} />
                    <button onClick={() => { const p = formData.aPropos.parcours.filter((_, i) => i !== idx); setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, parcours: p } })); }}
                      style={{ padding: '0.4rem 0.7rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setFormData(prev => ({ ...prev, aPropos: { ...prev.aPropos, parcours: [...prev.aPropos.parcours, { annee: '2025', titre: '', description: '' }] } }))}
                  style={{ background: '#d4af37', color: '#1a1a2e', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                  + Ajouter une étape
                </button>
              </div>

              {/* --- GALERIE RÉALISATIONS --- */}
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e0e0e0' }}>
                <h3 style={{ color: '#1a1a2e', marginBottom: '0.5rem', fontSize: '1rem' }}>🖼️ Galerie de réalisations</h3>
                <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '1.2rem' }}>Ces photos illustrent vos événements passés. Elles s'affichent sur la page À propos.</p>

                {/* Zone upload */}
                <div style={{ border: '2px dashed #d4af37', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem', background: '#fffdf5' }}>
                  <input type="file" accept="image/*" multiple id="upload-galerie" style={{ display: 'none' }}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (!files.length) return;
                      const fd = new FormData();
                      files.forEach(f => fd.append('images', f));
                      try {
                        const { data } = await axios.post(`${API_URL}/api/settings/apropos/galerie`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        if (data.success) {
                          window.location.reload(); // Recharger pour afficher les nouvelles images
                        }
                      } catch { setMessage({ type: 'error', text: '❌ Erreur lors de l\'upload des images' }); }
                      e.target.value = '';
                    }} />
                  <label htmlFor="upload-galerie" style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                    <p style={{ margin: 0, fontWeight: '600', color: '#1a1a2e' }}>Cliquer pour ajouter des photos</p>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#888' }}>JPG, PNG, WEBP — plusieurs à la fois — max 20 Mo chacune</p>
                  </label>
                </div>

                {/* Grille des images existantes */}
                {(settings?.aPropos?.galerie?.length > 0) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.8rem' }}>
                    {settings.aPropos.galerie.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', background: '#fff' }}>
                        <img src={img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`} alt={img.legende || `Réalisation ${idx + 1}`}
                          style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: '0.4rem' }}>
                          <input type="text" defaultValue={img.legende} placeholder="Légende..."
                            style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.78rem', boxSizing: 'border-box' }}
                            onBlur={async (e) => {
                              try { await axios.put(`${API_URL}/api/settings/apropos/galerie/legende`, { index: idx, legende: e.target.value }); }
                              catch { /* silencieux */ }
                            }} />
                        </div>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Supprimer cette image ?')) return;
                            try {
                              await axios.delete(`${API_URL}/api/settings/apropos/galerie/${idx}`);
                              window.location.reload();
                            } catch { setMessage({ type: 'error', text: '❌ Erreur suppression' }); }
                          }}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>Aucune photo pour l'instant — uploadez vos premières réalisations !</p>
                )}
              </div>
            </div>
          )}

          {/* ONGLET AUTRES PAGES */}
          {/* ONGLET CATÉGORIES PRESTATAIRES */}
          {activeTab === 'categories' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '0.5rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <List size={22} color="#d4af37" /> Catégories de Prestataires
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Gérez les catégories disponibles lors de l'inscription des prestataires</p>

              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e0e5ff', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#1a1a2e', marginBottom: '1rem' }}>Catégories actuelles ({formData.categoriesPrestataires.length})</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {formData.categoriesPrestataires.map((cat, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      background: '#f4f0ff', border: '1px solid #c7bfff',
                      borderRadius: '20px', padding: '4px 12px', fontSize: '0.9rem',
                      color: '#3730a3'
                    }}>
                      {cat}
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          categoriesPrestataires: prev.categoriesPrestataires.filter((_, idx) => idx !== i)
                        }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: '700', fontSize: '0.9rem', padding: '0 2px', lineHeight: 1 }}
                        title="Supprimer"
                      >✕</button>
                    </span>
                  ))}
                </div>

                <h4 style={{ color: '#444', marginBottom: '0.75rem' }}>Ajouter une catégorie</h4>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    id="new-cat-input"
                    type="text"
                    placeholder="Ex : Musicien, Fleuriste…"
                    style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e0e5ff', fontSize: '0.9rem' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.target.value.trim();
                        if (val && !formData.categoriesPrestataires.includes(val)) {
                          setFormData(prev => ({ ...prev, categoriesPrestataires: [...prev.categoriesPrestataires, val] }));
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg,#d4af37,#f4e5b8)', color: '#1a1a2e', fontWeight: 700 }}
                    onClick={() => {
                      const input = document.getElementById('new-cat-input');
                      const val = input.value.trim();
                      if (val && !formData.categoriesPrestataires.includes(val)) {
                        setFormData(prev => ({ ...prev, categoriesPrestataires: [...prev.categoriesPrestataires, val] }));
                        input.value = '';
                      }
                    }}
                  >+ Ajouter</button>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>Appuyez sur Entrée ou cliquez sur Ajouter. N'oubliez pas d'enregistrer.</p>
              </div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="tab-content">
              <h2 style={{ marginBottom: '0.5rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileStack size={22} color="#d4af37" /> Paramétrage des Autres Pages
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Personnalisez le hero, les couleurs et les animations de chaque page</p>

              {[
                { key: 'prestataires', emoji: '🤝', label: 'Prestataires', path: '/prestataires' },
                { key: 'prestations', emoji: '🎬', label: 'Prestations', path: '/prestations' },
                { key: 'contact', emoji: '📞', label: 'Contact', path: '/contact' },
                { key: 'devis', emoji: '📝', label: 'Devis', path: '/devis' }
              ].map(({ key, emoji, label, path }) => {
                const p = formData.pages?.[key];
                if (!p) return null;
                return (
                  <div key={key} style={{
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                    padding: '2rem',
                    borderRadius: '1rem',
                    marginBottom: '2rem',
                    border: '2px solid #e0e5ff'
                  }}>
                    {/* En-tête carte */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ color: '#1a1a2e', fontSize: '1.2rem', margin: 0 }}>
                        {emoji} Page {label}
                        <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: '400', marginLeft: '0.5rem' }}>{path}</span>
                      </h3>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={p.actif}
                          onChange={(e) => handlePageActiveChange(key, e.target.checked)}
                        />
                        <span style={{ fontSize: '0.9rem', color: p.actif ? '#27ae60' : '#e74c3c' }}>
                          {p.actif ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </label>
                    </div>

                    {/* Textes hero */}
                    <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div className="form-group">
                        <label>📝 Titre Hero</label>
                        <input
                          type="text"
                          value={p.hero.titre}
                          onChange={(e) => handlePageHeroChange(key, 'titre', e.target.value)}
                          placeholder={`Titre de la page ${label}`}
                        />
                      </div>
                      <div className="form-group">
                        <label>💬 Sous-titre Hero</label>
                        <input
                          type="text"
                          value={p.hero.sousTitre}
                          onChange={(e) => handlePageHeroChange(key, 'sousTitre', e.target.value)}
                          placeholder="Sous-titre descriptif"
                        />
                      </div>
                    </div>

                    {/* Couleurs */}
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '0.8rem', border: '1px solid #e0e5ff' }}>
                      <h4 style={{ color: '#d4af37', marginBottom: '1rem' }}>🎨 Couleurs du Hero</h4>
                      <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="form-group">
                          <label>Couleur Texte</label>
                          <input
                            type="color"
                            value={p.hero.couleurs.texte}
                            onChange={(e) => handlePageHeroColorChange(key, 'texte', e.target.value)}
                            style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={p.hero.couleurs.texte}
                            onChange={(e) => handlePageHeroColorChange(key, 'texte', e.target.value)}
                            placeholder="#ffffff"
                            style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Arrière-plan</label>
                          <input
                            type="color"
                            value={p.hero.couleurs.arrierePlan}
                            onChange={(e) => handlePageHeroColorChange(key, 'arrierePlan', e.target.value)}
                            style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={p.hero.couleurs.arrierePlan}
                            onChange={(e) => handlePageHeroColorChange(key, 'arrierePlan', e.target.value)}
                            placeholder="#1a1a2e"
                            style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Overlay (rgba)</label>
                          <input
                            type="text"
                            value={p.hero.couleurs.overlay}
                            onChange={(e) => handlePageHeroColorChange(key, 'overlay', e.target.value)}
                            placeholder="rgba(0,0,0,0.6)"
                            style={{ padding: '0.8rem', fontSize: '0.9rem', marginTop: '48px' }}
                          />
                          <small style={{ color: '#888' }}>Format: rgba(r,g,b,opacité)</small>
                        </div>
                      </div>
                    </div>

                    {/* Animation */}
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '0.8rem', border: '1px solid #e0e5ff' }}>
                      <h4 style={{ color: '#7c3aed', marginBottom: '1rem' }}>✨ Animation d'Apparition</h4>
                      <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                        <div className="form-group">
                          <label>Type d'Animation</label>
                          <select
                            value={p.hero.animation.type}
                            onChange={(e) => handlePageHeroAnimationChange(key, 'type', e.target.value)}
                            style={{ padding: '0.8rem', fontSize: '1rem' }}
                          >
                            <option value="none">⛔ Aucune animation</option>
                            <option value="fade-in">✨ Fondu (Fade In)</option>
                            <option value="slide-in-left">⬅️ Glissement gauche</option>
                            <option value="slide-in-right">➡️ Glissement droite</option>
                            <option value="slide-in-up">⬆️ Glissement bas → haut</option>
                            <option value="slide-in-down">⬇️ Glissement haut → bas</option>
                            <option value="zoom-in">🔍 Zoom avant</option>
                            <option value="flip-in">🔄 Rotation 3D</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Durée (ms)</label>
                          <input
                            type="number"
                            value={p.hero.animation.duration}
                            onChange={(e) => handlePageHeroAnimationChange(key, 'duration', parseInt(e.target.value))}
                            min="100" max="3000" step="100"
                          />
                        </div>
                        <div className="form-group">
                          <label>Délai (ms)</label>
                          <input
                            type="number"
                            value={p.hero.animation.delay}
                            onChange={(e) => handlePageHeroAnimationChange(key, 'delay', parseInt(e.target.value))}
                            min="0" max="2000" step="100"
                          />
                        </div>
                      </div>
                      {p.hero.animation.type !== 'none' && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '0.6rem 1rem',
                          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(167,139,250,0.1))',
                          borderRadius: '0.5rem',
                          display: 'inline-block'
                        }}>
                          <span style={{ color: '#7c3aed', fontWeight: '600', fontSize: '0.9rem' }}>
                            🎭 Animation active : <strong>{p.hero.animation.type}</strong> • {p.hero.animation.duration}ms • délai {p.hero.animation.delay}ms
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Sections animées (uniquement prestataires et prestations) */}
                    {(key === 'prestataires' || key === 'prestations') && p.sections && (
                      <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #fff8f0, #fff3e0)', borderRadius: '0.8rem', border: '2px solid #f39c12' }}>
                        <h4 style={{ color: '#e67e22', marginBottom: '1.2rem' }}>🎬 Animations des Sections de la Page</h4>
                        {[
                          { sKey: 'filtres', emoji: '🔍', label: 'Barre de Filtres' },
                          { sKey: 'grille', emoji: '🃏', label: 'Grille de Cartes' },
                          { sKey: 'cta', emoji: '🚀', label: 'Section CTA (appel à l\'action)' }
                        ].map(({ sKey, emoji, label }) => {
                          const sec = p.sections?.[sKey];
                          if (!sec) return null;
                          return (
                            <div key={sKey} style={{ background: '#fff', padding: '1rem 1.2rem', borderRadius: '0.6rem', marginBottom: '0.8rem', border: '1px solid #fde8c8' }}>
                              <p style={{ fontWeight: '700', color: '#e67e22', marginBottom: '0.8rem', fontSize: '0.95rem' }}>{emoji} {label}</p>
                              <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                                <div className="form-group">
                                  <label style={{ fontSize: '0.85rem' }}>Animation</label>
                                  <select
                                    value={sec.animation?.type || 'none'}
                                    onChange={(e) => handlePageSectionAnimChange(key, sKey, 'type', e.target.value)}
                                    style={{ padding: '0.6rem', fontSize: '0.9rem' }}
                                  >
                                    <option value="none">⛔ Aucune</option>
                                    <option value="fade-in">✨ Fondu</option>
                                    <option value="slide-in-left">⬅️ Gauche</option>
                                    <option value="slide-in-right">➡️ Droite</option>
                                    <option value="slide-in-up">⬆️ Bas → Haut</option>
                                    <option value="slide-in-down">⬇️ Haut → Bas</option>
                                    <option value="zoom-in">🔍 Zoom</option>
                                    <option value="flip-in">🔄 Rotation 3D</option>
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label style={{ fontSize: '0.85rem' }}>Durée (ms)</label>
                                  <input
                                    type="number"
                                    value={sec.animation?.duration || 600}
                                    onChange={(e) => handlePageSectionAnimChange(key, sKey, 'duration', parseInt(e.target.value))}
                                    min="100" max="3000" step="100"
                                    style={{ padding: '0.6rem' }}
                                  />
                                </div>
                                <div className="form-group">
                                  <label style={{ fontSize: '0.85rem' }}>Délai (ms)</label>
                                  <input
                                    type="number"
                                    value={sec.animation?.delay || 0}
                                    onChange={(e) => handlePageSectionAnimChange(key, sKey, 'delay', parseInt(e.target.value))}
                                    min="0" max="2000" step="50"
                                    style={{ padding: '0.6rem' }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Boutons d'action */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          marginTop: '2rem'
        }}>
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="btn btn-secondary"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{
              background: saving 
                ? '#ccc' 
                : 'linear-gradient(135deg, #d4af37 0%, #f4e5b8 100%)',
              padding: '1rem 3rem',
              fontSize: '1.1rem'
            }}
          >
            {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les paramètres'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParametresPage;
