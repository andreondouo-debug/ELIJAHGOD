const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * 👤 MODÈLE ADMIN
 * Compte administrateur pour gérer le site
 */
const adminSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false // Ne pas retourner le mot de passe par défaut
  },
  
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  
  actif: {
    type: Boolean,
    default: true
  },
  
  derniereConnexion: Date
  
}, {
  timestamps: true
});

// Hash du mot de passe avant sauvegarde
adminSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
adminSchema.methods.comparerMotDePasse = async function(motDePasse) {
  return await bcrypt.compare(motDePasse, this.motDePasse);
};

module.exports = mongoose.model('Admin', adminSchema);
