# 🎭 Système de Prestataires - ELIJAH'GOD

## 📋 Vue d'Ensemble

Le système de prestataires transforme ELIJAH'GOD en **marketplace événementielle** où plusieurs professionnels peuvent proposer leurs services et matériels aux clients.

## 🎯 Fonctionnalités Principales

### Pour les Clients
- ✅ Parcourir les prestataires par catégorie
- ✅ Consulter les profils détaillés (photos, avis, tarifs)
- ✅ Voir le catalogue de prestations et matériel de chaque prestataire
- ✅ Filtrer par note, statut vérifié, catégorie
- ✅ Demander des devis directement à un prestataire

### Pour les Prestataires
- ✅ Créer un compte professionnel
- ✅ Gérer leur profil public (description, photos, vidéos)
- ✅ Ajouter/modifier leurs prestations
- ✅ Gérer leur catalogue de matériel
- ✅ Gérer leur disponibilité (calendrier)
- ✅ Recevoir et gérer les demandes de devis
- ✅ Consulter leurs statistiques (vues, réservations, CA)
- ✅ Recevoir des avis clients

### Pour l'Admin
- ✅ Valider les nouveaux prestataires
- ✅ Gérer les commissions
- ✅ Voir toutes les transactions
- ✅ Modérer les avis

## 📊 Types de Prestataires

### 12 Catégories Disponibles
1. **DJ** - Animation musicale
2. **Photographe** - Photographie d'événements
3. **Vidéaste** - Vidéos et montages
4. **Animateur** - Animation de soirées
5. **Groupe de louange** - Musique live pour mariages/cérémonies
6. **Wedding planner** - Organisation complète
7. **Traiteur** - Services de restauration
8. **Sonorisation** - Location et installation sono
9. **Éclairage** - Éclairage scénique
10. **Décoration** - Décoration d'événements
11. **Location matériel** - Location d'équipements divers
12. **Autre** - Autres services

## 🛠️ Architecture Technique

### Backend (Nouveaux Modèles)

#### 1. Modèle `Prestataire`
```javascript
{
  // Authentification
  email, password,
  
  // Infos professionnelles
  nomEntreprise, categorie, specialites[],
  telephone, adresse, siteWeb, reseauxSociaux,
  
  // Profil public
  description, logo, photos[], video,
  
  // Évaluation
  noteGlobale, nombreAvis, avis[],
  
  // Tarification
  tarifsPublics: { afficher, tarifMin, tarifMax, unite },
  
  // Disponibilité
  disponibilite: { calendrier[], joursNonTravailles[], zoneIntervention[] },
  
  // Compte
  isActive, isVerified, plan ('gratuit'|'premium'|'pro'),
  commission (% sur réservations),
  
  // Stats
  stats: { vuesProfil, demandesRecues, devisEnvoyes, reservationsConfirmees, chiffreAffaires }
}
```

**Méthodes importantes :**
- `comparePassword()` - Vérification mot de passe
- `calculerNoteGlobale()` - Calcul note moyenne
- `ajouterAvis()` - Ajouter un avis
- `estDisponible(date)` - Vérifier disponibilité
- `bloquerDate(date)` - Bloquer une date
- `getProfilPublic()` - Profil sans infos sensibles
- `incrementerVues()` - Compteur de vues

#### 2. Modèle `Materiel`
```javascript
{
  prestataire: ObjectId,
  
  // Matériel
  nom, categorie, sousCategorie, description,
  caracteristiques[{ nom, valeur }],
  photos[], video,
  
  // Tarification
  prixLocation: { jour, weekend, semaine, caution },
  
  // Quantité
  quantiteDisponible, quantiteTotale,
  
  // État
  etat ('excellent'|'bon'|'correct'|'maintenance'),
  derniereMaintenance, prochaineMaintenanceDate,
  
  // Conditions
  conditions: {
    dureeMinLocation, delaiReservation,
    livraisonDisponible, fraisLivraison,
    installationDisponible, fraisInstallation
  },
  
  // Réservations
  reservations[{
    dateDebut, dateFin, quantite, client,
    statut ('en attente'|'confirmée'|'en cours'|'terminée'|'annulée')
  }],
  
  // Visibilité
  isActive, miseEnAvant,
  
  // Stats
  stats: { vues, demandes, reservations, revenuGenere }
}
```

**Catégories de matériel :**
- Sonorisation
- Éclairage
- Effets spéciaux
- Machines à fumée
- Jets d'artifice
- DJ equipment
- Vidéo projecteur
- Écran LED
- Structure/Scène
- Décoration
- Mobilier
- Autre

**Méthodes importantes :**
- `verifierDisponibilite(dateDebut, dateFin, quantite)` - Check dispo
- `calculerPrix(dateDebut, dateFin)` - Calcul prix location
- `reserver(reservationData)` - Créer réservation
- `liberer(reservationId)` - Libérer après location
- `incrementerVues()` - Compteur de vues

#### 3. Modèle `Prestation` (Modifié)
Ajout du champ `prestataire: ObjectId` (optionnel)
- Si `null` : prestation créée par l'admin
- Si rempli : prestation du prestataire

Nouvelles catégories ajoutées dans l'enum.

### API Endpoints

#### Routes Prestataires (`/api/prestataires`)

**Publiques :**
- `POST /inscription` - Inscription nouveau prestataire
- `POST /connexion` - Connexion prestataire
- `GET /` - Liste des prestataires (avec filtres)
- `GET /categories` - Liste des catégories avec compteurs
- `GET /:id` - Profil public d'un prestataire
- `POST /:id/avis` - Ajouter un avis

**Protégées (auth prestataire) :**
- `PUT /profil` - Mettre à jour son profil
- `GET /me/statistiques` - Voir ses statistiques
- `POST /disponibilite` - Gérer sa disponibilité

#### Routes Matériel (`/api/materiel`)

**Publiques :**
- `GET /` - Liste du matériel (avec filtres)
- `GET /categories` - Catégories de matériel
- `GET /:id` - Détails d'un matériel
- `GET /:id/disponibilite` - Vérifier disponibilité
- `POST /:id/reserver` - Réserver du matériel

**Protégées (auth prestataire) :**
- `POST /` - Ajouter du matériel
- `PUT /:id` - Modifier son matériel
- `DELETE /:id` - Supprimer son matériel

### Frontend (Nouvelles Pages)

#### 1. PrestatairesPage (`/prestataires`)
**Fonctionnalités :**
- Grille de cartes prestataires
- Filtres par catégorie
- Filtres par note minimum
- Filtre "Vérifiés uniquement"
- Affichage note, nombre d'avis
- Badge "Vérifié", badge "Premium"
- Lien vers profil détaillé
- CTA inscription prestataire

#### 2. PrestataireProfilPage (`/prestataires/:id`)
**Sections :**
- **Hero** : Logo, nom, catégorie, note, stats, actions (devis, téléphone)
- **Galerie photos** : Grid de 4 photos
- **Onglets** :
  - **À propos** : Description, spécialités, contact, réseaux sociaux
  - **Prestations** : Catalogue des prestations du prestataire
  - **Matériel** : Catalogue du matériel disponible
  - **Avis** : Liste des avis clients

**Design :**
- Responsive
- Système d'étoiles pour les notes
- Badges visuels (vérifié, premium)
- Images optimisées
- Navigation par onglets

## 🔐 Sécurité & Permissions

### Authentification JWT
- Token type: `prestataire`
- Durée: 30 jours
- Payload: `{ prestataireId, type: 'prestataire', categorie }`

### Middleware `authPrestataire`
Vérifie que :
- Le token est présent
- Le token est valide
- Le type est bien `'prestataire'`
- Le compte est actif

### Contrôles d'accès
- Prestataire ne peut modifier QUE ses propres ressources
- Admin peut tout voir/modifier
- Clients peuvent voir les profiils publiques uniquement

## 💳 Système de Commissions

### Plans Prestataires
1. **Gratuit** (0€/mois)
   - Commission : 15%
   - Profil basique
   - 10 prestations max

2. **Premium** (29€/mois)
   - Commission : 10%
   - Badge premium
   - Prestations illimitées
   - Mise en avant dans les résultats
   - Photos illimitées

3. **Pro** (99€/mois)
   - Commission : 5%
   - Tous les avantages Premium
   - Support prioritaire
   - Statistiques avancées
   - API access

### Calcul Commission
Sur chaque réservation confirmée :
```javascript
montantCommission = montantTotal * (prestataire.commission / 100)
```

## 📈 Statistiques Prestataires

### Métriques Suivies
- **vuesProfil** : Nombre de visites du profil
- **demandesRecues** : Nombre de demandes de devis
- **devisEnvoyes** : Nombre de devis envoyés
- **reservationsConfirmees** : Nombre de réservations confirmées
- **chiffreAffaires** : CA total généré

### Dashboard Prestataire (à créer)
Graphiques pour :
- Évolution des vues
- Taux de conversion (demandes → réservations)
- CA mensuel
- Répartition par type de prestation

## ⭐ Système d'Avis

### Structure Avis
```javascript
{
  client: String,
  note: Number (1-5),
  commentaire: String,
  dateEvenement: Date,
  dateAvis: Date,
  typeEvenement: String
}
```

### Calcul Note Globale
- Note globale = moyenne de tous les avis
- Arrondi à 1 décimale
- Recalculée à chaque nouvel avis

### Modération
- Admin peut masquer les avis inappropriés
- Prestataire peut répondre aux avis
- Clients doivent avoir réservé pour laisser un avis (à implémenter)

## 🚀 Prochaines Étapes

### À Implémenter
1. **Interface Prestataire Complète**
   - [ ] Page dashboard prestataire
   - [ ] Page gestion des prestations
   - [ ] Page gestion du matériel
   - [ ] Page gestion du calendrier
   - [ ] Page statistiques avancées
   - [ ] Page messagerie avec clients

2. **Formulaire Inscription Prestataire**
   - [ ] Page `/prestataire/inscription`
   - [ ] Validation des champs
   - [ ] Upload logo/photos
   - [ ] Choix du plan

3. **Page Connexion Prestataire**
   - [ ] Page `/prestataire/connexion`
   - [ ] Récupération mot de passe
   - [ ] Redirection vers dashboard

4. **Admin - Gestion Prestataires**
   - [ ] Liste des prestataires
   - [ ] Validation des nouveaux comptes
   - [ ] Gestion des commissions
   - [ ] Vue sur les transactions
   - [ ] Modération des avis

5. **Notifications**
   - [ ] Email nouveau prestataire (admin)
   - [ ] Email validation compte (prestataire)
   - [ ] Email nouvelle demande (prestataire)
   - [ ] Email réservation confirmée (client + prestataire)

6. **Paiements**
   - [ ] Intégrer PayPal/Stripe
   - [ ] Système d'acompte
   - [ ] Calcul automatique des commissions
   - [ ] Versements aux prestataires

7. **Messagerie**
   - [ ] Chat temps réel client ↔ prestataire
   - [ ] Notifications messages
   - [ ] Historique conversations

8. **Recherche Avancée**
   - [ ] Recherche géographique (rayon)
   - [ ] Recherche par prix
   - [ ] Recherche par disponibilité
   - [ ] Recherche fulltext

## 🎨 Workflow Client → Prestataire

### Parcours Client
1. Client va sur `/prestataires`
2. Filtre par catégorie (ex: "Photographe")
3. Voit la liste des photographes
4. Clique sur un profil
5. Consulte le catalogue de prestations
6. Clique "Demander un devis"
7. Remplit le formulaire (date, détails)
8. Devis envoyé au prestataire

### Parcours Prestataire
1. Prestataire reçoit notification (email + dashboard)
2. Consulte la demande
3. Prépare un devis personnalisé
4. Envoie le devis au client
5. Client accepte → réservation créée
6. Événement dans calendrier du prestataire
7. Après événement → client laisse un avis

## 📱 Interface Mobile

Toutes les pages sont **responsive** :
- Grille → colonne unique sur mobile
- Filtres → menu déroulant
- Navigation → menu hamburger
- Photos → carousel swipeable

## 🔍 SEO & Référencement

### URLs Optimisées
- `/prestataires` - Page principale
- `/prestataires/photographe` - Catégorie spécifique
- `/prestataires/nom-entreprise-123` - Profil (slug + ID)

### Métadonnées
Chaque profil génère :
- Title: `{nomEntreprise} - {categorie} | ELIJAH'GOD`
- Description: Extrait de la description
- Keywords: Catégorie, spécialités, ville

## 🎯 Avantages du Système

### Pour ELIJAH'GOD
- ✅ Élargit l'offre sans recruter
- ✅ Génère des revenus par commissions
- ✅ Attire plus de clients (offre complète)
- ✅ Devient une plateforme de référence

### Pour les Prestataires
- ✅ Visibilité accrue
- ✅ Nouveaux clients
- ✅ Outils de gestion inclus
- ✅ Crédibilité (avis, vérification)
- ✅ Moins de démarches commerciales

### Pour les Clients
- ✅ Comparaison facile
- ✅ Avis vérifiés
- ✅ Réservation simplifiée
- ✅ Garanties (prestataires vérifiés)
- ✅ Solution tout-en-un

---

**Date de création** : 17 février 2026  
**Statut** : Backend 100%, Frontend pages publiques 100%, Interface prestataire 0%  
**Prochaine priorité** : Interface prestataire (inscription, connexion, dashboard)
