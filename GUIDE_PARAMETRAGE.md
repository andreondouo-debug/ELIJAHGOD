# 📋 Guide de Paramétrage ELIJAH'GOD

## Vue d'ensemble

Le système de paramétrage permet de gérer tous les aspects du site sans toucher au code. Toutes les modifications sont stockées en base de données et appliquées automatiquement sur le site.

## 🎯 Paramètres disponibles

### 1. Informations de l'entreprise
- **Nom de l'entreprise** : Affiché partout sur le site
- **Slogan** : Accroche principale
- **Description** : Présentation courte
- **Logo** : URL ou chemin du logo
- **Bannière** : Image principale de la page d'accueil

### 2. Contact
- **Email** : Contact principal
- **Téléphone** : Numéro affiché
- **Adresse complète** : Rue, code postal, ville, pays
- **Horaires** : Texte libre pour les horaires

### 3. Réseaux sociaux
- Facebook, Instagram, Twitter, YouTube, TikTok, LinkedIn
- Mettre l'URL complète de chaque profil

### 4. Paramètres de devis
- **Validité (jours)** : Durée de validité d'un devis (7-90 jours)
- **Acompte minimum** : Pourcentage requis (0-100%)
- **Délai d'annulation** : Nombre de jours avant l'événement (0-30 jours)
- **Message de confirmation** : Texte envoyé après création du devis
- **CGV** : Conditions générales de vente

### 5. Tarifs par défaut
- **Frais de déplacement** : € par kilomètre
- **Distance gratuite** : Kilomètres inclus gratuitement
- **Supplément weekend** : Pourcentage supplémentaire
- **Supplément nuit** : Pourcentage supplémentaire
- **Tarif horaire** : Tarif de base par heure

### 6. Messages personnalisables
- **Page d'accueil** : Titre, sous-titre, description
- **À propos** : Présentation détaillée
- **Pied de page** : Copyright et mentions

### 7. Configuration email
- **Email admin** : Adresse qui reçoit les notifications
- **Activer notifications** : On/Off
- **Signature email** : Signature automatique

### 8. Planning
- **Heure d'ouverture** : Par défaut (format HH:MM)
- **Heure de fermeture** : Par défaut (format HH:MM)
- **Jours non travaillés** : Liste des jours de la semaine
- **Délai de réservation minimum** : Nombre de jours à l'avance

### 9. Paramètres du site
- **Mode maintenance** : Activer/désactiver le site
- **Message de maintenance** : Texte affiché en maintenance
- **Afficher les prix** : Oui/Non sur le site public
- **Afficher les avis** : Oui/Non
- **Couleurs** : Couleurs principale, secondaire et accent (format hex)

### 10. SEO
- **Meta titre** : Titre pour les moteurs de recherche
- **Meta description** : Description pour Google
- **Mots-clés** : Liste de mots-clés

## 📡 API Endpoints

### Endpoints publics
```
GET /api/settings              # Obtenir les paramètres publics
```

### Endpoints admin (requiert authentification)
```
GET /api/settings/admin        # Tous les paramètres
GET /api/settings/stats        # Statistiques du site
PUT /api/settings              # Mettre à jour (global)

# Endpoints spécifiques
PUT /api/settings/entreprise
PUT /api/settings/contact
PUT /api/settings/reseaux-sociaux
PUT /api/settings/devis
PUT /api/settings/tarifs
PUT /api/settings/messages
PUT /api/settings/email
PUT /api/settings/planning
PUT /api/settings/site
PUT /api/settings/seo

POST /api/settings/reset       # Réinitialiser aux valeurs par défaut
```

## 💻 Utilisation dans le code

### Backend
```javascript
const Settings = require('./models/Settings');

// Obtenir les paramètres
const settings = await Settings.getSettings();

// Utiliser un paramètre
const emailContact = settings.contact.email;
const validitéDevis = settings.devis.validiteJours;

// Mettre à jour
await Settings.updateSettings({
  contact: {
    email: 'nouveau@email.com',
    telephone: '+33 1 23 45 67 89'
  }
}, 'Admin Name');
```

### Frontend
```javascript
import axios from 'axios';

// Charger les paramètres
const response = await axios.get('/api/settings');
const settings = response.data.data;

// Utiliser dans les composants
<h1>{settings.entreprise.nom}</h1>
<p>{settings.entreprise.slogan}</p>
<a href={`mailto:${settings.contact.email}`}>Contact</a>
```

## 🎨 Intégration automatique

Les paramètres sont automatiquement utilisés dans :

1. **Emails** : Signature, contact, logo
2. **Devis** : Validité, CGV, messages
3. **Planning** : Horaires, jours non travaillés
4. **Tarification** : Calculs automatiques avec les tarifs définis
5. **Interface** : Couleurs, logos, messages
6. **SEO** : Meta tags dynamiques

## 🔄 Initialisation

Au premier démarrage, les paramètres par défaut sont automatiquement créés. Vous pouvez ensuite les personnaliser via l'interface admin ou l'API.

## ⚠️ Bonnes pratiques

1. **Toujours tester** après modification des tarifs ou du planning
2. **Sauvegarder** vos paramètres avant réinitialisation
3. **Vérifier les emails** après modification de la config email
4. **Tester les couleurs** sur différents écrans
5. **Valider les URLs** des réseaux sociaux

## 🚀 Page admin à venir

Une interface visuelle sera créée pour gérer tous ces paramètres facilement :
- Formulaires organisés par sections
- Prévisualisation en temps réel
- Validation des données
- Historique des modifications
- Import/Export des paramètres
