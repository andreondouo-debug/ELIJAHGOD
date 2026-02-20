require('dotenv').config();
const mongoose = require('mongoose');
const Materiel = require('./src/models/Materiel');

const MONGODB_URI = process.env.MONGODB_URI;

// Matériel / Accessoires de base pour ELIJAH'GOD
const materielInitial = [
  {
    nom: 'Enceinte Amplifiée 1000W',
    categorie: 'Sonorisation',
    sousCategorie: 'Enceinte',
    description: 'Enceinte amplifiée professionnelle de 1000W RMS. Idéale pour soirées jusqu\'à 200 personnes. Son puissant et clair avec entrées mixtes (XLR, Jack, RCA).',
    caracteristiques: [
      { nom: 'Puissance', valeur: '1000W RMS' },
      { nom: 'Connectivité', valeur: 'XLR, Jack, RCA, Bluetooth' },
      { nom: 'Poids', valeur: '18kg' },
      { nom: 'Dimensions', valeur: '40 x 35 x 60 cm' }
    ],
    prixLocation: {
      jour: 50,
      weekend: 120,
      semaine: 200,
      caution: 300
    },
    quantiteDisponible: 4,
    quantiteTotale: 4,
    etat: 'excellent',
    marque: 'RCF',
    modele: 'ART 715-A MK4',
    anneeFabrication: 2022,
    prestataire: null
  },
  {
    nom: 'Table de Mixage Numérique 16 Canaux',
    categorie: 'Sonorisation',
    sousCategorie: 'Console',
    description: 'Console de mixage numérique 16 canaux avec effets intégrés, égaliseur paramétrique sur chaque canal et interface USB pour enregistrement.',
    caracteristiques: [
      { nom: 'Canaux', valeur: '16 canaux' },
      { nom: 'Effets', valeur: '16 effets intégrés' },
      { nom: 'Connectivité', valeur: 'USB, MIDI, XLR' },
      { nom: 'Écran', valeur: 'LCD couleur 7"' }
    ],
    prixLocation: {
      jour: 80,
      weekend: 180,
      semaine: 350,
      caution: 500
    },
    quantiteDisponible: 2,
    quantiteTotale: 2,
    etat: 'excellent',
    marque: 'Behringer',
    modele: 'X32 Compact',
    anneeFabrication: 2021,
    prestataire: null
  },
  {
    nom: 'Projecteur LED PAR 64 RGBW',
    categorie: 'Éclairage',
    sousCategorie: 'Projecteur PAR',
    description: 'Projecteur PAR LED 64 RGBW avec 54 LEDs haute luminosité. Contrôle DMX, modes automatiques et maître/esclave. Parfait pour éclairages d\'ambiance.',
    caracteristiques: [
      { nom: 'LEDs', valeur: '54x 3W RGBW' },
      { nom: 'Angle', valeur: '25°' },
      { nom: 'DMX', valeur: '8 canaux' },
      { nom: 'Consommation', valeur: '200W' }
    ],
    prixLocation: {
      jour: 15,
      weekend: 35,
      semaine: 60,
      caution: 100
    },
    quantiteDisponible: 12,
    quantiteTotale: 12,
    etat: 'excellent',
    marque: 'Showtec',
    modele: 'EventLITE 4/10 Q4',
    anneeFabrication: 2023,
    prestataire: null
  },
  {
    nom: 'Lyre LED Beam Moving Head',
    categorie: 'Éclairage',
    sousCategorie: 'Lyre',
    description: 'Lyre LED beam 230W avec prisme, gobo, zoom motorisé. Rotation pan/tilt rapide. Contrôle DMX 16 canaux. Parfaite pour effets dynamiques.',
    caracteristiques: [
      { nom: 'Source', valeur: 'LED 230W' },
      { nom: 'Prisme', valeur: '3 faces rotatives' },
      { nom: 'Gobos', valeur: '14 gobos + open' },
      { nom: 'Pan/Tilt', valeur: '540°/270°' }
    ],
    prixLocation: {
      jour: 60,
      weekend: 140,
      semaine: 250,
      caution: 400
    },
    quantiteDisponible: 4,
    quantiteTotale: 4,
    etat: 'bon',
    marque: 'Chauvet',
    modele: 'Intimidator Spot 375Z IRC',
    anneeFabrication: 2020,
    prestataire: null
  },
  {
    nom: 'Machine à Fumée 1500W',
    categorie: 'Effets spéciaux',
    sousCategorie: 'Machine à fumée',
    description: 'Machine à fumée professionnelle 1500W avec télécommande sans fil. Temps de chauffe 3 minutes. Réservoir 2.5L pour 40min d\'autonomie.',
    caracteristiques: [
      { nom: 'Puissance', valeur: '1500W' },
      { nom: 'Débit', valeur: '550m³/min' },
      { nom: 'Réservoir', valeur: '2.5L' },
      { nom: 'Télécommande', valeur: 'Sans fil incluse' }
    ],
    prixLocation: {
      jour: 25,
      weekend: 55,
      semaine: 90,
      caution: 150
    },
    quantiteDisponible: 3,
    quantiteTotale: 3,
    etat: 'excellent',
    marque: 'Antari',
    modele: 'Z-1520',
    anneeFabrication: 2022,
    prestataire: null
  },
  {
    nom: 'Micro Sans Fil HF - Set 2 Micros',
    categorie: 'Sonorisation',
    sousCategorie: 'Microphone',
    description: 'Système sans fil HF avec 2 micros main. Portée 100m, fréquence UHF stable. Batterie rechargeable 8h d\'autonomie. Récepteur double avec écran LCD.',
    caracteristiques: [
      { nom: 'Type', valeur: 'UHF True Diversity' },
      { nom: 'Portée', valeur: '100m' },
      { nom: 'Autonomie', valeur: '8 heures' },
      { nom: 'Fréquences', valeur: '2 x 16 canaux' }
    ],
    prixLocation: {
      jour: 40,
      weekend: 90,
      semaine: 150,
      caution: 250
    },
    quantiteDisponible: 3,
    quantiteTotale: 3,
    etat: 'excellent',
    marque: 'Sennheiser',
    modele: 'EW 135 G4',
    anneeFabrication: 2021,
    prestataire: null
  },
  {
    nom: 'Stroboscope LED 132W',
    categorie: 'Effets spéciaux',
    sousCategorie: 'Stroboscope',
    description: 'Stroboscope LED 132W ultra lumineux. Vitesse variable, mode son actif, DMX. Parfait pour créer des effets de flash puissants en soirée.',
    caracteristiques: [
      { nom: 'LEDs', valeur: '132x 1W blanc' },
      { nom: 'Flash', valeur: '1-20 Hz' },
      { nom: 'DMX', valeur: '1 canal' },
      { nom: 'Son actif', valeur: 'Oui' }
    ],
    prixLocation: {
      jour: 20,
      weekend: 45,
      semaine: 75,
      caution: 120
    },
    quantiteDisponible: 2,
    quantiteTotale: 2,
    etat: 'bon',
    marque: 'Eurolite',
    modele: 'LED Strobe COB PRO',
    anneeFabrication: 2021,
    prestataire: null
  },
  {
    nom: 'Contrôleur DMX 512 Canaux',
    categorie: 'Éclairage',
    sousCategorie: 'Console lumière',
    description: 'Console DMX 512 canaux pour pilotage complet de l\'éclairage. 30 scènes programmables, faders motorisés, interface USB. Idéal pour spectacles.',
    caracteristiques: [
      { nom: 'Canaux', valeur: '512 canaux DMX' },
      { nom: 'Scènes', valeur: '30 programmables' },
      { nom: 'Faders', valeur: '12 motorisés' },
      { nom: 'USB', valeur: 'Sauvegarde sur clé' }
    ],
    prixLocation: {
      jour: 70,
      weekend: 160,
      semaine: 280,
      caution: 450
    },
    quantiteDisponible: 1,
    quantiteTotale: 1,
    etat: 'excellent',
    marque: 'Avolites',
    modele: 'Titan Mobile',
    anneeFabrication: 2022,
    prestataire: null
  },
  {
    nom: 'Boule à Facettes Ø50cm avec Moteur',
    categorie: 'Décoration',
    sousCategorie: 'Effet miroir',
    description: 'Boule à facettes classique en verre 50cm de diamètre avec moteur rotatif silencieux. Éclairage LED spot inclus. Parfait pour ambiance disco.',
    caracteristiques: [
      { nom: 'Diamètre', valeur: '50cm' },
      { nom: 'Facettes', valeur: 'Miroir verre 10x10mm' },
      { nom: 'Moteur', valeur: 'Silencieux variable' },
      { nom: 'Spot', valeur: 'LED 10W inclus' }
    ],
    prixLocation: {
      jour: 15,
      weekend: 35,
      semaine: 60,
      caution: 80
    },
    quantiteDisponible: 5,
    quantiteTotale: 5,
    etat: 'bon',
    marque: 'Ibiza',
    modele: 'MB050',
    anneeFabrication: 2019,
    prestataire: null
  },
  {
    nom: 'Écran LED Géant 3x2m',
    categorie: 'Vidéo projecteur',
    sousCategorie: 'Écran LED',
    description: 'Écran LED modulaire haute résolution P3.9. Installation rapide avec structure autoportante. Idéal pour projections vidéo en extérieur ou intérieur.',
    caracteristiques: [
      { nom: 'Dimensions', valeur: '3m x 2m' },
      { nom: 'Pixel pitch', valeur: 'P3.9 (3.9mm)' },
      { nom: 'Luminosité', valeur: '5000 nits' },
      { nom: 'Résolution', valeur: '768 x 512px' }
    ],
    prixLocation: {
      jour: 300,
      weekend: 700,
      semaine: 1200,
      caution: 2000
    },
    quantiteDisponible: 1,
    quantiteTotale: 1,
    etat: 'excellent',
    marque: 'Absen',
    modele: 'A3 Pro',
    anneeFabrication: 2023,
    prestataire: null
  }
];

async function initMateriel() {
  try {
    console.log('🎯 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connecté\n');

    console.log('🎯 Suppression de l\'ancien matériel...');
    await Materiel.deleteMany({ prestataire: null }); // Ne supprimer que le matériel sans prestataire
    console.log('✅ Ancien matériel supprimé\n');

    console.log('🎯 Création du matériel initial...');
    const materiels = await Materiel.insertMany(materielInitial);
    console.log(`✅ ${materiels.length} matériels créés avec succès !\n`);

    console.log('📊 Résumé du matériel par catégorie :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const categories = [...new Set(materiels.map(m => m.categorie))];
    categories.forEach(cat => {
      const count = materiels.filter(m => m.categorie === cat).length;
      const total = materiels
        .filter(m => m.categorie === cat)
        .reduce((sum, m) => sum + m.quantiteTotale, 0);
      console.log(`${cat}: ${count} type(s) - ${total} unité(s) totales`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Initialisation terminée !');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

initMateriel();
