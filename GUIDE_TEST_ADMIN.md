# 🧪 GUIDE DE TEST - CONNEXION ADMIN

## ✅ Tests API Réussis

### Backend Health Check
```bash
curl http://localhost:5001/api/health
# ✅ Backend ELIJAH'GOD fonctionnel
```

### Test de connexion
```bash
curl -X POST http://localhost:5001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elijahgod.com","motDePasse":"admin123"}'
# ✅ Connexion réussie + token JWT généré
```

### Test d'accès au profil
```bash
curl -X GET http://localhost:5001/api/admin/auth/me \
  -H "Authorization: Bearer [TOKEN]"
# ✅ Profil admin récupéré avec succès
```

## 🌐 Test Interface Web

### Accès à la page de connexion
**URL:** http://localhost:3000/admin/login

### Identifiants de test
- **Email:** admin@elijahgod.com
- **Mot de passe:** admin123
- **Rôle:** super_admin

## 📋 Scénario de test complet

### 1. Page de connexion
- [ ] Ouvrir http://localhost:3000/admin/login
- [ ] Vérifier le design de la page (gradient violet, formulaire centré)
- [ ] Vérifier les champs email et mot de passe
- [ ] Vérifier le bouton "Se connecter"

### 2. Connexion avec identifiants corrects
- [ ] Entrer: admin@elijahgod.com
- [ ] Entrer: admin123
- [ ] Cliquer sur "Se connecter"
- [ ] Vérifier: message de succès
- [ ] Vérifier: redirection vers /admin/dashboard

### 3. Test avec identifiants incorrects
- [ ] Retourner à /admin/login
- [ ] Entrer: mauvais@email.com
- [ ] Entrer: mauvaismdp
- [ ] Cliquer sur "Se connecter"
- [ ] Vérifier: message d'erreur "Identifiants invalides"

### 4. Vérifier le token et la session
- [ ] Ouvrir les DevTools (F12)
- [ ] Aller dans Application > Local Storage
- [ ] Vérifier la présence de "adminToken"
- [ ] Se déconnecter et vérifier la suppression du token

### 5. Test de redirection automatique
- [ ] Se connecter avec succès
- [ ] Essayer d'accéder à /admin/login
- [ ] Vérifier: redirection automatique vers /admin/dashboard

## 🔍 Points à vérifier

### Backend
- [x] ✅ Serveur démarré sur port 5001
- [x] ✅ Route de connexion fonctionnelle
- [x] ✅ JWT généré correctement
- [x] ✅ Middleware d'authentification opérationnel
- [x] ✅ Modèle Admin créé dans MongoDB

### Frontend
- [x] ✅ Serveur démarré sur port 3000
- [x] ✅ AdminContext créé et intégré
- [x] ✅ Page de connexion stylée
- [x] ✅ Formulaire de connexion fonctionnel
- [x] ✅ Gestion des erreurs
- [x] ✅ Redirection après connexion

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
lsof -ti:5001 | xargs kill -9
cd "/Users/odounga/Applications/site web/ELIJAHGOD/backend" && npm start
```

### Le frontend ne démarre pas
```bash
lsof -ti:3000 | xargs kill -9
cd "/Users/odounga/Applications/site web/ELIJAHGOD/frontend" && npm start
```

### Créer un nouvel admin
```bash
cd "/Users/odounga/Applications/site web/ELIJAHGOD/backend"
node quick-admin.js
```

### Tester l'API directement
```bash
# Login
curl -X POST http://localhost:5001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elijahgod.com","motDePasse":"admin123"}' | jq '.'

# Profil (remplacer [TOKEN])
curl -X GET http://localhost:5001/api/admin/auth/me \
  -H "Authorization: Bearer [TOKEN]" | jq '.'
```

## 📊 Résultats attendus

### Connexion réussie
- Message: ✅ Connexion réussie
- Token JWT stocké dans localStorage
- Redirection vers /admin/dashboard
- Dernière connexion mise à jour dans MongoDB

### Connexion échouée
- Message: ❌ Identifiants invalides
- Pas de token généré
- Reste sur la page de connexion
- Affichage du message d'erreur

## 🎯 Prochaines étapes après validation

1. Implémenter AdminDashboard.js
2. Ajouter la gestion des utilisateurs
3. Créer les interfaces de gestion des devis
4. Ajouter les statistiques admin
5. Implémenter les permissions granulaires

## 📝 Notes

- Le token JWT expire après 7 jours
- Le rôle super_admin a tous les privilèges
- Le compte admin peut être désactivé (sauf soi-même)
- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Le middleware vérifie que le compte est actif avant chaque requête
