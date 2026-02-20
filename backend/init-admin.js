require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('./src/models/Admin');

/**
 * 🔧 SCRIPT D'INITIALISATION ADMIN
 * Crée le premier compte administrateur
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createFirstAdmin = async () => {
  try {
    console.log('\n🔐 === CRÉATION DU COMPTE ADMINISTRATEUR ===\n');

    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier s'il existe déjà des admins
    const existingAdmins = await Admin.countDocuments();
    if (existingAdmins > 0) {
      console.log(`⚠️  Il existe déjà ${existingAdmins} admin(s) dans la base de données.`);
      const confirm = await question('Voulez-vous créer un nouvel admin quand même ? (oui/non) : ');
      
      if (confirm.toLowerCase() !== 'oui') {
        console.log('\n❌ Création annulée.');
        rl.close();
        process.exit(0);
      }
    }

    // Collecter les informations
    console.log('Veuillez entrer les informations du nouvel administrateur:\n');
    
    const nom = await question('Nom complet : ');
    if (!nom) {
      console.log('❌ Le nom est requis');
      rl.close();
      process.exit(1);
    }

    const email = await question('Email : ');
    if (!email) {
      console.log('❌ L\'email est requis');
      rl.close();
      process.exit(1);
    }

    // Vérifier si l'email existe déjà
    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      console.log('❌ Cet email est déjà utilisé par un autre admin');
      rl.close();
      process.exit(1);
    }

    const motDePasse = await question('Mot de passe (min. 6 caractères) : ');
    if (!motDePasse || motDePasse.length < 6) {
      console.log('❌ Le mot de passe doit contenir au moins 6 caractères');
      rl.close();
      process.exit(1);
    }

    const roleChoice = await question('Rôle (1=admin, 2=super_admin) [1] : ');
    const role = roleChoice === '2' ? 'super_admin' : 'admin';

    // Créer l'admin
    console.log('\n⏳ Création en cours...');
    
    const admin = await Admin.create({
      nom,
      email,
      motDePasse,
      role
    });

    console.log('\n✅ Administrateur créé avec succès!\n');
    console.log('📋 Informations:');
    console.log('   - ID:', admin._id);
    console.log('   - Nom:', admin.nom);
    console.log('   - Email:', admin.email);
    console.log('   - Rôle:', admin.role);
    console.log('   - Actif:', admin.actif ? 'Oui' : 'Non');
    console.log('\n🔐 Vous pouvez maintenant vous connecter à /admin/login\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur lors de la création de l\'admin:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Lancer le script
createFirstAdmin();
