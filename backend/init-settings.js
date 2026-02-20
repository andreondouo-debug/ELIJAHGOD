require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('./src/models/Settings');

/**
 * 🚀 Script d'initialisation des paramètres
 * Lance ce script pour créer/mettre à jour les paramètres du site
 */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  }
};

const initSettings = async () => {
  try {
    console.log('\n🎯 Initialisation des paramètres ELIJAH\'GOD...\n');
    
    // Vérifier si des paramètres existent déjà
    let settings = await Settings.findOne();
    
    if (settings) {
      console.log('⚠️  Des paramètres existent déjà !');
      console.log('   Pour réinitialiser, supprimez-les d\'abord.\n');
      
      console.log('📊 Paramètres actuels :');
      console.log('   Entreprise:', settings.entreprise.nom);
      console.log('   Contact:', settings.contact.email);
      console.log('   Téléphone:', settings.contact.telephone);
      console.log('   Dernière MAJ:', settings.derniereMiseAJour?.date || 'N/A');
      
      return settings;
    }
    
    // Créer les paramètres par défaut
    settings = await Settings.create({
      entreprise: {
        nom: "ELIJAH'GOD",
        slogan: "Prestations événementielles de qualité professionnelle",
        description: "DJ, sonorisation et animation pour tous vos événements : mariages, anniversaires, soirées d'entreprise et plus encore.",
        logo: "/images/logo.png",
        banniere: "/images/banniere.jpg"
      },
      contact: {
        email: "contact@elijahgod.com",
        telephone: "+33 X XX XX XX XX",
        adresse: {
          rue: "À compléter",
          codePostal: "",
          ville: "",
          pays: "France"
        },
        horaires: "Disponible 7j/7 - Réponse sous 24h"
      },
      reseauxSociaux: {
        facebook: "https://facebook.com/elijahgod",
        instagram: "https://instagram.com/elijahgod",
        youtube: "https://youtube.com/@elijahgod"
      },
      devis: {
        validiteJours: 30,
        acompteMinimum: 30,
        delaiAnnulationJours: 7,
        messageConfirmation: "✅ Merci pour votre demande de devis ! Nous l'avons bien reçue et nous vous répondrons sous 24 à 48 heures avec une proposition personnalisée.",
        cgv: "Conditions Générales de Vente à personnaliser selon vos besoins."
      },
      tarifs: {
        fraisDeplacementParKm: 0.50,
        distanceGratuiteKm: 50,
        supplementWeekendPourcentage: 20,
        supplementNuitPourcentage: 30,
        tarifHoraire: 80
      },
      messages: {
        accueil: {
          titre: "Bienvenue chez ELIJAH'GOD",
          sousTitre: "Votre spécialiste en prestations événementielles",
          description: "DJ professionnel, sonorisation haut de gamme et animation pour rendre vos événements inoubliables."
        },
        apropos: "ELIJAH'GOD est votre partenaire de confiance pour tous vos événements. Avec des années d'expérience dans le domaine de l'animation et de la sonorisation, nous mettons notre expertise à votre service pour créer des moments magiques et inoubliables.",
        piedDePage: "© 2026 ELIJAH'GOD - Tous droits réservés - Prestations événementielles professionnelles"
      },
      emailConfig: {
        emailAdmin: process.env.ADMIN_EMAIL || "admin@elijahgod.com",
        emailNotifications: true,
        emailSignature: "L'équipe ELIJAH'GOD\nPrestations événementielles\ncontact@elijahgod.com"
      },
      planning: {
        heureOuvertureDefaut: "09:00",
        heureFermetureDefaut: "02:00",
        joursNonTravailles: [],
        delaiReservationMinJours: 7
      },
      site: {
        maintenanceMode: false,
        messageMaintenace: "🔧 Site en maintenance. Nous revenons très bientôt !",
        afficherPrix: true,
        afficherAvis: true,
        couleurPrincipale: "#1a1a2e",
        couleurSecondaire: "#16213e",
        couleurAccent: "#0f3460"
      },
      seo: {
        metaTitre: "ELIJAH'GOD - DJ et Sonorisation pour Événements | Mariages, Anniversaires",
        metaDescription: "Prestations DJ professionnelles, sonorisation et animation pour mariages, anniversaires et événements en France. Devis gratuit en ligne.",
        motsCles: ["DJ mariage", "sonorisation événement", "animation soirée", "DJ professionnel", "location sono", "prestation musicale"]
      },
      stats: {
        totalDevis: 0,
        totalReservations: 0,
        totalClients: 0
      },
      derniereMiseAJour: {
        date: new Date(),
        par: "Système (initialisation)"
      }
    });
    
    console.log('✅ Paramètres créés avec succès !\n');
    
    console.log('📊 Résumé de la configuration :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🏢 Entreprise    : ${settings.entreprise.nom}`);
    console.log(`✉️  Email        : ${settings.contact.email}`);
    console.log(`📞 Téléphone     : ${settings.contact.telephone}`);
    console.log(`📅 Validité devis: ${settings.devis.validiteJours} jours`);
    console.log(`💰 Tarif horaire : ${settings.tarifs.tarifHoraire}€`);
    console.log(`🎨 Couleur       : ${settings.site.couleurPrincipale}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('⚙️  Pensez à personnaliser ces paramètres via :');
    console.log('   • L\'interface admin (à venir)');
    console.log('   • L\'API : PUT /api/settings');
    console.log('   • Directement en base de données\n');
    
    return settings;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await initSettings();
  
  console.log('✅ Initialisation terminée !\n');
  process.exit(0);
};

// Exécution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { initSettings };
