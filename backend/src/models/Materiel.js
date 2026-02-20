const mongoose = require('mongoose');

const materielSchema = new mongoose.Schema({
  // Lié au prestataire (optionnel - null si c'est du matériel admin)
  prestataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prestataire',
    default: null
  },

  // Informations du matériel
  nom: {
    type: String,
    required: [true, "Le nom du matériel est requis"],
    trim: true
  },
  categorie: {
    type: String,
    required: [true, "La catégorie est requise"],
    enum: [
      'Sonorisation',
      'Éclairage',
      'Effets spéciaux',
      'Machines à fumée',
      'Jets d\'artifice',
      'DJ equipment',
      'Vidéo projecteur',
      'Écran LED',
      'Structure/Scène',
      'Décoration',
      'Mobilier',
      'Autre'
    ]
  },
  sousCategorie: String, // Ex: "Enceinte", "Projecteur PAR", "Feu d'artifice"

  // Description
  description: {
    type: String,
    required: [true, "La description est requise"]
  },
  caracteristiques: [{
    nom: String, // Ex: "Puissance", "Dimensions", "Poids"
    valeur: String
  }],

  // Médias
  photos: [{
    url: String,
    publicId: String,
    legende: String
  }],
  video: String,

  // Tarification
  prixLocation: {
    jour: Number,
    weekend: Number, // Vendredi-Dimanche
    semaine: Number,
    caution: Number // Montant de la caution
  },
  
  // Quantité disponible
  quantiteDisponible: {
    type: Number,
    default: 1,
    min: 0
  },
  quantiteTotale: {
    type: Number,
    required: [true, "La quantité totale est requise"],
    default: 1
  },

  // État et maintenance
  etat: {
    type: String,
    enum: ['excellent', 'bon', 'correct', 'maintenance'],
    default: 'bon'
  },
  derniereMaintenance: Date,
  prochaineMaintenanceDate: Date,

  // Conditions de location
  conditions: {
    dureeMinLocation: { type: Number, default: 1 }, // En jours
    delaiReservation: { type: Number, default: 2 }, // Jours avant l'événement
    livraisonDisponible: { type: Boolean, default: false },
    fraisLivraison: Number,
    installationDisponible: { type: Boolean, default: false },
    fraisInstallation: Number
  },

  // Disponibilité
  reservations: [{
    dateDebut: Date,
    dateFin: Date,
    quantite: Number,
    client: String, // Ou référence à un User/Devis
    statut: {
      type: String,
      enum: ['en attente', 'confirmée', 'en cours', 'terminée', 'annulée'],
      default: 'en attente'
    }
  }],

  // Options de pack
  packable: {
    type: Boolean,
    default: false // Peut être inclus dans des packs
  },
  packsInclus: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack' // Pour les offres groupées
  }],

  // Visibilité
  isActive: {
    type: Boolean,
    default: true
  },
  miseEnAvant: {
    type: Boolean,
    default: false // Mis en avant sur la page
  },
  
  // Statistiques
  stats: {
    vues: { type: Number, default: 0 },
    demandes: { type: Number, default: 0 },
    reservations: { type: Number, default: 0 },
    revenuGenere: { type: Number, default: 0 }
  },

  // Métadonnées
  dateAjout: {
    type: Date,
    default: Date.now
  },
  derniereMiseAJour: Date

}, {
  timestamps: true
});

// Index pour les recherches
materielSchema.index({ categorie: 1, isActive: 1 });
materielSchema.index({ prestataire: 1, isActive: 1 });
materielSchema.index({ nom: 'text', description: 'text' });

// Méthode pour vérifier la disponibilité
materielSchema.methods.verifierDisponibilite = function(dateDebut, dateFin, quantiteDemandee = 1) {
  if (quantiteDemandee > this.quantiteDisponible) {
    return {
      disponible: false,
      message: `Seulement ${this.quantiteDisponible} unité(s) disponible(s)`
    };
  }

  // Vérifier les réservations existantes
  const reservationsConflits = this.reservations.filter(res => {
    if (res.statut === 'annulée') return false;
    
    const resDebut = new Date(res.dateDebut);
    const resFin = new Date(res.dateFin);
    const demDebut = new Date(dateDebut);
    const demFin = new Date(dateFin);

    // Vérifie le chevauchement de dates
    return (demDebut <= resFin && demFin >= resDebut);
  });

  const quantiteReservee = reservationsConflits.reduce((sum, res) => sum + res.quantite, 0);
  const quantiteRestante = this.quantiteTotale - quantiteReservee;

  if (quantiteRestante >= quantiteDemandee) {
    return {
      disponible: true,
      quantiteRestante,
      message: `${quantiteRestante} unité(s) disponible(s) pour ces dates`
    };
  }

  return {
    disponible: false,
    quantiteRestante,
    message: `Seulement ${quantiteRestante} unité(s) disponible(s) pour ces dates`
  };
};

// Méthode pour calculer le prix
materielSchema.methods.calculerPrix = function(dateDebut, dateFin) {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const diffJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;

  let prix = 0;

  // Si location d'une semaine ou plus, appliquer le tarif semaine
  if (diffJours >= 7) {
    const semaines = Math.floor(diffJours / 7);
    const joursRestants = diffJours % 7;
    prix = (semaines * this.prixLocation.semaine) + (joursRestants * this.prixLocation.jour);
  }
  // Sinon tarif au jour
  else {
    prix = diffJours * this.prixLocation.jour;
  }

  return {
    prix,
    diffJours,
    caution: this.prixLocation.caution || 0,
    fraisLivraison: this.conditions.livraisonDisponible ? this.conditions.fraisLivraison : 0,
    fraisInstallation: this.conditions.installationDisponible ? this.conditions.fraisInstallation : 0,
    total: prix + (this.prixLocation.caution || 0)
  };
};

// Méthode pour réserver le matériel
materielSchema.methods.reserver = async function(reservationData) {
  const { dateDebut, dateFin, quantite, client } = reservationData;

  const dispo = this.verifierDisponibilite(dateDebut, dateFin, quantite);
  if (!dispo.disponible) {
    throw new Error(dispo.message);
  }

  this.reservations.push({
    dateDebut,
    dateFin,
    quantite,
    client,
    statut: 'en attente'
  });

  this.quantiteDisponible -= quantite;
  this.stats.reservations += 1;

  await this.save();
  return this.reservations[this.reservations.length - 1];
};

// Méthode pour libérer le matériel après location
materielSchema.methods.liberer = async function(reservationId) {
  const reservation = this.reservations.id(reservationId);
  if (!reservation) {
    throw new Error('Réservation introuvable');
  }

  reservation.statut = 'terminée';
  this.quantiteDisponible += reservation.quantite;

  await this.save();
};

// Incrémenter les vues
materielSchema.methods.incrementerVues = async function() {
  this.stats.vues += 1;
  await this.save();
};

const Materiel = mongoose.model('Materiel', materielSchema);

module.exports = Materiel;
