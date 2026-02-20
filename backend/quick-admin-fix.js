require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

/**
 * 🔐 CRÉATION RAPIDE D'UN ADMIN DANS LA BONNE COLLECTION
 */

async function createAdmin() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const adminData = {
      nom: 'Randy ODOUNGA',
      email: 'odoungaetoumbi@gmail.com',
      motDePasse: 'Odoungade1994',
      role: 'super_admin',
      actif: true
    };

    // Vérifier si l'admin existe déjà
    const existing = await Admin.findOne({ email: adminData.email });
    
    if (existing) {
      console.log('⚠️  Admin existant trouvé, mise à jour...');
      existing.nom = adminData.nom;
      existing.motDePasse = adminData.motDePasse; // sera hashé par le pre-save hook
      existing.role = adminData.role;
      existing.actif = true;
      await existing.save();
      console.log('✅ Admin mis à jour avec succès!\n');
    } else {
      console.log('🆕 Création d\'un nouvel admin...');
      const admin = new Admin(adminData);
      await admin.save();
      console.log('✅ Admin créé avec succès!\n');
    }

    console.log('📋 INFORMATIONS DE CONNEXION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Nom: ${adminData.nom}`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Mot de passe: ${adminData.motDePasse}`);
    console.log(`🛡️  Rôle: ${adminData.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Connexion admin: http://localhost:3000/admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createAdmin();
