# 🎨 Guide Rapide : Ajouter et Modifier des Prestations

## 📍 ACCÈS RAPIDE

### Via l'Interface Admin (Recommandé) 🖥️

1. **Connectez-vous en tant qu'admin**
   ```
   URL: http://localhost:3000/admin/login
   Email: admin@elijahgod.com
   Mot de passe: [votre mot de passe admin]
   ```

2. **Accédez au dashboard**
   ```
   http://localhost:3000/admin/dashboard
   ```

3. **Cliquez sur "Prestations avancées"**
   ```
   http://localhost:3000/admin/prestations-avancees
   ```

## ✨ Fonctionnalités disponibles

### 📋 Sur la page Prestations Avancées

**1. Liste des prestations existantes**
- Voir toutes les prestations
- Catégories affichées
- Statut (disponible/indisponible)

**2. Cliquer sur une prestation pour l'éditer**
   
   **Onglet "Prestataires" :**
   - ➕ Ajouter un prestataire associé
   - Sélectionner le prestataire
   - Définir sa disponibilité (disponible, sur demande, indisponible)
   - Ordre d'affichage
   - Tarif spécifique (optionnel)

   **Onglet "Tarifs" :**
   - ➕ Ajouter des tarifs par nombre d'invités
   - Min : Nombre minimum d'invités (ex: 0)
   - Max : Nombre maximum (null = illimité)
   - Prix : Montant pour cette tranche
   - Label : Nom de la tranche (ex: "Petit événement")
   
   **Exemple :**
   ```
   0-50 personnes    → 500€  (Petit événement)
   51-100 personnes  → 800€  (Moyen événement)
   101-200 personnes → 1200€ (Grand événement)
   201+ personnes    → 1800€ (Très grand événement)
   ```

   **Onglet "Galerie" :**
   - ➕ Ajouter des photos/vidéos
   - URL de l'image ou vidéo
   - Type (image ou vidéo)
   - Description
   - Ordre d'affichage

## 🚀 Ajouter une nouvelle prestation

### Méthode 1 : Via Postman/Insomnia

**Endpoint :** `POST http://localhost:5001/api/prestations`

**Headers :**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer VOTRE_TOKEN_ADMIN"
}
```

**Body (exemple complet) :**
```json
{
  "nom": "DJ Premium",
  "categorie": "DJ",
  "description": "Animation DJ professionnelle avec matériel haut de gamme",
  "descriptionCourte": "DJ pro avec matériel premium",
  "prixBase": 800,
  "unite": "soirée",
  "inclus": [
    "DJ professionnel (6h)",
    "Console Pioneer",
    "Enceintes 2000W",
    "Micro sans fil",
    "Éclairage LED"
  ],
  "disponible": true,
  "tarifsParInvites": [
    { "min": 0, "max": 50, "prix": 500, "label": "Petit" },
    { "min": 51, "max": 100, "prix": 800, "label": "Moyen" },
    { "min": 101, "max": null, "prix": 1200, "label": "Grand" }
  ],
  "caracteristiques": [
    { "nom": "Expérience", "valeur": "10 ans", "icone": "⭐" },
    { "nom": "Styles", "valeur": "Hip-Hop, Pop, Dance", "icone": "🎵" }
  ]
}
```

### Méthode 2 : Via Script Node.js

Créez `backend/add-prestation.js` :

```javascript
const mongoose = require('mongoose');
require('dotenv').config();
const Prestation = require('./src/models/Prestation');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elijahgod');

const prestation = {
  nom: "Sonorisation Pro",
  categorie: "Sonorisation",
  description: "Système audio professionnel",
  prixBase: 400,
  unite: "soirée",
  tarifsParInvites: [
    { min: 0, max: 100, prix: 300, label: "Petit" },
    { min: 101, max: 300, prix: 500, label: "Moyen" },
    { min: 301, max: null, prix: 800, label: "Grand" }
  ],
  inclus: [
    "2 enceintes 1500W",
    "Table de mixage",
    "3 micros",
    "Technicien"
  ]
};

async function ajouter() {
  try {
    const p = await Prestation.create(prestation);
    console.log('✅ Prestation créée:', p.nom);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

ajouter();
```

**Exécuter :**
```bash
cd backend
node add-prestation.js
```

## 📝 Modifier une prestation existante

### Via l'interface admin :
1. Allez sur `/admin/prestations-avancees`
2. Cliquez sur la prestation
3. Modifiez dans les onglets
4. Cliquez sur "Enregistrer"

### Via API :

**Endpoint :** `PUT http://localhost:5001/api/prestations/:id`

**Body :** Envoyez uniquement les champs à modifier

```json
{
  "prixBase": 900,
  "disponible": true,
  "tarifsParInvites": [
    { "min": 0, "max": 50, "prix": 600, "label": "Petit" }
  ]
}
```

## 📂 Catégories disponibles

```
'DJ', 'Photographe', 'Vidéaste', 'Animateur',
'Groupe de louange', 'Wedding planner', 'Traiteur',
'Sonorisation', 'Éclairage', 'Décoration', 'Animation',
'Pack Complet', 'Location matériel', 'Autre'
```

## 💡 Calcul automatique des prix

Les prix s'ajustent automatiquement selon le nombre d'invités :

- Utilisateur entre : **75 invités**
- Système trouve la tranche : **51-100**
- Prix appliqué : **800€**

## 🆘 Besoin d'aide ?

**Documentation complète :**
- 📖 `GUIDE_AJOUT_PRESTATIONS.md` (guide détaillé 200+ lignes)

**Fichiers importants :**
- Modèle : `backend/src/models/Prestation.js`
- Controller : `backend/src/controllers/prestationController.js`
- Routes : `backend/src/routes/prestationRoutes.js`
- Interface : `frontend/src/pages/GestionPrestationsAdmin.js`

---

💡 **Astuce** : Commencez par l'interface admin, c'est le plus simple !
