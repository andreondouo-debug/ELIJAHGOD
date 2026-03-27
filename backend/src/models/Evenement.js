const mongoose = require('mongoose');

/**
 * 📅 MODÈLE ÉVÉNEMENT (Agenda)
 * Gère les événements liés aux prestations, commandes et planning
 */

const todoItemSchema = new mongoose.Schema({
  texte: { type: String, required: true },
  fait: { type: Boolean, default: false },
  priorite: { type: String, enum: ['basse', 'normale', 'haute', 'urgente'], default: 'normale' },
  categorie: { type: String, default: 'general' },
  dateEcheance: Date,
  completePar: String,
  completeLe: Date,
  // Assignation (legacy single)
  assigneA: {
    prestataireId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestataire' },
    nom: String
  },
  // Assignation multiple
  assignesA: [{
    prestataireId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestataire' },
    nom: String
  }],
  ordre: { type: Number, default: 0 }
}, { _id: true });

const etapeProgrammeSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  type: {
    type: String,
    enum: ['transport', 'installation', 'mise_en_place', 'prestation', 'rangement', 'autre'],
    default: 'autre'
  },
  heureDebut: String,
  heureFin: String,
  description: String,
  responsable: String, // legacy single
  // Responsables multiples
  responsables: [{
    prestataireId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestataire' },
    nom: String
  }],
  statut: { type: String, enum: ['a_faire', 'en_cours', 'termine'], default: 'a_faire' },
  notes: String,
  ordre: { type: Number, default: 0 }
}, { _id: true });

const outilSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  categorie: { type: String, default: 'general' },
  quantite: { type: Number, default: 1 },
  verifie: { type: Boolean, default: false },
  notes: String
}, { _id: true });

const evenementSchema = new mongoose.Schema({
  // Informations principales
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['mariage', 'anniversaire', 'corporate', 'concert', 'soiree', 'conference', 'autre'],
    default: 'autre'
  },
  couleur: {
    type: String,
    default: '#667eea'
  },

  // Dates et horaires
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est requise'],
    index: true
  },
  dateFin: {
    type: Date,
    required: [true, 'La date de fin est requise']
  },
  heureDebut: { type: String, required: true },
  heureFin: { type: String, required: true },
  journeeEntiere: { type: Boolean, default: false },

  // Lieu
  lieu: {
    nom: String,
    adresse: String,
    ville: String,
    codePostal: String
  },

  // Créateur (admin ou prestataire)
  creePar: {
    type: { type: String, enum: ['admin', 'prestataire'], required: true },
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    nom: String
  },

  // Liens avec commandes/devis clients
  commandesLiees: [{
    devisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Devis' },
    clientNom: String,
    clientEmail: String,
    montant: Number,
    statut: String
  }],

  // Liens avec prestations
  prestationsLiees: [{
    prestationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestation' },
    nom: String,
    prestataire: String,
    prestataireId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestataire' }
  }],

  // Collaborateurs (prestataires invités)
  collaborateurs: [{
    prestataireId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestataire', required: true },
    nom: { type: String, required: true },
    role: { type: String, enum: ['consultation', 'modification'], default: 'consultation' },
    ajouteLe: { type: Date, default: Date.now }
  }],

  // Programme de l'événement (étapes)
  programme: [etapeProgrammeSchema],

  // Boîte à outils
  boiteAOutils: [outilSchema],

  // Todo list / Workflow
  todos: [todoItemSchema],

  // Statut global
  statut: {
    type: String,
    enum: ['proposition', 'prevision', 'confirme', 'brouillon', 'planifie', 'en_preparation', 'en_cours', 'termine', 'annule'],
    default: 'brouillon'
  },

  // Auto-création depuis un devis
  autoCreated: { type: Boolean, default: false },
  devisSource: { type: mongoose.Schema.Types.ObjectId, ref: 'Devis' },

  // Notes internes
  notes: {
    type: String,
    maxlength: 5000
  },

  // Nombre d'invités prévu
  nbInvites: Number,

  // Rappels email
  rappels: {
    actif: { type: Boolean, default: true },
    delaiJours: { type: Number, default: 1 },
    nombreRappels: { type: Number, default: 1 },
    emailsEnvoyes: [{
      date: Date,
      delaiJours: Number,
      destinataire: String
    }]
  }

}, {
  timestamps: true
});

// Index composé pour recherche rapide
evenementSchema.index({ dateDebut: 1, statut: 1 });
evenementSchema.index({ 'creePar.type': 1, 'creePar.id': 1 });
evenementSchema.index({ 'collaborateurs.prestataireId': 1 });

module.exports = mongoose.model('Evenement', evenementSchema);
