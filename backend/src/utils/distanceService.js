const NodeGeocoder = require('node-geocoder');

/**
 * 📍 SERVICE CALCUL DISTANCE ET FRAIS KILOMÉTRIQUES
 * Calcule la distance entre deux adresses et les frais associés
 */

// Configuration du géocodeur (utilise OpenStreetMap - gratuit)
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null
});

// Adresse de base ELIJAH'GOD (à configurer dans .env)
const ADRESSE_BASE = process.env.ADRESSE_ENTREPRISE || 'Paris, France';

// Tarif kilométrique (en euros par km)
const TARIF_KM = parseFloat(process.env.TARIF_KILOMETRIQUE) || 0.50; // 0.50€/km par défaut
const KM_GRATUITS = parseInt(process.env.KM_GRATUITS) || 30; // 30 km gratuits

/**
 * Calcule la distance entre deux points géographiques (formule de Haversine)
 * @param {number} lat1 - Latitude point 1
 * @param {number} lon1 - Longitude point 1
 * @param {number} lat2 - Latitude point 2
 * @param {number} lon2 - Longitude point 2
 * @returns {number} Distance en kilomètres
 */
function calculerDistanceHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
}

/**
 * Géocode une adresse pour obtenir ses coordonnées
 * @param {string} adresse - Adresse à géocoder
 * @returns {Promise<{latitude: number, longitude: number, adresseComplete: string}>}
 */
async function geocoderAdresse(adresse) {
  try {
    const resultats = await geocoder.geocode(adresse);
    
    if (!resultats || resultats.length === 0) {
      throw new Error('Adresse introuvable');
    }
    
    const resultat = resultats[0];
    return {
      latitude: resultat.latitude,
      longitude: resultat.longitude,
      adresseComplete: resultat.formattedAddress || adresse,
      ville: resultat.city,
      codePostal: resultat.zipcode,
      pays: resultat.country
    };
  } catch (error) {
    console.error('❌ Erreur géocodage:', error.message);
    throw new Error('Impossible de localiser l\'adresse');
  }
}

/**
 * Calcule la distance et les frais kilométriques entre deux adresses
 * @param {string} adresseDepart - Adresse de départ (entreprise)
 * @param {string} adresseArrivee - Adresse d'arrivée (client)
 * @returns {Promise<Object>} Objet avec distance, frais, détails
 */
async function calculerFraisKilometriques(adresseDepart = ADRESSE_BASE, adresseArrivee) {
  try {
    console.log(`📍 Calcul distance: ${adresseDepart} → ${adresseArrivee}`);
    
    // Géocoder les deux adresses
    const [coordDepart, coordArrivee] = await Promise.all([
      geocoderAdresse(adresseDepart),
      geocoderAdresse(adresseArrivee)
    ]);
    
    // Calculer la distance
    const distanceKm = calculerDistanceHaversine(
      coordDepart.latitude,
      coordDepart.longitude,
      coordArrivee.latitude,
      coordArrivee.longitude
    );
    
    // Calculer les frais (aller-retour)
    const distanceAllerRetour = distanceKm * 2;
    const kmFacturables = Math.max(0, distanceAllerRetour - KM_GRATUITS);
    const frais = Math.round(kmFacturables * TARIF_KM * 100) / 100;
    
    const resultat = {
      distanceSimple: distanceKm,
      distanceAllerRetour: distanceAllerRetour,
      kmGratuits: KM_GRATUITS,
      kmFacturables: kmFacturables,
      tarifParKm: TARIF_KM,
      fraisTotal: frais,
      adresseDepart: {
        adresse: coordDepart.adresseComplete,
        ville: coordDepart.ville,
        latitude: coordDepart.latitude,
        longitude: coordDepart.longitude
      },
      adresseArrivee: {
        adresse: coordArrivee.adresseComplete,
        ville: coordArrivee.ville,
        codePostal: coordArrivee.codePostal,
        latitude: coordArrivee.latitude,
        longitude: coordArrivee.longitude
      },
      calculeAt: new Date()
    };
    
    console.log(`✅ Distance: ${distanceKm}km (A/R: ${distanceAllerRetour}km) - Frais: ${frais}€`);
    
    return resultat;
    
  } catch (error) {
    console.error('❌ Erreur calcul frais kilométriques:', error.message);
    
    // Retourner des frais par défaut en cas d'erreur
    return {
      distanceSimple: 0,
      distanceAllerRetour: 0,
      kmGratuits: KM_GRATUITS,
      kmFacturables: 0,
      tarifParKm: TARIF_KM,
      fraisTotal: 0,
      erreur: error.message,
      adresseDepart: { adresse: adresseDepart },
      adresseArrivee: { adresse: adresseArrivee },
      calculeAt: new Date()
    };
  }
}

/**
 * Vérifie si une adresse est valide
 * @param {string} adresse - Adresse à vérifier
 * @returns {Promise<boolean>}
 */
async function verifierAdresse(adresse) {
  try {
    await geocoderAdresse(adresse);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  calculerFraisKilometriques,
  geocoderAdresse,
  verifierAdresse,
  ADRESSE_BASE,
  TARIF_KM,
  KM_GRATUITS
};
