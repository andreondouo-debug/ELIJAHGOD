const mongoose = require('mongoose');

/**
 * 📋 MODÈLE DEVIS - VERSION WORKFLOW INTERACTIF
 * Système complet de construction de devis guidée
 * avec workflow jusqu'au contrat signé
 */
const devisSchema = new mongoose.Schema({
  // ============================================
  // 1. RÉFÉRENCE CLIENT
  // ============================================
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Le client est requis']
  },

  // Copie des infos client (historique)
  client: {
    nom: String,
    prenom: String,
    email: String,
    telephone: String,
    adresse: String,
    entreprise: String
  },

  // ============================================
  // 2. DÉTAILS ÉVÉNEMENT
  // ============================================
  evenement: {
    type: {
      type: String,
      required: true,
      enum: [
        'Mariage',
        'Anniversaire',
        'Soirée d\'entreprise',
        'Bar/Bat Mitzvah',
        'Baptême',
        'Concert',
        'Festival',
        'Séminaire',
        'Gala',
        'Autre'
      ]
    },
    titre: String, // Ex: "Mariage de Marie et Jean"
    description: String,
    
    date: {
      type: Date,
      required: [true, "La date de l'événement est requise"]
    },
    heureDebut: String,
    heureFin: String,
    dureeEstimee: Number, // en heures
    
    lieu: {
      nom: String,
      adresse: String,
      ville: String,
      codePostal: String,
      typeVenue: String // Salle, Extérieur, Domicile, etc.
    },
    
    nbInvites: {
      type: Number,
      min: 1
    },
    nbInvitesEstime: String, // "50-100", "100-150", etc.
    
    thematique: String,
    ambiance: String // "Festive", "Élégante", "Décontractée", etc.
  },

  // ============================================
  // 3. PRESTATIONS SÉLECTIONNÉES
  // ============================================
  prestations: [{
    prestation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestation'
    },
    prestataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestataire'
    },
    nom: String,
    categorie: String,
    quantite: {
      type: Number,
      default: 1,
      min: 1
    },
    duree: Number, // en heures
    prixUnitaire: Number,
    prixTotal: Number,
    options: {
      weekend: Boolean,
      nuit: Boolean,
      installation: Boolean,
      personnalisation: String
    },
    commentaire: String
  }],

  // ============================================
  // 4. MATÉRIEL SÉLECTIONNÉ
  // ============================================
  materiels: [{
    materiel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Materiel'
    },
    prestataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestataire'
    },
    nom: String,
    categorie: String,
    quantite: {
      type: Number,
      default: 1,
      min: 1
    },
    dateDebut: Date,
    dateFin: Date,
    prixLocation: {
      jour: Number,
      total: Number,
      caution: Number
    },
    options: {
      livraison: Boolean,
      installation: Boolean,
      fraisLivraison: Number,
      fraisInstallation: Number
    },
    commentaire: String
  }],

  // ============================================
  // 5. DEMANDES SPÉCIFIQUES CLIENT
  // ============================================
  demandesClient: {
    description: String, // Zone de texte libre
    besoinsSpecifiques: [String],
    budget: {
      minimum: Number,
      maximum: Number,
      flexible: Boolean
    },
    priorites: [String], // Ex: ["Qualité son", "Éclairage", "Animation"]
    references: [String], // URLs ou descriptions de ce qu'ils aiment
    restrictions: String // Allergies, contraintes lieu, etc.
  },

  // ============================================
  // 6. CONVERSATION GUIDE (historique)
  // ============================================
  conversation: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['question', 'reponse', 'suggestion', 'validation'],
      default: 'question'
    },
    source: {
      type: String,
      enum: ['guide', 'client', 'system'],
      default: 'guide'
    },
    message: String,
    data: mongoose.Schema.Types.Mixed // Données structurées liées
  }],

  // ============================================
  // 7. TARIFICATION
  // ============================================
  montants: {
    sousTotalPrestations: {
      type: Number,
      default: 0
    },
    sousTotalMateriels: {
      type: Number,
      default: 0
    },
    fraisKilometriques: {
      distanceSimple: Number,
      distanceAllerRetour: Number,
      kmGratuits: Number,
      kmFacturables: Number,
      tarifParKm: Number,
      montant: {
        type: Number,
        default: 0
      },
      adresseDepart: String,
      adresseArrivee: String,
      calculeAt: Date
    },
    fraisSupplementaires: [{
      libelle: String,
      montant: Number
    }],
    totalAvantRemise: {
      type: Number,
      default: 0
    },
    remise: {
      type: {
        type: String,
        enum: ['pourcentage', 'montant'],
        default: 'pourcentage'
      },
      valeur: {
        type: Number,
        default: 0
      },
      raison: String
    },
    montantRemise: {
      type: Number,
      default: 0
    },
    totalFinal: {
      type: Number,
      default: 0
    },
    acompte: {
      pourcentage: {
        type: Number,
        default: 30
      },
      montant: Number
    },
    tauxTVA: {
      type: Number,
      default: 20
    },
    montantTVA: Number,
    totalTTC: Number
  },

  // ============================================
  // 8. WORKFLOW & STATUT
  // ============================================
  statut: {
    type: String,
    enum: [
      'brouillon',           // En cours de construction par le client
      'soumis',              // Soumis, en attente validation admin
      'en_etude',            // Admin étudie la demande
      'modifie_admin',       // Admin a proposé des modifications
      'attente_validation_client', // Client doit valider les modifs
      'valide_client',       // Client a validé
      'accepte',             // Les 2 parties ont validé
      'entretien_prevu',     // Entretien planifié
      'entretien_effectue',  // Entretien réalisé
      'devis_final',         // Devis final envoyé
      'transforme_contrat',  // Transformé en contrat
      'contrat_signe',       // Contrat signé par le client
      'valide_final',        // Signature admin, contrat complet
      'refuse',              // Refusé par une partie
      'expire',              // Expiré
      'annule'               // Annulé
    ],
    default: 'brouillon'
  },

  etapeActuelle: {
    type: String,
    enum: [
      'informations',
      'type_evenement',
      'date_lieu',
      'invites',
      'prestations',
      'materiels',
      'demandes_speciales',
      'recapitulatif',
      'validation',
      'termine'
    ],
    default: 'informations'
  },

  progressionPourcentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // ============================================
  // 9. HISTORIQUE MODIFICATIONS
  // ============================================
  historique: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: String, // "création", "modification", "validation", etc.
    auteur: {
      type: String,
      enum: ['client', 'admin', 'system'],
      required: true
    },
    auteurId: mongoose.Schema.Types.ObjectId,
    details: String,
    champModifie: String,
    ancienneValeur: mongoose.Schema.Types.Mixed,
    nouvelleValeur: mongoose.Schema.Types.Mixed
  }],

  // ============================================
  // 10. RÉPONSES & MODIFICATIONS ADMIN
  // ============================================
  reponsesAdmin: [{
    date: {
      type: Date,
      default: Date.now
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    adminNom: String,
    message: String,
    type: {
      type: String,
      enum: ['question', 'proposition', 'validation', 'refus'],
      default: 'proposition'
    },
    modificationsProposees: String,
    nouveauMontant: Number,
    justification: String,
    fichiers: [{
      url: String,
      nom: String,
      type: String
    }]
  }],

  // ============================================
  // 11. ENTRETIEN (Physique ou Visio)
  // ============================================
  entretien: {
    demande: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['physique', 'visio', 'non_necessaire'],
      default: 'non_necessaire'
    },
    statut: {
      type: String,
      enum: ['non_prevu', 'a_planifier', 'planifie', 'effectue', 'annule'],
      default: 'non_prevu'
    },
    dateProposee: Date,
    dateConfirmee: Date,
    lieu: String, // Si physique
    lienVisio: String, // Si visio
    dureeEstimee: Number, // en minutes
    notesEntretien: String,
    compteRendu: String,
    fichiers: [{
      url: String,
      nom: String
    }]
  },

  // ============================================
  // 12. SIGNATURES ÉLECTRONIQUES
  // ============================================
  signatures: {
    client: {
      signePar: String,
      dateSignature: Date,
      ipAddress: String,
      signatureData: String, // Base64 de la signature canvas
      consentement: {
        cgv: Boolean,
        traitementDonnees: Boolean,
        annulation: Boolean
      }
    },
    admin: {
      signePar: String,
      dateSignature: Date,
      signatureData: String
    }
  },

  // ============================================
  // 13. DOCUMENTS GÉNÉRÉS
  // ============================================
  documents: {
    devisPdf: {
      url: String,
      genereLe: Date,
      version: Number
    },
    contratPdf: {
      url: String,
      genereLe: Date,
      version: Number
    },
    facture: {
      url: String,
      genereLe: Date
    },
    autres: [{
      nom: String,
      url: String,
      type: String,
      uploadLe: Date
    }]
  },

  // ============================================
  // 14. DATES & VALIDITÉ
  // ============================================
  dates: {
    creation: {
      type: Date,
      default: Date.now
    },
    soumission: Date,
    validationClient: Date,
    validationAdmin: Date,
    transformationContrat: Date,
    signatureClient: Date,
    signatureAdmin: Date,
    validite: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      }
    },
    expiration: Date
  },

  // ============================================
  // 15. NUMÉROTATION
  // ============================================
  numeroDevis: {
    type: String,
    unique: true
  },
  numeroContrat: String, // Généré quand transformé en contrat

  // ============================================
  // 16. MÉTADONNÉES
  // ============================================
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    },
    navigateur: String,
    appareil: String,
    tempsConstruction: Number, // en secondes
    nombreModifications: {
      type: Number,
      default: 0
    },
    derniereModification: Date
  },

  // Notes internes (visibles uniquement admin)
  notesInternes: String,

  // Tags pour recherche
  tags: [String],

  // ============================================
  // 17. PDF GÉNÉRÉ
  // ============================================
  pdfUrl: String, // URL du PDF généré
  pdfGenereAt: Date // Date de dernière génération du PDF

}, {
  timestamps: true
});

// ============================================
// INDEXES
// ============================================
devisSchema.index({ clientId: 1, statut: 1 });
devisSchema.index({ numeroDevis: 1 });
devisSchema.index({ 'evenement.date': 1 });
devisSchema.index({ statut: 1, createdAt: -1 });
devisSchema.index({ 'client.email': 1 });

// ============================================
// MIDDLEWARE - Numéro de devis unique
// ============================================
devisSchema.pre('save', async function(next) {
  if (!this.numeroDevis) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Devis').countDocuments();
    this.numeroDevis = `EG-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// ============================================
// MÉTHODES
// ============================================

// Calculer tous les montants
devisSchema.methods.calculerMontants = function() {
  // Sous-total prestations
  this.montants.sousTotalPrestations = this.prestations.reduce(
    (total, p) => total + (p.prixTotal || 0),
    0
  );

  // Sous-total matériels
  this.montants.sousTotalMateriels = this.materiels.reduce(
    (total, m) => total + (m.prixLocation?.total || 0),
    0
  );

  // Total frais supplémentaires
  const totalFrais = this.montants.fraisSupplementaires?.reduce(
    (total, f) => total + (f.montant || 0),
    0
  ) || 0;

  // Total avant remise
  this.montants.totalAvantRemise = 
    this.montants.sousTotalPrestations +
    this.montants.sousTotalMateriels +
    totalFrais;

  // Calcul remise
  if (this.montants.remise && this.montants.remise.valeur > 0) {
    if (this.montants.remise.type === 'pourcentage') {
      this.montants.montantRemise = 
        (this.montants.totalAvantRemise * this.montants.remise.valeur) / 100;
    } else {
      this.montants.montantRemise = this.montants.remise.valeur;
    }
  } else {
    this.montants.montantRemise = 0;
  }

  // Total final HT
  this.montants.totalFinal = 
    this.montants.totalAvantRemise - this.montants.montantRemise;

  // TVA
  this.montants.montantTVA = 
    (this.montants.totalFinal * this.montants.tauxTVA) / 100;

  // Total TTC
  this.montants.totalTTC = this.montants.totalFinal + this.montants.montantTVA;

  // Acompte
  if (this.montants.acompte) {
    this.montants.acompte.montant = 
      (this.montants.totalFinal * this.montants.acompte.pourcentage) / 100;
  }

  return this.montants;
};

// Ajouter une entrée dans l'historique
devisSchema.methods.ajouterHistorique = function(action, auteur, auteurId, details = '') {
  this.historique.push({
    action,
    auteur,
    auteurId,
    details,
    date: new Date()
  });
  
  this.metadata.nombreModifications += 1;
  this.metadata.derniereModification = new Date();
};

// Ajouter un message dans la conversation
devisSchema.methods.ajouterConversation = function(type, source, message, data = null) {
  this.conversation.push({
    type,
    source,
    message,
    data,
    timestamp: new Date()
  });
};

// Calculer la progression
devisSchema.methods.calculerProgression = function() {
  const etapes = [
    'informations',
    'type_evenement',
    'date_lieu',
    'invites',
    'prestations',
    'materiels',
    'demandes_speciales',
    'recapitulatif',
    'validation'
  ];
  
  const indexEtape = etapes.indexOf(this.etapeActuelle);
  this.progressionPourcentage = Math.round(((indexEtape + 1) / etapes.length) * 100);
  
  return this.progressionPourcentage;
};

// Vérifier si expiré
devisSchema.methods.estExpire = function() {
  if (this.statut === 'brouillon' || this.statut === 'contrat_signe') {
    return false;
  }
  return new Date() > this.dates.validite;
};

// Passer à l'étape suivante
devisSchema.methods.etapeSuivante = function() {
  const etapes = [
    'informations',
    'type_evenement',
    'date_lieu',
    'invites',
    'prestations',
    'materiels',
    'demandes_speciales',
    'recapitulatif',
    'validation',
    'termine'
  ];
  
  const indexActuel = etapes.indexOf(this.etapeActuelle);
  if (indexActuel < etapes.length - 1) {
    this.etapeActuelle = etapes[indexActuel + 1];
    this.calculerProgression();
  }
};

// Transformer en contrat
devisSchema.methods.transformerEnContrat = async function() {
  if (this.statut !== 'valide_client' && this.statut !== 'accepte') {
    throw new Error('Le devis doit être validé avant transformation en contrat');
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await mongoose.model('Devis').countDocuments({
    numeroContrat: { $exists: true, $ne: null }
  });
  
  this.numeroContrat = `CONT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  this.statut = 'transforme_contrat';
  this.dates.transformationContrat = new Date();
  
  this.ajouterHistorique(
    'transformation_contrat',
    'system',
    null,
    'Devis transformé en contrat'
  );

  return this.numeroContrat;
};

// Signer (client ou admin)
devisSchema.methods.signer = function(partie, signatureData, signataire) {
  if (partie === 'client') {
    this.signatures.client = {
      signePar: signataire,
      dateSignature: new Date(),
      signatureData
    };
    this.dates.signatureClient = new Date();
    
    if (this.statut === 'transforme_contrat') {
      this.statut = 'contrat_signe';
    }
  } else if (partie === 'admin') {
    this.signatures.admin = {
      signePar: signataire,
      dateSignature: new Date(),
      signatureData
    };
    this.dates.signatureAdmin = new Date();
    
    if (this.signatures.client.dateSignature) {
      this.statut = 'valide_final';
    }
  }

  this.ajouterHistorique(
    'signature',
    partie,
    null,
    `Signature ${partie} effectuée par ${signataire}`
  );
};

const Devis = mongoose.model('Devis', devisSchema);

module.exports = Devis;
