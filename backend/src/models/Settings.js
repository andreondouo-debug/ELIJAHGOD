const mongoose = require('mongoose');

/**
 * ⚙️ MODÈLE PARAMÈTRES
 * Gestion centralisée de tous les paramètres du site
 */
const settingsSchema = new mongoose.Schema({
  // Informations de l'entreprise
  entreprise: {
    nom: {
      type: String,
      default: "ELIJAH'GOD"
    },
    slogan: {
      type: String,
      default: "Prestations événementielles de qualité"
    },
    description: {
      type: String,
      default: "Spécialiste en sonorisation, DJ et animation pour tous vos événements"
    },
    logo: {
      type: String,
      default: "/images/logo.png"
    },
    banniere: {
      type: String,
      default: "https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
    }
  },
  
  // Contact
  contact: {
    email: {
      type: String,
      default: "contact@elijahgod.com"
    },
    telephone: {
      type: String,
      default: "+33 X XX XX XX XX"
    },
    adresse: {
      rue: String,
      codePostal: String,
      ville: String,
      pays: { type: String, default: "France" }
    },
    horaires: {
      type: String,
      default: "Lundi - Samedi : 9h - 19h"
    }
  },
  
  // Réseaux sociaux
  reseauxSociaux: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    tiktok: String,
    linkedin: String
  },
  
  // Paramètres de devis
  devis: {
    validiteJours: {
      type: Number,
      default: 30,
      min: 7,
      max: 90
    },
    acompteMinimum: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
      comment: "Pourcentage"
    },
    delaiAnnulationJours: {
      type: Number,
      default: 7,
      min: 0,
      max: 30
    },
    messageConfirmation: {
      type: String,
      default: "Merci pour votre demande ! Nous vous répondons sous 24-48h."
    },
    cgv: {
      type: String,
      default: "Conditions générales de vente à compléter..."
    }
  },
  
  // Tarification
  tarifs: {
    fraisDeplacementParKm: {
      type: Number,
      default: 0.5,
      min: 0
    },
    distanceGratuiteKm: {
      type: Number,
      default: 50,
      min: 0
    },
    supplementWeekendPourcentage: {
      type: Number,
      default: 20,
      min: 0,
      max: 100
    },
    supplementNuitPourcentage: {
      type: Number,
      default: 30,
      min: 0,
      max: 100
    },
    tarifHoraire: {
      type: Number,
      default: 80,
      min: 0
    }
  },
  
  // Configuration du carousel (Hero Section)
  carousel: {
    titre: {
      type: String,
      default: "ELIJAH'GOD"
    },
    tagline: {
      type: String,
      default: "Servir avec excellence, inspiré par la foi."
    },
    boutonPrincipal: {
      texte: {
        type: String,
        default: "✨ Créons votre devis"
      },
      lien: {
        type: String,
        default: "/devis"
      }
    },
    boutonSecondaire: {
      texte: {
        type: String,
        default: "Découvrir nos services"
      },
      lien: {
        type: String,
        default: "/prestations"
      }
    },
    disposition: {
      type: String,
      enum: ['horizontal', 'vertical', 'centre'],
      default: 'centre'
    },
    alignement: {
      type: String,
      enum: ['gauche', 'centre', 'droite'],
      default: 'centre'
    },
    couleurs: {
      texte: {
        type: String,
        default: '#ffffff'
      },
      arrierePlan: {
        type: String,
        default: 'transparent'
      },
      overlay: {
        type: String,
        default: 'rgba(0, 0, 0, 0.5)'
      }
    }
  },

  // Configuration des sections de la page d'accueil
  homepage: {
    sections: [{
      id: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['mission', 'team', 'values', 'cta', 'custom'],
        required: true
      },
      titre: String,
      sousTitre: String,
      contenu: String,
      disposition: {
        type: String,
        enum: ['horizontal', 'vertical', 'grille', 'centre'],
        default: 'vertical'
      },
      ordre: {
        type: Number,
        default: 0
      },
      actif: {
        type: Boolean,
        default: true
      },
      couleurs: {
        texte: {
          type: String,
          default: '#1a1a1a'
        },
        arrierePlan: {
          type: String,
          default: '#ffffff'
        },
        titre: {
          type: String,
          default: '#1a1a1a'
        }
      },
      animation: {
        type: {
          type: String,
          enum: ['none', 'fade-in', 'slide-in-left', 'slide-in-right', 'slide-in-up', 'slide-in-down', 'zoom-in', 'flip-in'],
          default: 'fade-in'
        },
        delay: {
          type: Number,
          default: 0,
          min: 0,
          max: 5000
        },
        duration: {
          type: Number,
          default: 800,
          min: 100,
          max: 3000
        },
        easing: {
          type: String,
          enum: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'],
          default: 'ease-out'
        }
      },
      // Pour sections personnalisées
      elements: [{
        type: {
          type: String,
          enum: ['texte', 'image', 'bouton', 'carte']
        },
        contenu: String,
        lien: String,
        icon: String,
        ordre: Number
      }]
    }],
    sectionsParDefaut: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        mission: {
          titre: "Bienvenue chez ELIJAH'GOD",
          intro: "Une micro‑entreprise dédiée à la création d'événements harmonieux, professionnels et porteurs de sens.",
          texte: "Ici, nous croyons que chaque célébration — mariage, conférence, soirée, culte ou événement familial — est une occasion d'apporter de la joie, de la paix et de la lumière."
        },
        team: {
          titre: "Notre Équipe de Prestataires",
          sousTitre: "Je travaille avec une équipe interne de prestataires talentueux, tous engagés, sérieux et passionnés."
        },
        values: {
          titre: "Chez ELIJAH'GOD, nous cherchons à offrir plus qu'un service",
          sousTitre: "Nous apportons une expérience."
        },
        cta: {
          titre: "Avec ELIJAH'GOD,",
          sousTitre: "chaque événement devient un moment mémorable.",
          texteBouton: "✨ Créons votre devis personnalisé"
        }
      }
    }
  },

  // ============================
  // CONFIGURATION DES PAGES
  // ============================
  pages: {
    prestataires: {
      hero: {
        titre: { type: String, default: 'Nos Prestataires' },
        sousTitre: { type: String, default: 'Des talents dédiés à la réussite de votre événement' },
        couleurs: {
          texte: { type: String, default: '#ffffff' },
          arrierePlan: { type: String, default: '#1a1a2e' },
          overlay: { type: String, default: 'rgba(0,0,0,0.6)' }
        },
        animation: {
          type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'fade-in' },
          duration: { type: Number, default: 800 },
          delay: { type: Number, default: 0 }
        }
      },
      sections: {
        filtres: {
          animation: {
            type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'slide-in-up' },
            duration: { type: Number, default: 700 },
            delay: { type: Number, default: 100 }
          }
        },
        grille: {
          animation: {
            type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'zoom-in' },
            duration: { type: Number, default: 600 },
            delay: { type: Number, default: 150 }
          }
        },
        cta: {
          animation: {
            type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'fade-in' },
            duration: { type: Number, default: 800 },
            delay: { type: Number, default: 0 }
          }
        }
      },
      actif: { type: Boolean, default: true }
    },
    prestations: {
      hero: {
        titre: { type: String, default: 'Nos Prestations' },
        sousTitre: { type: String, default: 'Des formules sur-mesure pour chaque événement' },
        couleurs: {
          texte: { type: String, default: '#ffffff' },
          arrierePlan: { type: String, default: '#16213e' },
          overlay: { type: String, default: 'rgba(0,0,0,0.6)' }
        },
        animation: {
          type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'fade-in' },
          duration: { type: Number, default: 800 },
          delay: { type: Number, default: 0 }
        }
      },
      sections: {
        filtres: {
          animation: {
            type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'slide-in-up' },
            duration: { type: Number, default: 700 },
            delay: { type: Number, default: 100 }
          }
        },
        grille: {
          animation: {
            type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'zoom-in' },
            duration: { type: Number, default: 600 },
            delay: { type: Number, default: 150 }
          }
        },
        cta: {
          animation: {
            type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'fade-in' },
            duration: { type: Number, default: 800 },
            delay: { type: Number, default: 0 }
          }
        }
      },
      actif: { type: Boolean, default: true }
    },
    contact: {
      hero: {
        titre: { type: String, default: 'Contactez-nous' },
        sousTitre: { type: String, default: 'Nous sommes à votre écoute' },
        couleurs: {
          texte: { type: String, default: '#ffffff' },
          arrierePlan: { type: String, default: '#0f0f23' },
          overlay: { type: String, default: 'rgba(0,0,0,0.5)' }
        },
        animation: {
          type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'slide-in-up' },
          duration: { type: Number, default: 800 },
          delay: { type: Number, default: 0 }
        }
      },
      actif: { type: Boolean, default: true }
    },
    devis: {
      hero: {
        titre: { type: String, default: 'Votre Devis Personnalisé' },
        sousTitre: { type: String, default: 'Décrivez votre projet et recevez une offre sur-mesure' },
        couleurs: {
          texte: { type: String, default: '#ffffff' },
          arrierePlan: { type: String, default: '#1a0a2e' },
          overlay: { type: String, default: 'rgba(0,0,0,0.55)' }
        },
        animation: {
          type: { type: String, enum: ['none','fade-in','slide-in-left','slide-in-right','slide-in-up','slide-in-down','zoom-in','flip-in'], default: 'zoom-in' },
          duration: { type: Number, default: 800 },
          delay: { type: Number, default: 0 }
        }
      },
      actif: { type: Boolean, default: true }
    }
  },

  // Messages personnalisables
  messages: {
    accueil: {
      titre: {
        type: String,
        default: "Bienvenue chez ELIJAH'GOD"
      },
      sousTitre: {
        type: String,
        default: "Votre spécialiste DJ et sonorisation"
      },
      description: {
        type: String,
        default: "Des prestations de qualité pour vos mariages, anniversaires et événements"
      }
    },
    apropos: {
      type: String,
      default: "Présentation de l'entreprise à personnaliser..."
    },
    piedDePage: {
      type: String,
      default: "© 2026 ELIJAH'GOD - Tous droits réservés"
    }
  },
  
  // Configuration email
  emailConfig: {
    emailAdmin: {
      type: String,
      default: "admin@elijahgod.com"
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    emailSignature: {
      type: String,
      default: "L'équipe ELIJAH'GOD"
    }
  },
  
  // Paramètres de planning
  planning: {
    heureOuvertureDefaut: {
      type: String,
      default: "09:00"
    },
    heureFermetureDefaut: {
      type: String,
      default: "02:00"
    },
    joursNonTravailles: [{
      type: String,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    }],
    delaiReservationMinJours: {
      type: Number,
      default: 7,
      min: 0
    }
  },
  
  // Paramètres du site
  site: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    messageMaintenace: {
      type: String,
      default: "Site en maintenance. Retour bientôt !"
    },
    afficherPrix: {
      type: Boolean,
      default: true
    },
    afficherAvis: {
      type: Boolean,
      default: true
    },
    couleurPrincipale: {
      type: String,
      default: "#1a1a2e"
    },
    couleurSecondaire: {
      type: String,
      default: "#16213e"
    },
    couleurAccent: {
      type: String,
      default: "#0f3460"
    }
  },
  
  // Articles supplémentaires pour devis (paramétrables)
  articlesSupplémentaires: [{
    id: {
      type: String,
      required: true
    },
    nom: {
      type: String,
      required: true
    },
    description: String,
    icon: {
      type: String,
      default: '✨'
    },
    prixBase: {
      type: Number,
      default: 0
    },
    actif: {
      type: Boolean,
      default: true
    },
    categorie: {
      type: String,
      enum: ['effets', 'musique', 'animation', 'autre'],
      default: 'autre'
    }
  }],
  
  // Articles supplémentaires par défaut
  articlesSupplémentairesParDefaut: {
    type: Boolean,
    default: true,
    // Articles par défaut: machine-fumee, feu-artifice, photomaton, saxophone, violon, confettis
  },
  
  // SEO
  seo: {
    metaTitre: {
      type: String,
      default: "ELIJAH'GOD - DJ et Sonorisation pour événements"
    },
    metaDescription: {
      type: String,
      default: "Prestations DJ, sonorisation et animation pour mariages, anniversaires et événements en France"
    },
    motsCles: [{
      type: String
    }]
  },
  
  // Statistiques
  stats: {
    totalDevis: { type: Number, default: 0 },
    totalReservations: { type: Number, default: 0 },
    totalClients: { type: Number, default: 0 }
  },
  
  // Catégories des prestataires (paramétrables par l'admin)
  categoriesPrestataires: {
    type: [String],
    default: [
      'DJ',
      'Photographe',
      'Vidéaste',
      'Animateur',
      'Groupe de louange',
      'Wedding planner',
      'Traiteur',
      'Sonorisation',
      'Éclairage',
      'Décoration',
      'Location matériel',
      'Autre'
    ]
  },

  // Page À propos
  aPropos: {
    hero: {
      surTitre: { type: String, default: 'Fondateur & Directeur artistique' },
      titre: { type: String, default: "Bienvenue, je suis Elijah" },
      citation: { type: String, default: "Servir avec excellence, inspiré par la foi." },
      photo: { type: String, default: '' }
    },
    presentation: {
      actif: { type: Boolean, default: true },
      titre: { type: String, default: 'Qui suis-je ?' },
      contenu: { type: String, default: "Je suis Elijah, entrepreneur passionné par la production artistique et l'événementiel. Depuis mon plus jeune âge, la musique et le service ont été au cœur de ma vie." }
    },
    motivation: {
      actif: { type: Boolean, default: true },
      icone: { type: String, default: '🔥' },
      titre: { type: String, default: "Ce qui m'a poussé" },
      contenu: { type: String, default: "Tout a commencé lors d'un événement où j'ai réalisé que je pouvais faire la différence. Cette conviction m'a poussé à créer ELIJAH'GOD." }
    },
    mission: {
      actif: { type: Boolean, default: true },
      icone: { type: String, default: '🎯' },
      titre: { type: String, default: 'Ce que je donne à travers mes prestations' },
      contenu: { type: String, default: "Chaque prestation que je livre n'est pas juste un service technique — c'est un engagement émotionnel. Je mets mon cœur dans chaque installation." }
    },
    valeurs: {
      type: [{
        icone: String,
        titre: String,
        description: String
      }],
      default: [
        { icone: '🙏', titre: 'Foi & Intégrité', description: "Mon travail est ancré dans des valeurs solides." },
        { icone: '🎶', titre: 'Excellence artistique', description: "Pas de compromis sur la qualité." },
        { icone: '❤️', titre: 'Service du cœur', description: "Je m'investis dans votre événement comme si c'était le mien." },
        { icone: '🤝', titre: 'Relation de confiance', description: "Un prestataire disponible, à l'écoute et transparent." }
      ]
    },
    parcours: {
      type: [{
        annee: String,
        titre: String,
        description: String
      }],
      default: [
        { annee: '2015', titre: 'Les premières notes', description: 'Formation autodidacte en sonorisation et mixage audio.' },
        { annee: '2018', titre: 'Premiers événements', description: 'Accompagnement de mariages et soirées privées.' },
        { annee: '2021', titre: "Création d'ELIJAH'GOD", description: 'Lancement officiel de la structure.' },
        { annee: '2024', titre: 'Expansion & équipe', description: 'Intégration de prestataires partenaires.' }
      ]
    },
    // Galerie de réalisations
    galerie: {
      type: [{
        url: String,
        legende: { type: String, default: '' },
        ordre: { type: Number, default: 0 }
      }],
      default: []
    }
  },

  // Dernière mise à jour
  derniereMiseAJour: {
    date: Date,
    par: String
  }
  
}, {
  timestamps: true
});

// Il ne doit y avoir qu'un seul document de paramètres
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Créer les paramètres par défaut si inexistants
    settings = await this.create({});
  }
  
  return settings;
};

// Méthode pour mettre à jour les paramètres
settingsSchema.statics.updateSettings = async function(updates, adminNom) {
  let settings = await this.getSettings();
  
  Object.keys(updates).forEach(key => {
    if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
      settings[key] = { ...settings[key], ...updates[key] };
    } else {
      settings[key] = updates[key];
    }
  });
  
  settings.derniereMiseAJour = {
    date: new Date(),
    par: adminNom
  };
  
  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
