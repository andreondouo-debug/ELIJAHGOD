require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

/**
 * 🔧 SCRIPT RAPIDE DE CRÉATION ADMIN
 * Crée un admin de test rapidement
 */

const createQuickAdmin = async () => {
  try {
    console.log('\n🔐 === CRÉATION ADMIN RAPIDE ===\n');

    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Données admin par défaut
    const adminData = {
      nom: 'Admin Test',
      email: 'admin@elijahgod.com',
      motDePasse: 'admin123',
      role: 'super_admin'
    };

    // Vérifier si l'email existe déjà
    const emailExists = await Admin.findOne({ email: adminData.email });
    if (emailExists) {
      console.log('⚠️  Un admin avec cet email existe déjà');
      console.log('📋 Informations existantes:');
      console.log('   - ID:', emailExists._id);
      console.log('   - Nom:', emailExists.nom);
      console.log('   - Email:', emailExists.email);
      console.log('   - Rôle:', emailExists.role);
      console.log('\n💡 Pour tester, utilisez ces identifiants pour vous connecter\n');
      process.exit(0);
    }

    // Créer l'admin
    console.log('⏳ Création en cours...');
    
    const admin = await Admin.create(adminData);

    console.log('\n✅ Administrateur créé avec succès!\n');
    console.log('📋 Informations de connexion:');
    console.log('   - Email:', adminData.email);
    console.log('   - Mot de passe:', adminData.motDePasse);
    console.log('   - Rôle:', admin.role);
    console.log('\n🔐 Connectez-vous à: http://localhost:3000/admin/login\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
};

// Lancer le script
createQuickAdmin();
