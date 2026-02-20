# 📦 Guide : Ajouter des Prestations avec Détails

## 🎯 Où ajouter des prestations ?

### Option 1 : Via l'API Backend (Recommandé pour l'admin)

**Étapes :**

1. **Démarrer le backend**
   ```bash
   cd backend
   npm start
   ```

2. **Utiliser Postman, Insomnia ou curl**
   
   **Endpoint :** `POST http://localhost:5001/api/prestations`
   
   **Headers :**
   ```json
   {
     "Content-Type": "application/json",
     "Authorization": "Bearer VOTRE_TOKEN_ADMIN"
   }
   ```

3. **Corps de la requête (exemple complet) :**

```json
{
  "nom": "Pack DJ Premium",
  "categorie": "DJ",
  "description": "Animation DJ professionnelle avec matériel haut de gamme pour une soirée inoubliable. Playlist personnalisée selon vos goûts musicaux.",
  "descriptionCourte": "DJ professionnel avec matériel premium",
  "prixBase": 800,
  "unite": "soirée",
  "image": "/images/prestations/dj-premium.jpg",
  "inclus": [
    "DJ professionnel (6h)",
    "Console Pioneer XDJ",
    "2 enceintes actives 2000W",
    "Micro sans fil",
    "Éclairage LED RGB",
    "Machine à fumée",
    "Playlist sur mesure"
  ],
  "nonInclus": [
    "Transport (en supplément)",
    "Heures supplémentaires"
  ],
  "dureeMin": 4,
  "dureeMax": 12,
  "disponible": true,
  "ordre": 1,
  
  "tarifsParInvites": [
    {
      "min": 0,
      "max": 50,
      "prix": 500,
      "label": "Petit événement (0-50 personnes)"
    },
    {
      "min": 51,
      "max": 100,
      "prix": 800,
      "label": "Moyen événement (51-100 personnes)"
    },
    {
      "min": 101,
      "max": 200,
      "prix": 1200,
      "label": "Grand événement (101-200 personnes)"
    },
    {
      "min": 201,
      "max": null,
      "prix": 1800,
      "label": "Très grand événement (200+ personnes)"
    }
  ],
  
  "caracteristiques": [
    {
      "nom": "Expérience",
      "valeur": "10 ans",
      "icone": "⭐"
    },
    {
      "nom": "Styles musicaux",
      "valeur": "Hip-Hop, Pop, Dance, Gospel",
      "icone": "🎵"
    },
    {
      "nom": "Matériel",
      "valeur": "Pioneer, JBL, Shure",
      "icone": "🎧"
    },
    {
      "nom": "Zone",
      "valeur": "Paris et Île-de-France",
      "icone": "📍"
    }
  ],
  
  "galerie": [
    {
      "url": "/images/galerie/dj-1.jpg",
      "type": "image",
      "description": "Setup complet lors d'un mariage",
      "ordre": 1,
      "miniature": "/images/galerie/thumbs/dj-1-thumb.jpg"
    },
    {
      "url": "/images/galerie/dj-video.mp4",
      "type": "video",
      "description": "Ambiance lors d'une soirée",
      "ordre": 2,
      "miniature": "/images/galerie/thumbs/dj-video-thumb.jpg"
    }
  ],

  "prestatairesAssocies": []
}
```

### Option 2 : Via un script Node.js

Créez un fichier `backend/add-prestation.js` :

```javascript
const mongoose = require('mongoose');
require('dotenv').config();
const Prestation = require('./src/models/Prestation');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elijahgod');

const nouvellePrestation = {
  nom: "Sonorisation Pro",
  categorie: "Sonorisation",
  description: "Système de sonorisation professionnel adapté à votre événement",
  prixBase: 400,
  unite: "soirée",
  
  tarifsParInvites: [
    { min: 0, max: 100, prix: 300, label: "Petit événement" },
    { min: 101, max: 300, prix: 500, label: "Moyen événement" },
    { min: 301, max: null, prix: 800, label: "Grand événement" }
  ],
  
  inclus: [
    "2 enceintes actives 1500W",
    "Table de mixage 12 canaux",
    "3 micros filaires",
    "Câblage complet",
    "Technicien son"
  ],
  
  caracteristiques: [
    { nom: "Puissance", valeur: "3000W RMS", icone: "🔊" },
    { nom: "Marque", valeur: "JBL, Yamaha", icone: "⚡" },
    { nom: "Installation", valeur: "1h avant événement", icone: "⏰" }
  ]
};

async function ajouterPrestation() {
  try {
    const prestation = await Prestation.create(nouvellePrestation);
    console.log('✅ Prestation créée:', prestation.nom);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

ajouterPrestation();
```

**Exécuter le script :**
```bash
cd backend
node add-prestation.js
```

---

## 🎨 Gérer les prestations existantes (Interface Admin)

### Page : `/admin/gestion-prestations`

Une fois connecté en tant qu'admin, accédez à :
```
http://localhost:3000/admin/gestion-prestations
```

**Fonctionnalités disponibles :**

1. **Voir toutes les prestations**
   - Liste complète avec catégories
   - Statut (disponible/indisponible)

2. **Éditer une prestation**
   - Cliquez sur une prestation pour voir ses détails
   - 3 onglets disponibles :
     - 📋 **Prestataires** : Associer des prestataires à la prestation
     - 💰 **Tarifs** : Gérer les tarifs par nombre d'invités
     - 📸 **Galerie** : Ajouter des photos/vidéos

3. **Associer des prestataires**
   - Sélectionnez un prestataire existant
   - Définir sa disponibilité (disponible, sur demande, indisponible)
   - Ordre d'affichage
   - Tarif spécifique (optionnel)

4. **Configurer les tarifs par nombre de personnes**
   - Min : Nombre minimum d'invités
   - Max : Nombre maximum (null = illimité)
   - Prix : Tarif pour cette tranche
   - Label : Nom de la tranche (ex: "Petit événement")

5. **Ajouter des photos/vidéos**
   - URL de l'image/vidéo
   - Type (image ou vidéo)
   - Description
   - Ordre d'affichage

---

## 💰 Calcul automatique des prix

### Comment ça fonctionne ?

Lorsqu'un utilisateur sélectionne une prestation dans le formulaire de devis :

1. **Le système récupère** la prestation avec ses `tarifsParInvites`

2. **L'utilisateur entre** le nombre d'invités à l'étape 5

3. **Le backend calcule** le prix exact via l'endpoint :
   ```
   POST /api/prestations/:id/calculer-prix
   Body: { nombreInvites: 150 }
   ```

4. **Résultat** : Le prix correspondant à la tranche est retourné

**Exemple de calcul :**
```javascript
// Prestation avec tarifsParInvites
tarifsParInvites: [
  { min: 0, max: 50, prix: 500 },
  { min: 51, max: 100, prix: 800 },
  { min: 101, max: 200, prix: 1200 }
]

// Si nombreInvites = 75
// → Prix = 800€ (tranche 51-100)
```

---

## 🎯 Structure des Accessoires/Caractéristiques

Les accessoires sont gérés via le champ `caracteristiques[]` :

```javascript
caracteristiques: [
  {
    nom: "Type d'accessoire",
    valeur: "Description/valeur",
    icone: "🎤" // Emoji ou code icône
  }
]
```

**Exemples :**
- `{ nom: "Micros", valeur: "3 micros sans fil Shure", icone: "🎤" }`
- `{ nom: "Éclairage", valeur: "8 projecteurs LED DMX", icone: "💡" }`
- `{ nom: "Câbles", valeur: "50m XLR + 30m Jack", icone: "🔌" }`

---

## ⚠️ Notes importantes

### Authentification
Les routes de création/modification de prestations nécessitent une authentification admin. Assurez-vous d'avoir :
- Un compte admin créé
- Un token JWT valide dans le header `Authorization`

### Images
- Placez les images dans `/frontend/public/images/prestations/`
- Ou utilisez des URLs absolues (Cloudinary, etc.)
- Format recommandé : JPG/PNG, max 2MB

### Catégories disponibles
```
'DJ', 'Photographe', 'Vidéaste', 'Animateur', 
'Groupe de louange', 'Wedding planner', 'Traiteur',
'Sonorisation', 'Éclairage', 'Décoration', 'Animation',
'Pack Complet', 'Location matériel', 'Autre'
```

---

## 🚀 Prochaines étapes

1. ✅ Créer des prestations via l'API ou script
2. ✅ Associer des prestataires via l'interface admin
3. ✅ Configurer les tarifs par nombre d'invités
4. ✅ Ajouter la galerie photos/vidéos
5. ✅ Les prestations apparaissent automatiquement sur :
   - `/prestations` (catalogue public)
   - `/devis` (formulaire de demande)
   - `/admin/gestion-prestations` (gestion)

---

## 📞 Besoin d'aide ?

- Backend : `backend/src/models/Prestation.js` (modèle complet)
- Controller : `backend/src/controllers/prestationController.js`
- Routes : `backend/src/routes/prestationRoutes.js`
- Interface admin : `frontend/src/pages/GestionPrestationsAdmin.js`
