const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const prestataireSchema = new mongoose.Schema({
  // Informations de connexion
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est requis"],
    minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"]
  },

  // Informations professionnelles
  nomEntreprise: {
    type: String,
    required: [true, "Le nom de l'entreprise est requis"],
    trim: true
  },
  categorie: {
    type: String,
    required: [true, "La catégorie est requise"],
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
      'Location matériel',
      'Autre'
    ]
  },
  specialites: [String], // Ex: ["Mariage", "Anniversaire", "Événement d'entreprise"]

  // Contact
  telephone: String,
  adresse: {
    rue: String,
    codePostal: String,
    ville: String,
    pays: { type: String, default: 'France' }
  },
  siteWeb: String,
  
  // Réseaux sociaux
  reseauxSociaux: {
    facebook: String,
    instagram: String,
    youtube: String,
    tiktok: String
  },

  // Profil public
  description: {
    type: String,
    maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"]
  },
  logo: {
    url: String,
    publicId: String // Pour Cloudinary
  },
  photos: [{
    url: String,
    publicId: String,
    description: String
  }],
  video: String, // URL vidéo de présentation

  // Évaluation et avis
  noteGlobale: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  nombreAvis: {
    type: Number,
    default: 0
  },
  avis: [{
    client: String,
    note: { type: Number, min: 1, max: 5 },
    commentaire: String,
    dateEvenement: Date,
    dateAvis: { type: Date, default: Date.now },
    typeEvenement: String
  }],

  // Tarification
  tarifsPublics: {
    afficher: { type: Boolean, default: true },
    tarifMin: Number,
    tarifMax: Number,
    unite: { type: String, default: 'prestation' } // "prestation", "heure", "jour"
  },

  // Disponibilité
  disponibilite: {
    calendrier: [Date], // Dates déjà réservées
    joursNonTravailles: [Number], // 0-6 (dimanche-samedi)
    zoneIntervention: [String] // Départements ou villes
  },

  // Paramètres du compte
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false // Vérifié par l'admin
  },
  plan: {
    type: String,
    enum: ['gratuit', 'premium', 'pro'],
    default: 'gratuit'
  },
  commission: {
    type: Number,
    default: 15 // % de commission sur les réservations
  },

  // Statistiques
  stats: {
    vuesProfil: { type: Number, default: 0 },
    demandesRecues: { type: Number, default: 0 },
    devisEnvoyes: { type: Number, default: 0 },
    reservationsConfirmees: { type: Number, default: 0 },
    chiffreAffaires: { type: Number, default: 0 }
  },

  // Documents
  documents: [{
    type: { type: String }, // "SIRET", "Assurance", "Certification"
    url: String,
    dateExpiration: Date,
    valide: { type: Boolean, default: false }
  }],

  // Métadonnées
  dateInscription: {
    type: Date,
    default: Date.now
  },
  derniereConnexion: Date,
  derniereMiseAJour: Date

}, {
  timestamps: true
});

// Hash du mot de passe avant sauvegarde
prestataireSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
prestataireSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour calculer la note globale
prestataireSchema.methods.calculerNoteGlobale = function() {
  if (this.avis.length === 0) {
    this.noteGlobale = 0;
    this.nombreAvis = 0;
    return 0;
  }

  const somme = this.avis.reduce((acc, avis) => acc + avis.note, 0);
  this.noteGlobale = Math.round((somme / this.avis.length) * 10) / 10;
  this.nombreAvis = this.avis.length;
  
  return this.noteGlobale;
};

// Méthode pour ajouter un avis
prestataireSchema.methods.ajouterAvis = async function(avisData) {
  this.avis.push(avisData);
  this.calculerNoteGlobale();
  await this.save();
};

// Méthode pour vérifier la disponibilité
prestataireSchema.methods.estDisponible = function(date) {
  const dateStr = date.toISOString().split('T')[0];
  return !this.disponibilite.calendrier.some(d => 
    d.toISOString().split('T')[0] === dateStr
  );
};

// Méthode pour bloquer une date
prestataireSchema.methods.bloquerDate = async function(date) {
  if (!this.estDisponible(date)) {
    throw new Error('Cette date est déjà réservée');
  }
  
  this.disponibilite.calendrier.push(date);
  await this.save();
};

// Méthode pour obtenir le profil public (sans infos sensibles)
prestataireSchema.methods.getProfilPublic = function() {
  return {
    _id: this._id,
    nomEntreprise: this.nomEntreprise,
    categorie: this.categorie,
    specialites: this.specialites,
    description: this.description,
    logo: this.logo,
    photos: this.photos,
    video: this.video,
    noteGlobale: this.noteGlobale,
    nombreAvis: this.nombreAvis,
    avis: this.avis,
    tarifsPublics: this.tarifsPublics,
    telephone: this.telephone,
    siteWeb: this.siteWeb,
    reseauxSociaux: this.reseauxSociaux,
    disponibilite: {
      zoneIntervention: this.disponibilite.zoneIntervention
    },
    stats: {
      vuesProfil: this.stats.vuesProfil,
      reservationsConfirmees: this.stats.reservationsConfirmees
    },
    isVerified: this.isVerified,
    plan: this.plan
  };
};

// Incrémenter les vues du profil
prestataireSchema.methods.incrementerVues = async function() {
  this.stats.vuesProfil += 1;
  await this.save();
};

const Prestataire = mongoose.model('Prestataire', prestataireSchema);

module.exports = Prestataire;
