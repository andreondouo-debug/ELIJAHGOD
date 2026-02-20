# 🚀 Guide de Démarrage Rapide - ELIJAH'GOD

## Installation et Configuration

### 1️⃣ Installation du Backend

```bash
cd backend
npm install
```

### 2️⃣ Configuration de l'environnement

Copier le fichier d'exemple et le personnaliser :

```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos informations :

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/elijahgod

# Sécurité
JWT_SECRET=votre_cle_secrete_complexe_minimum_64_caracteres

# Frontend
FRONTEND_URL=http://localhost:3001

# Email
EMAIL_SERVICE=brevo
BREVO_API_KEY=votre_cle_brevo
ADMIN_EMAIL=votre@email.com
```

### 3️⃣ Initialiser les paramètres du site

```bash
npm run init-settings
```

Cette commande crée tous les paramètres par défaut dans la base de données.

### 4️⃣ Démarrer le backend

```bash
npm run dev
```

Le serveur démarre sur http://localhost:5001

### 5️⃣ Installation du Frontend

Dans un nouveau terminal :

```bash
cd frontend
npm install
```

### 6️⃣ Configuration du frontend

```bash
cp .env.example .env
```

Le fichier `.env` du frontend :

```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SITE_NAME=ELIJAH'GOD
```

### 7️⃣ Démarrer le frontend

```bash
npm start
```

Le site s'ouvre sur http://localhost:3001

## ⚙️ Première Personnalisation des Paramètres

### Via l'API (Postman ou curl)

**Mettre à jour les informations de contact :**

```bash
curl -X PUT http://localhost:5001/api/settings/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contact@votredomaine.com",
    "telephone": "+33 6 12 34 56 78",
    "adresse": {
      "rue": "123 Rue de la Musique",
      "codePostal": "75001",
      "ville": "Paris",
      "pays": "France"
    },
    "horaires": "Lundi - Samedi : 10h - 20h"
  }'
```

**Mettre à jour les informations de l'entreprise :**

```bash
curl -X PUT http://localhost:5001/api/settings/entreprise \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "ELIJAH'\''GOD Events",
    "slogan": "La musique qui fait vibrer vos événements",
    "description": "Expert en sonorisation et animation depuis 2020"
  }'
```

**Configurer les tarifs :**

```bash
curl -X PUT http://localhost:5001/api/settings/tarifs \
  -H "Content-Type: application/json" \
  -d '{
    "tarifHoraire": 100,
    "supplementWeekendPourcentage": 25,
    "fraisDeplacementParKm": 0.60,
    "distanceGratuiteKm": 30
  }'
```

### Via MongoDB Compass (Interface graphique)

1. Ouvrir MongoDB Compass
2. Se connecter à `mongodb://localhost:27017`
3. Sélectionner la base `elijahgod`
4. Ouvrir la collection `settings`
5. Modifier directement le document

## 📝 Ajouter vos Premières Prestations

**Exemple : Prestation DJ Mariage**

```bash
curl -X POST http://localhost:5001/api/prestations \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Prestation DJ Mariage",
    "categorie": "DJ",
    "description": "Animation DJ complète pour votre mariage : musique durant le cocktail, le dîner et la soirée dansante. Matériel de sonorisation professionnel inclus.",
    "descriptionCourte": "DJ + Sono pour votre mariage",
    "prixBase": 800,
    "unite": "soirée",
    "tarifWeekend": 100,
    "tarifNuit": 150,
    "dureeMin": 6,
    "dureeMax": 12,
    "inclus": [
      "DJ professionnel",
      "Sonorisation complète",
      "Éclairage de base",
      "Playlist personnalisée",
      "Matériel de qualité"
    ],
    "nonInclus": [
      "Éclairage scénique avancé",
      "Effets spéciaux",
      "Frais de déplacement au-delà de 50km"
    ],
    "disponible": true,
    "ordre": 1
  }'
```

**Exemple : Location Sonorisation**

```bash
curl -X POST http://localhost:5001/api/prestations \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Location Sonorisation Premium",
    "categorie": "Sonorisation",
    "description": "Location de matériel de sonorisation haut de gamme pour vos événements : enceintes, micros, table de mixage, câblage complet.",
    "descriptionCourte": "Matériel sono pro",
    "prixBase": 400,
    "unite": "journée",
    "tarifWeekend": 50,
    "inclus": [
      "2 enceintes 1000W",
      "2 micros HF",
      "Table de mixage",
      "Câbles et accessoires",
      "Installation et récupération"
    ],
    "disponible": true,
    "ordre": 2
  }'
```

## 🧪 Tester le Site

### 1. Vérifier que tout fonctionne

**Health check backend :**
```bash
curl http://localhost:5001/api/health
```

**Récupérer les paramètres :**
```bash
curl http://localhost:5001/api/settings
```

**Lister les prestations :**
```bash
curl http://localhost:5001/api/prestations
```

### 2. Créer un devis de test

```bash
curl -X POST http://localhost:5001/api/devis \
  -H "Content-Type: application/json" \
  -d '{
    "client": {
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com",
      "telephone": "+33 6 12 34 56 78",
      "adresse": "Paris"
    },
    "evenement": {
      "type": "Mariage",
      "date": "2026-08-15",
      "heureDebut": "18:00",
      "heureFin": "02:00",
      "lieu": "Château de Versailles",
      "nbInvites": 150
    },
    "prestations": [
      {
        "prestation": "ID_DE_LA_PRESTATION",
        "quantite": 1,
        "duree": 8,
        "options": {
          "weekend": true,
          "nuit": true
        }
      }
    ],
    "commentaire": "Nous souhaitons une ambiance festive avec musique variée",
    "besoinsSpecifiques": "Prévoir un espace pour installer le matériel"
  }'
```

### 3. Vérifier les dates disponibles

```bash
# Dates indisponibles en août 2026
curl http://localhost:5001/api/planning/dates-indisponibles/2026/8
```

## 📊 Accéder aux Statistiques

```bash
curl http://localhost:5001/api/settings/stats
```

Retourne :
- Nombre total de devis
- Nombre de réservations
- Nombre de clients uniques

## 🎨 Personnaliser l'Apparence

Les couleurs du site se configurent dans les paramètres :

```bash
curl -X PUT http://localhost:5001/api/settings/site \
  -H "Content-Type: application/json" \
  -d '{
    "couleurPrincipale": "#2c3e50",
    "couleurSecondaire": "#34495e",
    "couleurAccent": "#e74c3c",
    "afficherPrix": true,
    "afficherAvis": true
  }'
```

## 🔗 URLs Importantes

- **Site web** : http://localhost:3001
- **API Backend** : http://localhost:5001/api
- **Health Check** : http://localhost:5001/api/health
- **Paramètres** : http://localhost:5001/api/settings
- **Prestations** : http://localhost:5001/api/prestations
- **Devis** : http://localhost:5001/api/devis
- **Planning** : http://localhost:5001/api/planning

## 📚 Documentation Complète

- `GUIDE_PARAMETRAGE.md` - Guide complet des paramètres
- `INTEGRATION_PARAMETRES.md` - Comment les paramètres sont utilisés
- `README.md` - Présentation générale du projet

## ⚠️ Prochaines Étapes

1. ✅ **Personnaliser tous les paramètres** via l'API
2. ✅ **Ajouter vos prestations** avec les vrais prix
3. 🔜 **Créer l'interface admin React** pour gérer tout ça visuellement
4. 🔜 **Configurer l'envoi d'emails** avec Brevo
5. 🔜 **Ajouter des images** pour les prestations
6. 🔜 **Tester le parcours complet** client

## 🆘 Besoin d'Aide ?

- Vérifiez que MongoDB est bien démarré
- Vérifiez les logs dans le terminal
- Consultez les fichiers de documentation
- Les paramètres sont dans la collection `settings` de MongoDB

---

**Prêt à créer votre site de prestations ! 🎉**
