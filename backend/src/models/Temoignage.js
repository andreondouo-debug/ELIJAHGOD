const mongoose = require('mongoose');

/**
 * 💬 MODÈLE TÉMOIGNAGE/AVIS
 * Pour les avis clients et témoignages externes
 */

const temoignageSchema = new mongoose.Schema({
  // Informations de l'auteur
  auteur: {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true
    },
    entreprise: String,
    photo: String
  },

  // Type de témoignage
  type: {
    type: String,
    enum: ['avis_client', 'temoignage_externe', 'google_review', 'facebook_review'],
    default: 'avis_client'
  },

  // Contenu
  titre: {
    type: String,
    trim: true,
    maxlength: 100
  },
  contenu: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true,
    minlength: 10,
    maxlength: 1000
  },

  // Notation
  note: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  // Événement lié (si avis client)
  evenement: {
    devis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Devis'
    },
    type: String,
    date: Date
  },

  // Prestations/Matériels commentés
  prestationsCommentees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prestation'
  }],
  materielsCommentes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materiel'
  }],

  // Modération
  statut: {
    type: String,
    enum: ['en_attente', 'approuve', 'refuse', 'signale'],
    default: 'en_attente'
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false // Pour mettre en avant certains témoignages
  },

  // Gestion admin
  moderePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  dateModeree: Date,
  raisonRefus: String,

  // Réponse admin (optionnel)
  reponse: {
    texte: String,
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    date: Date
  },

  // Likes/Utilité
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  marqueUtilesPar: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }],

  // Source externe (si review importée)
  sourceExterne: {
    plateforme: String, // 'google', 'facebook', 'trustpilot'
    url: String,
    idExterne: String
  },

  // Métadonnées
  ipAddress: String,
  userAgent: String

}, {
  timestamps: true
});

// Index pour recherche et filtrage
temoignageSchema.index({ statut: 1, isVisible: 1, note: -1 });
temoignageSchema.index({ 'auteur.client': 1 });
temoignageSchema.index({ createdAt: -1 });
temoignageSchema.index({ isFeatured: 1, note: -1 });

// Méthode pour approuver un témoignage
temoignageSchema.methods.approuver = function(moderateurId) {
  this.statut = 'approuve';
  this.isVisible = true;
  this.moderePar = moderateurId;
  this.dateModeree = new Date();
  return this.save();
};

// Méthode pour refuser un témoignage
temoignageSchema.methods.refuser = function(moderateurId, raison) {
  this.statut = 'refuse';
  this.isVisible = false;
  this.moderePar = moderateurId;
  this.dateModeree = new Date();
  this.raisonRefus = raison;
  return this.save();
};

// Méthode pour ajouter une réponse
temoignageSchema.methods.ajouterReponse = function(auteurId, texte) {
  this.reponse = {
    texte,
    auteur: auteurId,
    date: new Date()
  };
  return this.save();
};

// Méthode pour marquer comme utile
temoignageSchema.methods.marquerUtile = async function(clientId) {
  if (!this.marqueUtilesPar.includes(clientId)) {
    this.marqueUtilesPar.push(clientId);
    this.likes += 1;
    return this.save();
  }
  return this;
};

// Statistiques globales (méthode statique)
temoignageSchema.statics.getStatistiques = async function() {
  const stats = await this.aggregate([
    { $match: { isVisible: true, statut: 'approuve' } },
    {
      $group: {
        _id: null,
        nombreTotal: { $sum: 1 },
        noteMoyenne: { $avg: '$note' },
        note5: { $sum: { $cond: [{ $eq: ['$note', 5] }, 1, 0] } },
        note4: { $sum: { $cond: [{ $eq: ['$note', 4] }, 1, 0] } },
        note3: { $sum: { $cond: [{ $eq: ['$note', 3] }, 1, 0] } },
        note2: { $sum: { $cond: [{ $eq: ['$note', 2] }, 1, 0] } },
        note1: { $sum: { $cond: [{ $eq: ['$note', 1] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    nombreTotal: 0,
    noteMoyenne: 0,
    note5: 0,
    note4: 0,
    note3: 0,
    note2: 0,
    note1: 0
  };
};

module.exports = mongoose.model('Temoignage', temoignageSchema);
