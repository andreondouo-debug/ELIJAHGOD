require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * 🔐 SCRIPT DE CRÉATION DU COMPTE ADMIN
 * Crée un utilisateur administrateur avec le rôle "admin"
 */

// Schéma User simplifié pour ce script
const userSchema = new mongoose.Schema({
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['client', 'prestataire', 'admin'],
    default: 'admin' 
  },
  permissions: [String],
  isEmailVerified: { type: Boolean, default: true },
  dateInscription: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elijahgod';
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connecté à MongoDB');

    // Informations admin
    const adminData = {
      prenom: 'Randy',
      nom: 'ODOUNGA',
      email: 'odoungaetoumbi@gmail.com',
      password: 'Odoungade1994',
      role: 'admin',
      permissions: [
        'gerer_utilisateurs',
        'gerer_devis',
        'gerer_prestataires',
        'gerer_prestations',
        'gerer_temoignages',
        'gerer_settings',
        'voir_statistiques',
        'gerer_paiements'
      ],
      isEmailVerified: true
    };

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Un administrateur avec cet email existe déjà');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Nom: ${existingAdmin.prenom} ${existingAdmin.nom}`);
      console.log(`🔑 Rôle: ${existingAdmin.role}`);
      
      // Demander confirmation pour mettre à jour
      console.log('\n🔄 Mise à jour du mot de passe...');
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.prenom = adminData.prenom;
      existingAdmin.nom = adminData.nom;
      existingAdmin.role = 'admin';
      existingAdmin.permissions = adminData.permissions;
      existingAdmin.isEmailVerified = true;
      
      await existingAdmin.save();
      console.log('✅ Compte admin mis à jour avec succès!');
    } else {
      // Hacher le mot de passe
      console.log('🔐 Hachage du mot de passe...');
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // Créer l'admin
      const admin = new User({
        ...adminData,
        password: hashedPassword
      });

      await admin.save();
      console.log('✅ Compte administrateur créé avec succès!');
    }

    console.log('\n📋 Informations de connexion:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Nom: ${adminData.prenom} ${adminData.nom}`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Mot de passe: ${adminData.password}`);
    console.log(`🛡️  Rôle: ${adminData.role}`);
    console.log(`✨ Permissions: ${adminData.permissions.length} permissions`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Vous pouvez maintenant vous connecter sur:');
    console.log('   • http://localhost:3000/admin/login');
    console.log('   • ou autre page de connexion admin\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    process.exit(1);
  }
}

// Exécuter
createAdmin();
