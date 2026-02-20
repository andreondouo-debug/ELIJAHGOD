# 🎵 ELIJAH'GOD - Plateformede Prestations Événementielles

Site web professionnel pour prestations événementielles (DJ, mariages, sonorisation, etc.)

## 📋 Fonctionnalités

### Pour les clients
- ✅ Présentation des prestations avec grilles tarifaires
- ✅ Construction de devis personnalisés en ligne
- ✅ Vérification des disponibilités en temps réel
- ✅ Ajout de commentaires et besoins spécifiques
- ✅ Suivi du devis par numéro unique
- ✅ Design moderne et épuré

### Pour l'administrateur
- ✅ **Système de paramétrage complet** - Gérez tout le site sans toucher au code
- ✅ Validation/modification des devis clients
- ✅ Gestion du planning et réservations
- ✅ Gestion des prestations (CRUD)
- ✅ Tableau de bord avec statistiques
- ✅ Notifications par email automatiques
- ✅ Configuration des tarifs et suppléments
- ✅ Personnalisation des messages et emails

## 🛠️ Stack Technique

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React 18
- **Base de données**: MongoDB (gratuit avec Atlas)
- **Emails**: Brevo API (gratuit jusqu'à 300 emails/jour)
- Éditer .env avec vos paramètres (MongoDB, email, etc.)
npm run init-settings    # Initialiser les paramètres du site
npm run dev              # Démarrer le serveur
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

📖 **Guide détaillé** : Voir [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md) install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📦 Structure du Projet

``` # Logique métier
│   │   │   ├── prestationController.js
│   │   │   ├── devisController.js
│   │   │   ├── planningController.js
│   │   │   └── settingsController.js  # ⚙️ Gestion paramètres
│   │   ├── models/          # Modèles MongoDB
│   │   │   ├── Prestation.js
│   │   │   ├── Devis.js
│   │   │   ├── Reservation.js
│   │   │   ├── Admin.js
│   │   │   └── Settings.js             # ⚙️ Modèle paramètres
│   │   ├── routes/          # Routes API
│   │   ├── middleware/      # Auth, validation
│   │   └── config/          # Configuration
│   ├── init-settings.js     # 🚀 Script d'initialisation
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/           # Pages React (à créer)
│   │   ├── components/      # Composants réutilisables
│  ⚙️ Système de Paramétrage

**Gérez tout le site sans toucher au code !**

Le système de paramétrage centralisé vous permet de configurer :
- 🏢 Informations entreprise (nom, logo, slogan)
- 📞 Coordonnées de contact
- 🌐 Réseaux sociaux
- 💰 Tarifs et suppléments
- 📋 Paramètres de devis (validité, CGV)
- 📅 Configuration du planning
- 🎨 Couleurs et apparence
- 📧 Configuration des emails
- 🔍 Paramètres SEO

**Documentation complète** :
- [GUIDE_PARAMETRAGE.md](GUIDE_PARAMETRAGE.md) - Guide des paramètres
- [INTEGRATION_PARAMETRES.md](INTEGRATION_PARAMETRES.md) - Intégration automatique
- [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md) - Premiers pas

## 📡 API Endpoints Principaux

### Paramètres
- `GET /api/settings` - Paramètres publics
- `GET /api/settings/admin` - Tous les paramètres (admin)
- `PUT /api/settings/contact` - Mettre à jour contact
- `PUT /api/settings/tarifs` - Mettre à jour tarifs
- `PUT /api/settings/site` - Paramètres du site

### Prestations
- `GET /api/prestations` - Liste des prestations
- `POST /api/prestations` - Créer une prestation (admin)
- `GET /api/prestations/:id` - Détails d'une prestation

### Devis
- `POST /api/devis` - Créer un devis (public)
- `GET /api/devis` - Liste des devis (admin)
- `PUT /api/devis/:id/statut` - Mettre à jour statut (admin)

### Planning
- `POST /api/planning/verifier-disponibilite` - Vérifier une date
- `GET /api/planning/dates-indisponibles/:annee/:mois` - Dates réservées
- `GET /api/planning/reservations` - Liste des réservations (admin)

## 👨‍💼 Développé pour ELIJAH'GOD
Prestations événementielles professionnelles

---

**Status** : Backend ✅ Opérationnel | Frontend 🔜 En développement
│   └── public/
├── GUIDE_PARAMETRAGE.md      # 📖 Guide complet des paramètres
├── INTEGRATION_PARAMETRES.md # 🔗 Comment tout s'intègre
├── DEMARRAGE_RAPIDE.md       # 🚀 Guide de démarragees/          # Pages React
│   │   ├── components/     # Composants réutilisables
│   │   ├── context/        # Context API
│   │   └── styles/         # CSS
│   └── public/
└── README.md
```

## 👨‍💼 Développé pour ELIJAH'GOD
Prestations événementielles professionnelles
