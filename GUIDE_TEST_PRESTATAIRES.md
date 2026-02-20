# 🚀 Guide de Test Rapide - Système Prestataires

## ✅ Ce Qui Est Prêt à Tester

### Backend ✅
- [x] Modèles Prestataire et Materiel créés
- [x] API endpoints fonctionnels
- [x] Authentification JWT pour prestataires
- [x] Routes publiques et protégées
- [x] Système d'avis
- [x] Gestion disponibilité

### Frontend ✅
- [x] Page liste prestataires `/prestataires`
- [x] Page profil prestataire `/prestataires/:id`
- [x] Filtres par catégorie
- [x] Système de notation (étoiles)
- [x] Responsive design
- [x] Navigation intégrée dans Header

## 🧪 Tests à Effectuer

### Test 1 : Créer un Prestataire (API)

```bash
# Inscription nouveau prestataire
curl -X POST http://localhost:5001/api/prestataires/inscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dj.martin@test.com",
    "password": "password123",
    "nomEntreprise": "DJ Martin",
    "categorie": "DJ",
    "telephone": "+33 6 12 34 56 78",
    "description": "DJ professionnel avec 10 ans d'\''expérience. Spécialisé dans les mariages et soirées privées."
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "✅ Inscription réussie !",
  "data": {
    "prestataire": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

**Sauvegarder le token** pour les prochains tests !

### Test 2 : Connexion Prestataire

```bash
curl -X POST http://localhost:5001/api/prestataires/connexion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dj.martin@test.com",
    "password": "password123"
  }'
```

### Test 3 : Ajouter du Matériel

```bash
# Remplacer YOUR_TOKEN par le token obtenu
curl -X POST http://localhost:5001/api/materiel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nom": "Machine à fumée professionnelle",
    "categorie": "Machines à fumée",
    "description": "Machine à fumée haute performance, idéale pour les événements. Portée de 10m, télécommande incluse.",
    "prixLocation": {
      "jour": 50,
      "weekend": 120,
      "semaine": 300,
      "caution": 100
    },
    "quantiteTotale": 3,
    "quantiteDisponible": 3,
    "conditions": {
      "dureeMinLocation": 1,
      "delaiReservation": 2,
      "livraisonDisponible": true,
      "fraisLivraison": 30
    }
  }'
```

### Test 4 : Lister les Prestataires

```bash
# Tous les prestataires
curl http://localhost:5001/api/prestataires

# Filtrer par catégorie
curl http://localhost:5001/api/prestataires?categorie=DJ

# Filtrer par note
curl http://localhost:5001/api/prestataires?noteMin=4

# Vérifiés uniquement
curl http://localhost:5001/api/prestataires?verified=true
```

### Test 5 : Voir les Catégories

```bash
# Catégories de prestataires
curl http://localhost:5001/api/prestataires/categories

# Catégories de matériel
curl http://localhost:5001/api/materiel/categories
```

### Test 6 : Ajouter un Avis

```bash
# Remplacer PRESTATAIRE_ID par l'ID du prestataire
curl -X POST http://localhost:5001/api/prestataires/PRESTATAIRE_ID/avis \
  -H "Content-Type: application/json" \
  -d '{
    "client": "Marie Dupont",
    "note": 5,
    "commentaire": "DJ Martin a été exceptionnel ! Ambiance de folie toute la soirée. Très professionnel et à l'\''écoute.",
    "typeEvenement": "Mariage",
    "dateEvenement": "2026-02-10"
  }'
```

### Test 7 : Vérifier Disponibilité Matériel

```bash
# Remplacer MATERIEL_ID
curl "http://localhost:5001/api/materiel/MATERIEL_ID/disponibilite?dateDebut=2026-03-01&dateFin=2026-03-03&quantite=1"
```

### Test 8 : Mettre à Jour Profil Prestataire

```bash
curl -X PUT http://localhost:5001/api/prestataires/profil \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "DJ professionnel avec 10 ans d'\''expérience. Expert en musique électronique, house et techno.",
    "specialites": ["Mariage", "Anniversaire", "Soirée entreprise"],
    "siteWeb": "https://djmartin.fr",
    "reseauxSociaux": {
      "instagram": "https://instagram.com/djmartin",
      "facebook": "https://facebook.com/djmartin"
    },
    "tarifsPublics": {
      "afficher": true,
      "tarifMin": 300,
      "tarifMax": 1500,
      "unite": "soirée"
    }
  }'
```

## 🌐 Tests Frontend

### Test 1 : Page Liste Prestataires
1. Ouvrir http://localhost:3001/prestataires
2. Vérifier :
   - [ ] La page se charge
   - [ ] Les filtres s'affichent
   - [ ] Les prestataires s'affichent (après ajout API)
   - [ ] Les badges (vérifié, premium) fonctionnent
   - [ ] Les étoiles s'affichent correctement
   - [ ] Les filtres fonctionnent

### Test 2 : Page Profil Prestataire
1. Cliquer sur un prestataire
2. Vérifier :
   - [ ] Le profil se charge
   - [ ] Le hero affiche les bonnes infos
   - [ ] Les onglets fonctionnent
   - [ ] L'onglet "À propos" affiche la description
   - [ ] L'onglet "Prestations" charge les prestations
   - [ ] L'onglet "Matériel" charge le matériel
   - [ ] L'onglet "Avis" affiche les avis
   - [ ] Les boutons d'action fonctionnent

### Test 3 : Navigation
1. Vérifier :
   - [ ] Le lien "Prestataires" dans le Header
   - [ ] Navigation entre pages fonctionne
   - [ ] Retour à la liste fonctionne
   - [ ] URL change correctement

### Test 4 : Responsive
1. Tester sur mobile (DevTools)
2. Vérifier :
   - [ ] Grille passe en colonne unique
   - [ ] Filtres restent accessibles
   - [ ] Hero du profil s'adapte
   - [ ] Photos restent lisibles

## 📝 Script de Démonstration

Créez plusieurs prestataires pour tester :

```bash
# 1. Photographe
curl -X POST http://localhost:5001/api/prestataires/inscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "photo.sarah@test.com",
    "password": "password123",
    "nomEntreprise": "Sarah Photos",
    "categorie": "Photographe",
    "telephone": "+33 6 11 22 33 44",
    "description": "Photographe professionnelle spécialisée dans les mariages et événements familiaux."
  }'

# 2. Vidéaste
curl -X POST http://localhost:5001/api/prestataires/inscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "video.alex@test.com",
    "password": "password123",
    "nomEntreprise": "Alex Films",
    "categorie": "Vidéaste",
    "telephone": "+33 6 22 33 44 55",
    "description": "Création de films événementiels émotionnels et professionnels."
  }'

# 3. Traiteur
curl -X POST http://localhost:5001/api/prestataires/inscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "chef.pierre@test.com",
    "password": "password123",
    "nomEntreprise": "Traiteur Pierre Delice",
    "categorie": "Traiteur",
    "telephone": "+33 6 33 44 55 66",
    "description": "Traiteur gastronomique pour tous vos événements. Cuisine française et internationale."
  }'

# 4. Wedding Planner
curl -X POST http://localhost:5001/api/prestataires/inscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "emma.events@test.com",
    "password": "password123",
    "nomEntreprise": "Emma Wedding & Events",
    "categorie": "Wedding planner",
    "telephone": "+33 6 44 55 66 77",
    "description": "Organisation clé en main de mariages de rêve. Plus de 15 ans d'\''expérience."
  }'
```

## 🐛 Problèmes Connus à Vérifier

1. **Backend pas démarré**
   - Solution : `cd backend && npm run dev`

2. **Frontend affiche "Aucun prestataire"**
   - Solution : Vérifier que des prestataires existent en DB
   - Tester l'API : `curl http://localhost:5001/api/prestataires`

3. **Images ne s'affichent pas**
   - Normal pour le moment (pas d'upload Cloudinary configuré)
   - Des placeholders colorés s'affichent

4. **Token expiré**
   - Solution : Se reconnecter pour obtenir un nouveau token

5. **CORS errors**
   - Vérifier que `FRONTEND_URL` dans `.env` = `http://localhost:3001`
   - Redémarrer le backend

## ✨ Prochains Tests à Préparer

Une fois l'interface prestataire créée :
- [ ] Test inscription depuis le formulaire web
- [ ] Test connexion prestataire
- [ ] Test ajout prestation depuis dashboard
- [ ] Test ajout matériel depuis dashboard
- [ ] Test modification profil depuis interface
- [ ] Test upload de photos (Cloudinary)
- [ ] Test gestion calendrier
- [ ] Test notifications

## 📊 Données de Test Complètes

Pour une démo réaliste, créer :
- 3-4 prestataires par catégorie
- 5-10 pièces de matériel
- 2-3 avis par prestataire
- Photos de profil
- Photos de réalisations

---

**Prêt à tester ?** Commencez par créer un prestataire via l'API, puis visitez http://localhost:3001/prestataires !
