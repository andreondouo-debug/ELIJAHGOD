const mongoose = require('mongoose');

/**
 * 📦 MODÈLE PRESTATION
 * Représente une offre de service (DJ, sono, éclairage, etc.)
 * Peut être créée par l'admin ou par un prestataire
 */
const prestationSchema = new mongoose.Schema({
  // Lié au prestataire (optionnel - si null, c'est une prestation admin)
  prestataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prestataire',
    default: null
  },

  // Informations de base
  nom: {
    type: String,
    required: [true, 'Le nom de la prestation est requis'],
    trim: true
  },
  
  categorie: {
    type: String,
    required: true,
    enum: [
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
      'Animation',
      'Pack Complet',
      'Location matériel',
      'Autre'
    ],
    default: 'Autre'
  },
  
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: 2000
  },
  
  descriptionCourte: {
    type: String,
    maxlength: 200
  },
  
  // Tarification
  prixBase: {
    type: Number,
    required: [true, 'Le prix de base est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  
  unite: {
    type: String,
    enum: ['heure', 'soirée', 'journée', 'forfait', 'unité'],
    default: 'forfait'
  },
  
  // Options de tarification supplémentaires
  tarifWeekend: {
    type: Number,
    default: 0
  },
  
  tarifNuit: {
    type: Number,
    default: 0
  },
  
  // Métadonnées
  image: {
    type: String,
    default: '/images/prestations/default.jpg'
  },
  
  inclus: [{
    type: String
  }],
  
  nonInclus: [{
    type: String
  }],
  
  dureeMin: {
    type: Number, // en heures
    default: 2
  },
  
  dureeMax: {
    type: Number, // en heures
    default: 12
  },
  
  disponible: {
    type: Boolean,
    default: true
  },
  
  ordre: {
    type: Number,
    default: 0
  },

  // 🆕 NOUVEAU - Catalogue avancé
  
  // Prestataires associés à cette prestation (pour offrir plusieurs choix)
  prestatairesAssocies: [{
    prestataireId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestataire',
      required: true
    },
    disponibilite: {
      type: String,
      enum: ['disponible', 'sur_demande', 'indisponible'],
      default: 'disponible'
    },
    ordre: {
      type: Number,
      default: 0
    },
    tarifSpecifique: {
      type: Number, // Si ce prestataire a un tarif différent
      default: null
    }
  }],
  
  // Tarifs selon le nombre d'invités
  tarifsParInvites: [{
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number, // null = illimité
      default: null
    },
    prix: {
      type: Number,
      required: true,
      min: 0
    },
    label: {
      type: String, // ex: "Petit événement", "Moyen", "Grand"
      default: ''
    }
  }],
  
  // Galerie photos/vidéos
  galerie: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    description: {
      type: String,
      default: ''
    },
    ordre: {
      type: Number,
      default: 0
    },
    miniature: {
      type: String, // URL de la miniature
      default: ''
    }
  }],
  
  // Options supplémentaires détaillées
  caracteristiques: [{
    nom: String,
    valeur: String,
    icone: String // emoji ou nom d'icône
  }],
  
  // Avis moyens (calculés depuis les devis validés)
  noteMoyenne: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  nombreAvis: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

// Index pour recherche rapide
prestationSchema.index({ categorie: 1, disponible: 1 });
prestationSchema.index({ nom: 'text', description: 'text' });

// Méthode pour calculer le prix avec options
prestationSchema.methods.calculerPrix = function(options = {}) {
  let prixTotal = this.prixBase;
  
  if (options.weekend) {
    prixTotal += this.tarifWeekend;
  }
  
  if (options.nuit) {
    prixTotal += this.tarifNuit;
  }
  
  if (options.duree && options.duree > this.dureeMin) {
    const heuresSupplementaires = options.duree - this.dureeMin;
    prixTotal += heuresSupplementaires * (this.prixBase / this.dureeMin);
  }
  
  return Math.round(prixTotal * 100) / 100;
};

// 🆕 Méthode pour calculer le prix selon le nombre d'invités
prestationSchema.methods.calculerPrixParInvites = function(nombreInvites) {
  // Si pas de tarifs par invités définis, utiliser le prix de base
  if (!this.tarifsParInvites || this.tarifsParInvites.length === 0) {
    return this.prixBase;
  }
  
  // Trouver la tranche correspondante
  const tranche = this.tarifsParInvites.find(t => {
    const minOk = nombreInvites >= t.min;
    const maxOk = t.max === null || nombreInvites <= t.max;
    return minOk && maxOk;
  });
  
  // Si une tranche est trouvée, utiliser son prix
  if (tranche) {
    return tranche.prix;
  }
  
  // Sinon, prendre la tranche la plus haute
  const tranchePlusHaute = this.tarifsParInvites
    .sort((a, b) => b.min - a.min)[0];
  
  return tranchePlusHaute ? tranchePlusHaute.prix : this.prixBase;
};

// 🆕 Méthode pour obtenir la liste des prestataires disponibles
prestationSchema.methods.getPrestatairesDispo = function() {
  if (!this.prestatairesAssocies || this.prestatairesAssocies.length === 0) {
    return [];
  }
  
  return this.prestatairesAssocies
    .filter(p => p.disponibilite === 'disponible')
    .sort((a, b) => a.ordre - b.ordre);
};

module.exports = mongoose.model('Prestation', prestationSchema);
