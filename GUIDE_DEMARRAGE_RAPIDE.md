# 🚀 DÉMARRAGE RAPIDE - Système Devis

## ⚡ En 3 étapes

### 1️⃣ Démarrer le backend (Terminal 1)
```bash
cd "/Users/odounga/Applications/site web/ELIJAHGOD/backend"
npm start
```
✅ Backend sur **http://localhost:5001**

### 2️⃣ Démarrer le frontend (Terminal 2)
```bash
cd "/Users/odounga/Applications/site web/ELIJAHGOD/frontend"
npm start
```
✅ Frontend sur **http://localhost:3000**

### 3️⃣ Tester le workflow
Ouvrir : **http://localhost:3000/devis/nouveau**

---

## 🧪 Test complet en 2 minutes

### Scénario : Mariage à Lyon

1. **Informations contact**
   - Prénom: Jean
   - Nom: Dupont
   - Email: jean@example.com
   - Téléphone: 0612345678

2. **Type événement**
   - Type: Mariage
   - Titre: Mariage Jean & Marie

3. **Date & Lieu** ⚠️ **IMPORTANT**
   - Date: (choisir une date future)
   - **Adresse: 123 rue de la République**
   - **Ville: Lyon**
   
   👉 **Les frais kilométriques seront calculés automatiquement !**

4. **Nombre d'invités**
   - 150 personnes

5. **Prestations**
   - Sélectionner: DJ Mariage (600€)
   - Sélectionner: Sonorisation Concert (400€)

6. **Matériels** (optionnel)
   - Passer ou sélectionner du matériel

7. **Demandes spéciales** (optionnel)
   - Passer ou ajouter un commentaire

8. **📋 RÉCAPITULATIF** ← **ICI VOUS VERREZ TOUT**
   - ✅ Toutes les infos événement
   - ✅ Tableau des prestations
   - ✅ **🚗 Frais kilométriques: ~450€ (Paris → Lyon A/R)**
   - ✅ Totaux: ~1740€ TTC
   - 
   👉 Cliquez "Valider"

9. **✅ PAGE DE CONFIRMATION**
   - Numéro de devis affiché
   - 👉 **Cliquez "📄 Télécharger PDF"**
   - Le PDF se télécharge automatiquement !

---

## 💡 Résultats attendus

### Dans le récapitulatif, vous devriez voir :

```
💰 Frais supplémentaires
🚗 Frais de déplacement (930 km A/R)
   Distance: 930 km aller-retour
   Dont 30 km offerts
   900 km × 0.50€/km
   = 450€
```

### Dans le PDF, vous devriez avoir :

- **Page 1**: En-tête + Client + Événement
- **Page 2**: Tableaux prestations + matériels
- **Page 3**: Frais kilométriques détaillés
- **Page 4**: Totaux + Conditions + Signatures

---

## 🔍 Vérification rapide

### Backend fonctionne ?
```bash
curl http://localhost:5001/api/health
```
Doit afficher : `{"message":"✅ Backend ELIJAH'GOD fonctionnel"}`

### Frontend compile ?
```bash
cd frontend && npm run build
```
Doit compiler avec succès (warnings OK, pas d'erreurs)

---

## 🎯 Points de test clés

### ✅ Calcul distance
- [ ] Entrer une adresse à Lyon
- [ ] Voir "Distance calculée" dans les logs backend
- [ ] Voir les frais km dans le récapitulatif

### ✅ Affichage récap
- [ ] Toutes les infos événement présentes
- [ ] Tableaux prestations/matériels bien formatés
- [ ] Frais km avec détail visible
- [ ] Totaux corrects

### ✅ Génération PDF
- [ ] Bouton "Télécharger PDF" visible
- [ ] Clic = téléchargement
- [ ] PDF s'ouvre correctement
- [ ] Toutes les infos présentes
- [ ] Frais km affichés avec détail

---

## 🐛 Si problème

### Backend ne démarre pas
```bash
# Vérifier le port 5001
lsof -ti:5001
# Tuer le processus existant
lsof -ti:5001 | xargs kill -9
# Redémarrer
cd backend && npm start
```

### Frontend erreur de compilation
```bash
# Réinstaller les dépendances
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Calcul distance ne fonctionne pas
Vérifier dans `backend/.env` :
```env
ADRESSE_ENTREPRISE=Paris, France
TARIF_KILOMETRIQUE=0.50
KM_GRATUITS=30
```

### PDF ne se télécharge pas
Vérifier que le dossier existe :
```bash
mkdir -p backend/uploads/devis
```

---

## 📞 Commandes utiles

### Logs backend en temps réel
```bash
cd backend && npm start | grep "🚗\|📄\|Distance"
```

### Tester une route API directement
```bash
# Créer un devis
curl -X POST http://localhost:5001/api/devis/brouillon \
  -H "Content-Type: application/json" \
  -d '{"client":{"prenom":"Test","nom":"User","email":"test@test.com"}}'
```

---

## ✨ Fonctionnalités bonus

### Variables d'environnement personnalisables

Éditez `backend/.env` pour changer :
```env
# Changer l'adresse de base
ADRESSE_ENTREPRISE=Marseille, France

# Changer le tarif
TARIF_KILOMETRIQUE=0.75

# Changer les km gratuits
KM_GRATUITS=50
```

Puis redémarrer le backend.

---

**Profitez du système de devis professionnel ! 🎉**
