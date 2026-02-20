const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  // Informations personnelles
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    lowercase: true,
    trim: true
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est requis']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6
  },

  // Rôle et permissions
  role: {
    type: String,
    enum: ['prospect', 'client', 'prestataire', 'valideur', 'admin'],
    default: 'prospect'
  },
  permissions: {
    canViewAllDevis: { type: Boolean, default: false },
    canValidateDevis: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canManagePrestations: { type: Boolean, default: false },
    canManageMateriel: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false }
  },

  // Adresse
  adresse: {
    rue: String,
    codePostal: String,
    ville: String,
    pays: { type: String, default: 'France' }
  },

  // Profil
  photo: {
    url: String,
    publicId: String
  },
  dateNaissance: Date,
  entreprise: String, // Si événement pro

  // Préférences événements
  typesEvenementsInteresses: [String], // Mariage, Anniversaire, Entreprise, etc.
  budgetMoyen: {
    min: Number,
    max: Number
  },

  // Statut du compte
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Réinitialisation mot de passe
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Historique
  devis: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Devis'
  }],
  reservations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  }],

  // Statistiques
  stats: {
    nombreDevis: { type: Number, default: 0 },
    nombreReservations: { type: Number, default: 0 },
    totalDepense: { type: Number, default: 0 }
  },

  // Notifications
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    newsletterOptIn: { type: Boolean, default: false }
  },

  // Métadonnées
  dateInscription: {
    type: Date,
    default: Date.now
  },
  derniereConnexion: Date,
  source: {
    type: String,
    enum: ['web', 'formulaire_devis', 'prestataire', 'autre'],
    default: 'formulaire_devis'
  }

}, {
  timestamps: true
});

// Hash du mot de passe avant sauvegarde
clientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
clientSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer token de vérification email
clientSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  
  return token;
};

// Méthode pour générer token de réinitialisation mot de passe
clientSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1h
  
  return token;
};

// Méthode pour obtenir le nom complet
clientSchema.methods.getNomComplet = function() {
  return `${this.prenom} ${this.nom}`;
};

// Méthode pour obtenir le profil public (sans infos sensibles)
clientSchema.methods.getProfilPublic = function() {
  return {
    _id: this._id,
    prenom: this.prenom,
    nom: this.nom,
    email: this.email,
    telephone: this.telephone,
    photo: this.photo,
    dateInscription: this.dateInscription,
    stats: this.stats,
    role: this.role,
    permissions: this.permissions,
    isActive: this.isActive
  };
};

// Méthode pour vérifier une permission spécifique
clientSchema.methods.hasPermission = function(permission) {
  // Les admins ont toutes les permissions
  if (this.role === 'admin') return true;
  
  // Vérifier la permission spécifique
  return this.permissions && this.permissions[permission] === true;
};

// Méthode pour définir les permissions par défaut selon le rôle
clientSchema.methods.setDefaultPermissions = function() {
  switch (this.role) {
    case 'admin':
      this.permissions = {
        canViewAllDevis: true,
        canValidateDevis: true,
        canManageUsers: true,
        canManageSettings: true,
        canManagePrestations: true,
        canManageMateriel: true,
        canViewReports: true
      };
      break;
    
    case 'valideur':
      this.permissions = {
        canViewAllDevis: true,
        canValidateDevis: true,
        canManageUsers: false,
        canManageSettings: false,
        canManagePrestations: false,
        canManageMateriel: false,
        canViewReports: true
      };
      break;
    
    case 'prestataire':
      this.permissions = {
        canViewAllDevis: false,
        canValidateDevis: false,
        canManageUsers: false,
        canManageSettings: false,
        canManagePrestations: true,
        canManageMateriel: true,
        canViewReports: false
      };
      break;
    
    case 'client':
    case 'prospect':
    default:
      this.permissions = {
        canViewAllDevis: false,
        canValidateDevis: false,
        canManageUsers: false,
        canManageSettings: false,
        canManagePrestations: false,
        canManageMateriel: false,
        canViewReports: false
      };
      break;
  }
};

// Méthode pour promouvoir un prospect en client
clientSchema.methods.promoteToClient = async function() {
  if (this.role === 'prospect') {
    this.role = 'client';
    this.setDefaultPermissions();
    await this.save();
    return true;
  }
  return false;
};

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
