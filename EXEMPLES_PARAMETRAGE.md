# 💡 Exemples d'Utilisation - Système de Paramétrage

Ce document montre des exemples concrets d'utilisation du système de paramétrage pour gérer votre site.

---

## 🚀 Démarrage Initial

### 1. Installer et initialiser

```bash
cd backend
npm install
cp .env.example .env

# Éditer .env avec vos infos
# Puis initialiser les paramètres :
npm run init-settings

# Démarrer le serveur :
npm run dev
```

---

## 📞 Scénarios d'Utilisation

### Scénario 1 : Mettre à Jour Vos Coordonnées

Vous venez de créer votre entreprise et voulez mettre vos vraies coordonnées :

```bash
curl -X PUT http://localhost:5001/api/settings/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dj@elijahgod-events.fr",
    "telephone": "+33 6 12 34 56 78",
    "adresse": {
      "rue": "15 Avenue de la République",
      "codePostal": "93100",
      "ville": "Montreuil",
      "pays": "France"
    },
    "horaires": "Lundi - Vendredi : 10h - 19h | Weekend sur RDV",
    "adminNom": "Admin"
  }'
```

**Résultat** : Tous vos emails, le footer du site, la page contact afficheront automatiquement ces nouvelles coordonnées ! ✅

---

### Scénario 2 : Configurer Vos Réseaux Sociaux

Vous venez de créer vos comptes Instagram et Facebook :

```bash
curl -X PUT http://localhost:5001/api/settings/reseaux-sociaux \
  -H "Content-Type: application/json" \
  -d '{
    "facebook": "https://facebook.com/elijahgodevents",
    "instagram": "https://instagram.com/elijahgod_dj",
    "youtube": "https://youtube.com/@elijahgodevents",
    "tiktok": "https://tiktok.com/@elijahgod",
    "adminNom": "Admin"
  }'
```

**Résultat** : Les icons de réseaux sociaux apparaissent automatiquement dans le footer avec les bons liens ! 🌐

---

### Scénario 3 : Ajuster Vos Tarifs

Vous décidez d'augmenter vos tarifs pour 2026 :

```bash
curl -X PUT http://localhost:5001/api/settings/tarifs \
  -H "Content-Type: application/json" \
  -d '{
    "tarifHoraire": 100,
    "supplementWeekendPourcentage": 25,
    "supplementNuitPourcentage": 35,
    "fraisDeplacementParKm": 0.65,
    "distanceGratuiteKm": 40,
    "adminNom": "Admin"
  }'
```

**Résultat** : Tous les nouveaux devis calculent automatiquement avec ces nouveaux tarifs ! 💰

---

### Scénario 4 : Personnaliser le Message de Confirmation

Vous voulez un message plus chaleureux quand un client fait une demande :

```bash
curl -X PUT http://localhost:5001/api/settings/devis \
  -H "Content-Type: application/json" \
  -d '{
    "messageConfirmation": "🎉 Super ! Nous avons bien reçu votre demande de devis. Notre équipe va l'\''étudier et vous envoyer une proposition personnalisée sous 24h maximum. Merci de votre confiance !",
    "validiteJours": 45,
    "acompteMinimum": 25,
    "adminNom": "Admin"
  }'
```

**Résultat** : Ce message apparaît sur la page de confirmation et dans l'email envoyé au client ! 📧

---

### Scénario 5 : Changer les Couleurs du Site

Vous voulez un thème plus moderne avec des couleurs sombres :

```bash
curl -X PUT http://localhost:5001/api/settings/site \
  -H "Content-Type: application/json" \
  -d '{
    "couleurPrincipale": "#0a0e27",
    "couleurSecondaire": "#1a1f3a",
    "couleurAccent": "#f39c12",
    "afficherPrix": true,
    "adminNom": "Admin"
  }'
```

**Résultat** : Le thème CSS change instantanément sur tout le site ! 🎨

---

### Scénario 6 : Bloquer un Jour de la Semaine

Vous décidez de ne plus travailler le lundi :

```bash
curl -X PUT http://localhost:5001/api/settings/planning \
  -H "Content-Type: application/json" \
  -d '{
    "joursNonTravailles": ["Lundi"],
    "delaiReservationMinJours": 10,
    "heureOuvertureDefaut": "10:00",
    "heureFermetureDefaut": "03:00",
    "adminNom": "Admin"
  }'
```

**Résultat** : Les clients ne peuvent plus sélectionner les lundis dans le calendrier de réservation ! 📅

---

### Scénario 7 : Optimiser le SEO

Vous voulez être mieux référencé sur Google :

```bash
curl -X PUT http://localhost:5001/api/settings/seo \
  -H "Content-Type: application/json" \
  -d '{
    "metaTitre": "ELIJAH'\''GOD - DJ Mariage Paris | Animation Soirée 93",
    "metaDescription": "DJ professionnel pour mariages, anniversaires et événements en Île-de-France. Matériel sono haut de gamme. Devis gratuit en ligne.",
    "motsCles": [
      "DJ mariage Paris",
      "DJ 93",
      "sonorisation événement",
      "animation soirée Montreuil",
      "location sono Paris",
      "DJ professionnel Île-de-France"
    ],
    "adminNom": "Admin"
  }'
```

**Résultat** : Les balises meta sont automatiquement mises à jour dans le `<head>` de chaque page ! 🔍

---

### Scénario 8 : Activer le Mode Maintenance

Vous devez faire une maintenance du site pendant 1h :

```bash
curl -X PUT http://localhost:5001/api/settings/site \
  -H "Content-Type: application/json" \
  -d '{
    "maintenanceMode": true,
    "messageMaintenace": "🔧 Site en maintenance pour amélioration. Retour dans 1 heure ! Merci de votre patience.",
    "adminNom": "Admin"
  }'
```

**Résultat** : Le site affiche une page de maintenance pour tous les visiteurs (sauf admin) ! ⚠️

Pour réactiver après :
```bash
curl -X PUT http://localhost:5001/api/settings/site \
  -H "Content-Type: application/json" \
  -d '{ "maintenanceMode": false, "adminNom": "Admin" }'
```

---

### Scénario 9 : Personnaliser la Page d'Accueil

Nouveau slogan et présentation :

```bash
curl -X PUT http://localhost:5001/api/settings/messages \
  -H "Content-Type: application/json" \
  -d '{
    "accueil": {
      "titre": "ELIJAH'\''GOD Events",
      "sousTitre": "Là où la musique rencontre l'\''excellence",
      "description": "DJ professionnel et sonorisation premium pour transformer vos événements en moments inoubliables. Plus de 200 événements réussis depuis 2020."
    },
    "apropos": "ELIJAH'\''GOD Events est né d'\''une passion pour la musique et l'\''animation événementielle. Avec notre matériel haut de gamme et notre expérience de plus de 5 ans, nous garantissons une ambiance exceptionnelle pour chaque événement.",
    "piedDePage": "© 2026 ELIJAH'\''GOD Events - DJ & Sonorisation Premium - Tous droits réservés",
    "adminNom": "Admin"
  }'
```

**Résultat** : La page d'accueil affiche les nouveaux textes instantanément ! 🎯

---

### Scénario 10 : Configuration Email pour Production

Vous configurez Brevo pour les vrais emails :

```bash
curl -X PUT http://localhost:5001/api/settings/email \
  -H "Content-Type: application/json" \
  -d '{
    "emailAdmin": "notifications@elijahgod-events.fr",
    "emailNotifications": true,
    "emailSignature": "L'\''équipe ELIJAH'\''GOD Events\nDJ & Sonorisation Premium\n📞 +33 6 12 34 56 78\n✉️ contact@elijahgod-events.fr\n🌐 www.elijahgod-events.fr",
    "adminNom": "Admin"
  }'
```

**Résultat** : Tous les emails automatiques utilisent cette signature et envoient les notifications à cette adresse ! 📬

---

## 📊 Consulter Vos Statistiques

À tout moment, consultez les stats de votre site :

```bash
curl http://localhost:5001/api/settings/stats
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "totalDevis": 47,
    "totalReservations": 23,
    "totalClients": 38
  }
}
```

---

## 🔄 Réinitialiser Tout (Si Besoin)

Si vous voulez tout recommencer avec les paramètres par défaut :

```bash
curl -X POST http://localhost:5001/api/settings/reset
```

⚠️ **Attention** : Cette action supprime tous vos paramètres personnalisés !

---

## 💻 Utilisation dans MongoDB Compass

Vous préférez une interface graphique ? Utilisez MongoDB Compass :

1. Connectez-vous à `mongodb://localhost:27017`
2. Ouvrez la base `elijahgod`
3. Cliquez sur la collection `settings`
4. Modifiez directement le document JSON
5. Cliquez sur "Update"

---

## 🎨 Cas d'Usage Avancés

### Créer des Profils de Paramètres

Vous pouvez sauvegarder différentes configurations :

**Profil Été** : Tarifs plus élevés
```json
{
  "tarifs": {
    "tarifHoraire": 120,
    "supplementWeekendPourcentage": 30
  }
}
```

**Profil Hiver** : Tarifs réduits
```json
{
  "tarifs": {
    "tarifHoraire": 90,
    "supplementWeekendPourcentage": 15
  }
}
```

### Récupérer Tous les Paramètres

Pour sauvegarder votre configuration actuelle :

```bash
curl http://localhost:5001/api/settings/admin > ma-config.json
```

---

## ✅ Avantages du Système

1. **Zéro code** : Modifiez tout sans toucher au code source
2. **Temps réel** : Les changements s'appliquent instantanément
3. **Sécurisé** : Un seul document en base de données
4. **Centralisé** : Tous les paramètres au même endroit
5. **Extensible** : Facile d'ajouter de nouveaux paramètres
6. **Documenté** : Chaque paramètre est expliqué

---

## 🎯 Prochainement : Interface Admin Visuelle

Une fois le frontend créé, vous aurez une belle interface pour gérer tout ça avec :
- Formulaires intuitifs
- Prévisualisation en temps réel
- Undo/Redo
- Drag & drop pour images
- Validation des données
- Historique des modifications

**En attendant**, l'API REST vous permet de tout faire ! 🚀

---

**Questions ? Consultez les guides** :
- GUIDE_PARAMETRAGE.md
- INTEGRATION_PARAMETRES.md
- DEMARRAGE_RAPIDE.md
