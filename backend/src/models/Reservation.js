const mongoose = require('mongoose');

/**
 * 📅 MODÈLE RÉSERVATION (Planning)
 * Gère les dates réservées et la disponibilité
 */
const reservationSchema = new mongoose.Schema({
  // Référence au devis
  devis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Devis',
    required: true
  },
  
  // Date et horaires
  date: {
    type: Date,
    required: [true, 'La date est requise'],
    index: true
  },
  
  heureDebut: {
    type: String,
    required: true
  },
  
  heureFin: {
    type: String,
    required: true
  },
  
  // Informations client
  client: {
    nom: String,
    prenom: String,
    email: String,
    telephone: String
  },
  
  // Statut de la réservation
  statut: {
    type: String,
    enum: ['demandee', 'validee', 'annulee', 'terminee'],
    default: 'demandee'
  },
  
  // Type d'événement
  typeEvenement: {
    type: String,
    required: true
  },
  
  lieu: {
    type: String,
    required: true
  },
  
  // Validation admin
  validePar: {
    type: String, // Nom de l'admin qui a validé
    date: Date
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // Rappels
  rappelEnvoye: {
    type: Boolean,
    default: false
  },
  
  dateRappel: Date
  
}, {
  timestamps: true
});

// Index composé pour recherche rapide par date
reservationSchema.index({ date: 1, statut: 1 });

// Méthode pour vérifier si une date est disponible
reservationSchema.statics.verifierDisponibilite = async function(date, heureDebut, heureFin) {
  const dateDebut = new Date(date);
  dateDebut.setHours(0, 0, 0, 0);
  
  const dateFin = new Date(date);
  dateFin.setHours(23, 59, 59, 999);
  
  const reservationsExistantes = await this.find({
    date: {
      $gte: dateDebut,
      $lte: dateFin
    },
    statut: { $in: ['demandee', 'validee'] }
  });
  
  return {
    disponible: reservationsExistantes.length === 0,
    reservations: reservationsExistantes
  };
};

// Méthode pour obtenir les dates indisponibles du mois
reservationSchema.statics.getDatesIndisponibles = async function(annee, mois) {
  const dateDebut = new Date(annee, mois - 1, 1);
  const dateFin = new Date(annee, mois, 0, 23, 59, 59);
  
  const reservations = await this.find({
    date: {
      $gte: dateDebut,
      $lte: dateFin
    },
    statut: { $in: ['demandee', 'validee'] }
  }).select('date statut');
  
  return reservations.map(r => ({
    date: r.date,
    statut: r.statut
  }));
};

// Middleware pour mettre à jour le statut automatiquement
reservationSchema.pre('save', function(next) {
  const maintenant = new Date();
  const dateReservation = new Date(this.date);
  
  // Marquer comme terminée si la date est passée
  if (dateReservation < maintenant && this.statut === 'validee') {
    this.statut = 'terminee';
  }
  
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
