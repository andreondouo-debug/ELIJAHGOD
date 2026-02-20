require('dotenv').config();
const mongoose = require('mongoose');
const Prestation = require('./src/models/Prestation');

const MONGODB_URI = process.env.MONGODB_URI;

// Prestations de base pour ELIJAH'GOD
const prestationsInitiales = [
  {
    nom: 'DJ Mariage',
    categorie: 'DJ',
    description: 'Animation DJ complète pour votre mariage avec playlist personnalisée, micro sans fil pour les discours, et éclairage d\'ambiance. Je m\'adapte à tous les styles musicaux pour créer une ambiance festive et inoubliable.',
    descriptionCourte: 'Animation DJ professionnelle pour votre mariage',
    prixBase: 600,
    unite: 'soirée',
    inclus: [
      'Matériel DJ professionnel',
      'Système de sonorisation adapté',
      'Éclairage d\'ambiance LED',
      'Micro sans fil pour discours',
      'Playlist personnalisée selon vos goûts',
      'Animation de la soirée',
      'Durée : jusqu\'à 6 heures'
    ],
    disponible: true
  },
  {
    nom: 'DJ Anniversaire',
    categorie: 'DJ',
    description: 'Animation DJ pour anniversaire avec une ambiance sur mesure. Que ce soit pour un anniversaire d\'enfant, d\'adolescent ou d\'adulte, je crée l\'ambiance parfaite avec une sélection musicale adaptée.',
    descriptionCourte: 'DJ pour fêtes d\'anniversaire de tous âges',
    prixBase: 350,
    unite: 'soirée',
    inclus: [
      'Matériel DJ',
      'Sonorisation',
      'Éclairage LED',
      'Playlist personnalisée',
      'Animation adaptée à l\'âge',
      'Durée : jusqu\'à 4 heures'
    ],
    disponible: true
  },
  {
    nom: 'DJ Soirée Entreprise',
    categorie: 'DJ',
    description: 'Animation DJ pour événements d\'entreprise : séminaires, soirées de gala, anniversaires d\'entreprise, inaugurations. Une ambiance professionnelle et festive adaptée à votre image.',
    descriptionCourte: 'Animation professionnelle pour vos événements corporate',
    prixBase: 500,
    unite: 'soirée',
    inclus: [
      'Matériel DJ professionnel',
      'Sonorisation de qualité',
      'Éclairage sobre ou festif selon besoin',
      'Micro pour prises de parole',
      'Playlist adaptée à l\'événement',
      'Durée : jusqu\'à 5 heures'
    ],
    disponible: true
  },
  {
    nom: 'Sonorisation Concert',
    categorie: 'Sonorisation',
    description: 'Location de système de sonorisation complet pour concerts et spectacles. Matériel professionnel avec enceintes, amplificateurs, table de mixage, et micros. Installation et réglage inclus.',
    descriptionCourte: 'Système de sono professionnel pour concerts',
    prixBase: 400,
    unite: 'forfait',
    inclus: [
      'Enceintes amplifiées professionnelles',
      'Table de mixage numérique',
      'Pack de microphones (filaires et sans fil)',
      'Pieds de micros et câblage',
      'Installation et réglages',
      'Assistance technique sur place'
    ],
    disponible: true
  },
  {
    nom: 'Sonorisation Conférence',
    categorie: 'Sonorisation',
    description: 'Solution de sonorisation pour conférences, séminaires et présentations. Idéal pour assurer une bonne audibilité dans des salles de toutes tailles.',
    descriptionCourte: 'Sono pour conférences et séminaires',
    prixBase: 200,
    unite: 'journée',
    inclus: [
      'Enceintes amplifiées',
      'Micros sans fil (main + cravate)',
      'Pupitre avec micro',
      'Retours de scène si besoin',
      'Installation discrète',
      'Technicien sur place'
    ],
    disponible: true
  },
  {
    nom: 'Pack Sono Petit Événement',
    categorie: 'Sonorisation',
    description: 'Pack de sonorisation pour petits événements jusqu\'à 50 personnes : anniversaires, réunions familiales, petites fêtes. Système compact mais puissant.',
    descriptionCourte: 'Pack sono pour événements jusqu\'à 50 personnes',
    prixBase: 150,
    unite: 'forfait',
    inclus: [
      'Enceintes amplifiées compactes',
      'Micro sans fil',
      'Lecteur USB/Bluetooth',
      'Câblage',
      'Installation simple',
      'Location 24h'
    ],
    disponible: true
  },
  {
    nom: 'Éclairage Scène Complet',
    categorie: 'Éclairage',
    description: 'Pack d\'éclairage professionnel pour scènes : projecteurs LED, jeux de lumière, machine à fumée, et contrôleur DMX. Parfait pour concerts et spectacles.',
    descriptionCourte: 'Éclairage scénique professionnel',
    prixBase: 350,
    unite: 'forfait',
    inclus: [
      'Projecteurs LED RGB (x8)',
      'Têtes mobiles (x2)',
      'Machine à fumée',
      'Stroboscope',
      'Contrôleur DMX',
      'Pieds d\'éclairage',
      'Installation et programmation'
    ],
    disponible: true
  },
  {
    nom: 'Éclairage Ambiance Soirée',
    categorie: 'Éclairage',
    description: 'Éclairage d\'ambiance pour soirées privées : mariages, anniversaires, fêtes. Projecteurs LED multicolores pour créer une atmosphère festive.',
    descriptionCourte: 'Éclairage festif pour soirées privées',
    prixBase: 180,
    unite: 'soirée',
    inclus: [
      'Projecteurs LED couleur (x4)',
      'Jeux de lumière dansants',
      'Boule à facettes',
      'Machine à bulles (optionnel)',
      'Mode automatique ou synchronisé à la musique',
      'Installation'
    ],
    disponible: true
  },
  {
    nom: 'Animation Complète Mariage',
    categorie: 'Animation',
    description: 'Formule all-inclusive pour votre mariage : DJ, sonorisation complète, éclairage d\'ambiance, animation de la soirée avec jeux et surprises. Je m\'occupe de tout pour une soirée parfaite.',
    descriptionCourte: 'Formule complète DJ + Sono + Éclairage + Animation',
    prixBase: 900,
    unite: 'soirée',
    inclus: [
      'DJ professionnel',
      'Sonorisation puissante',
      'Éclairage LED complet',
      'Micro sans fil',
      'Animation de soirée',
      'Jeux et surprises',
      'Playlist personnalisée',
      'Durée : jusqu\'à 7 heures',
      'Consultation pré-mariage'
    ],
    disponible: true
  },
  {
    nom: 'Animation Soirée à Thème',
    categorie: 'Animation',
    description: 'Animation sur mesure pour soirées à thème : années 80/90, disco, tropical, etc. Décoration lumineuse adaptée et playlist spéciale thème.',
    descriptionCourte: 'Soirée thématique avec animation et déco lumineuse',
    prixBase: 450,
    unite: 'soirée',
    inclus: [
      'DJ spécialisé thème',
      'Sonorisation',
      'Éclairage thématique',
      'Accessoires de déco lumineuse',
      'Playlist exclusive au thème',
      'Animation adaptée',
      'Durée : jusqu\'à 5 heures'
    ],
    disponible: true
  }
];

async function initPrestations() {
  try {
    console.log('🎯 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connecté\n');

    console.log('🎯 Suppression des anciennes prestations...');
    await Prestation.deleteMany({});
    console.log('✅ Anciennes prestations supprimées\n');

    console.log('🎯 Création des prestations initiales...');
    const prestations = await Prestation.insertMany(prestationsInitiales);
    console.log(`✅ ${prestations.length} prestations créées avec succès !\n`);

    console.log('📊 Résumé des prestations par catégorie :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const categories = [...new Set(prestations.map(p => p.categorie))];
    categories.forEach(cat => {
      const count = prestations.filter(p => p.categorie === cat).length;
      console.log(`${cat}: ${count} prestation(s)`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Initialisation terminée !');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

initPrestations();
