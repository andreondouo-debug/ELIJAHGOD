# 🎉 Système de Devis Professionnel - ELIJAHGOD

## ✅ Fonctionnalités Implémentées

### 1. 🚗 Calcul automatique des frais kilométriques

**Backend:**
- **Service**: `backend/src/utils/distanceService.js`
- **Géocodage**: OpenStreetMap (gratuit, sans clé API)
- **Calcul**: Distance aller-retour avec formule de Haversine
- **Tarification**: 0.50€/km après 30km offerts
- **Configuration**: `.env` avec `ADRESSE_ENTREPRISE`, `TARIF_KILOMETRIQUE`, `KM_GRATUITS`

**Intégration:**
```javascript
// Dans devisController.creerBrouillon()
const fraisKm = await calculerFraisKilometriques(adresseEntreprise, adresseClient);
devis.montants.fraisKilometriques = {
  distanceSimple: fraisKm.distanceSimple,
  distanceAllerRetour: fraisKm.distanceAllerRetour,
  kmGratuits: 30,
  kmFacturables: fraisKm.kmFacturables,
  tarifParKm: 0.50,
  montant: fraisKm.fraisTotal
};
```

**Modèle Devis mis à jour:**
```javascript
montants: {
  fraisKilometriques: {
    distanceSimple: Number,
    distanceAllerRetour: Number,
    kmGratuits: Number,
    kmFacturables: Number,
    tarifParKm: Number,
    montant: Number,
    adresseDepart: String,
    adresseArrivee: String,
    calculeAt: Date
  }
}
```

---

### 2. 📋 Récapitulatif détaillé professionnel

**Composant**: `frontend/src/components/DevisRecap.js`

**Affichage:**
- ✅ Informations événement (type, date, lieu, invités)
- ✅ Tableau prestations avec quantités, prix unitaires, totaux
- ✅ Tableau matériels loués avec durées
- ✅ **Frais kilométriques détaillés** (distance A/R, km gratuits, km facturables × tarif)
- ✅ Autres frais supplémentaires
- ✅ Totaux HT, TVA, TTC
- ✅ Acompte et reste à payer
- ✅ Boutons Modifier / Valider

**Intégration:**
```javascript
// Dans RecapitulatifForm.js
import DevisRecap from '../../DevisRecap';

<DevisRecap 
  devisData={devisData}
  onModifier={handleModifier}
  onValider={handleValider}
  loading={loading}
/>
```

**Design:**
- Gradient noir professionnel
- Animations au scroll
- Responsive mobile/tablette
- Badges de catégorie
- Mise en valeur des totaux

---

### 3. 📄 Génération PDF professionnelle

**Backend Service**: `backend/src/utils/pdfService.js`

**Contenu du PDF:**
1. **En-tête entreprise**
   - Logo et nom (ELIJAH'GOD)
   - Coordonnées (email, téléphone, adresse)
   - Numéro de devis + date + validité

2. **Informations client**
   - Nom, prénom, email, téléphone
   - Entreprise (si applicable)

3. **Détails événement**
   - Type, date, horaires
   - Lieu complet
   - Nombre d'invités

4. **Tableaux détaillés**
   - **Prestations**: Désignation, Qté, Prix Unit. HT, Total HT
   - **Matériels**: Désignation, Qté, Durée, Prix, Total HT

5. **Frais supplémentaires**
   - Frais kilométriques (distance A/R, détail du calcul)
   - Autres frais éventuels

6. **Totaux**
   - Total HT
   - Remise (si applicable)
   - TVA (20%)
   - **Total TTC**
   - Acompte (30%)
   - Reste à payer

7. **Conditions générales**
   - Modalités de paiement
   - Délais d'annulation
   - Validité du devis

8. **Zones de signature**
   - Prestataire
   - Client (avec mention "Bon pour accord")

9. **Pied de page**
   - Coordonnées complètes
   - Mentions légales

**Routes API:**
```javascript
// Client
GET /api/devis/:devisId/pdf          // Télécharger PDF
GET /api/devis/:devisId/pdf-url      // Obtenir URL sans télécharger

// Admin
GET /api/devis/admin/:devisId/pdf    // Télécharger PDF (admin)
```

**Utilisation Frontend:**
```javascript
const telechargerPDF = async () => {
  const response = await axios.get(
    `${API_URL}/api/devis/${devisId}/pdf`,
    { headers, responseType: 'blob' }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `devis-${numeroDevis}.pdf`);
  link.click();
};
```

---

## 📂 Structure des fichiers créés/modifiés

### Backend
```
backend/
├── src/
│   ├── utils/
│   │   ├── distanceService.js       ✅ NOUVEAU - Calcul distance
│   │   └── pdfService.js            ✅ NOUVEAU - Génération PDF
│   ├── models/
│   │   └── Devis.js                 ✅ MODIFIÉ - Ajout fraisKilometriques
│   ├── controllers/
│   │   └── devisController.js      ✅ MODIFIÉ - Intégration distance + PDF
│   └── routes/
│       └── devisRoutes.js           ✅ MODIFIÉ - Routes PDF
├── uploads/
│   └── devis/                       ✅ NOUVEAU - Stockage PDF
└── .env                             ✅ MODIFIÉ - Config distance
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── DevisRecap.js            ✅ NOUVEAU - Récap complet
│   │   ├── DevisRecap.css           ✅ NOUVEAU - Design récap
│   │   └── devis/
│   │       └── steps/
│   │           └── RecapitulatifForm.js  ✅ MODIFIÉ - Utilise DevisRecap
│   ├── pages/
│   │   └── devis/
│   │       ├── DevisConfirmation.js      ✅ NOUVEAU - Page confirmation + PDF
│   │       └── DevisConfirmation.css     ✅ NOUVEAU - Design confirmation
│   └── App.js                       ✅ MODIFIÉ - Routes ajoutées
```

---

## 🚀 Workflow complet

### 1. Création du devis
```
Client remplit formulaire
  ↓
POST /api/devis/brouillon
  ↓
Calcul automatique frais kilométriques
  ↓
Devis créé avec fraisKilometriques
  ↓
Retour devisId au client
```

### 2. Étapes du workflow
```
1. Informations contact
2. Type événement
3. Date & lieu → CALCUL DISTANCE AUTOMATIQUE
4. Nombre invités
5. Sélection prestations
6. Sélection matériels
7. Demandes spéciales
8. RÉCAPITULATIF DÉTAILLÉ (avec frais km)
9. Validation & CGV
10. Soumission
```

### 3. Après validation
```
Devis soumis
  ↓
Redirection → /devis/:devisId/confirmation
  ↓
Page de confirmation affichée
  ↓
Bouton "Télécharger PDF"
  ↓
GET /api/devis/:devisId/pdf
  ↓
Génération PDF avec pdfService
  ↓
Téléchargement automatique
```

---

## ⚙️ Configuration requise

### Variables d'environnement (.env)
```env
# Calcul distance
ADRESSE_ENTREPRISE=Paris, France
TARIF_KILOMETRIQUE=0.50
KM_GRATUITS=30

# API URL
REACT_APP_API_URL=http://localhost:5001
```

### Dépendances installées

**Backend:**
- `node-geocoder` - Géocodage d'adresses
- `pdfkit` - Génération de PDF

**Frontend:**
- `jspdf` - PDF côté client (optionnel)
- `jspdf-autotable` - Tables professionnelles

---

## 🧪 Tests

### Tester le calcul de distance
```bash
# Dans le backend
cd backend
node -e "
const { calculerFraisKilometriques } = require('./src/utils/distanceService');
calculerFraisKilometriques('Paris, France', 'Lyon, France')
  .then(res => console.log('✅ Résultat:', res))
  .catch(err => console.error('❌ Erreur:', err));
"
```

### Tester la génération PDF
```bash
# Créer un devis de test et obtenir son ID
curl -X POST http://localhost:5001/api/devis/brouillon \
  -H "Content-Type: application/json" \
  -d '{
    "client": {
      "prenom": "Test",
      "nom": "User",
      "email": "test@example.com",
      "telephone": "0123456789"
    },
    "typeEvenement": "Mariage",
    "lieuAdresse": "123 rue Example",
    "lieuVille": "Lyon"
  }'

# Télécharger le PDF
curl http://localhost:5001/api/devis/{DEVIS_ID}/pdf --output test.pdf
```

---

## 📱 Interface utilisateur

### Page de récapitulatif
- **URL**: étape "recapitulatif" dans le workflow
- **Composant**: `DevisRecap`
- **Fonctionnalités**:
  - Affichage complet de toutes les sélections
  - Calcul des totaux en temps réel
  - Détail des frais kilométriques (si adresse fournie)
  - Bouton "Modifier" pour retour en arrière
  - Bouton "Valider" pour continuer

### Page de confirmation
- **URL**: `/devis/:devisId/confirmation`
- **Composant**: `DevisConfirmation`
- **Fonctionnalités**:
  - Message de succès avec numéro de devis
  - Bouton de téléchargement PDF
  - Timeline des prochaines étapes
  - Récapitulatif rapide en cartes
  - Info sur l'email de confirmation
  - Boutons de navigation (accueil, connexion, contact)
  - Section d'aide avec contacts

---

## 🎨 Design

### Thème
- Gradient noir: `#000000 → #1a1a1a → #2a2a2a`
- Accent: Gradient violet/bleu `#667eea → #764ba2`
- Texte: Blanc avec opacités variées

### Animations
- Slide-in pour les sections du récap
- Bounce pour l'icône de succès
- Hover effects sur les cartes
- Transitions fluides

### Responsive
- Mobile first
- Breakpoints: 480px, 768px
- Tableaux scrollables sur mobile
- Colonnes masquées intelligemment

---

## 🔒 Sécurité

### Authentification
- Routes protégées par middleware `authClient`
- Vérification du propriétaire du devis
- Token JWT dans headers

### Validation
- Adresses géocodées avant calcul
- Montants calculés côté serveur
- Pas de manipulation client-side des prix

---

## 📊 Récapitulatif des améliorations

| Fonctionnalité | Avant | Après |
|----------------|-------|-------|
| **Frais de déplacement** | ❌ Ajout manuel | ✅ Calcul automatique basé sur adresse |
| **Récapitulatif** | ⚠️ Basique | ✅ Professionnel avec tous les détails |
| **PDF** | ❌ Inexistant | ✅ Génération automatique pro |
| **Distance** | ❌ Non géré | ✅ Géocodage + Haversine + A/R |
| **Tarification km** | ❌ N/A | ✅ Configurable (30km gratuits + 0.50€/km) |
| **Transparence** | ⚠️ Limitée | ✅ Détail complet des calculs |

---

## 🚀 Déploiement

### Backend (Render)
1. Ajouter les variables d'environnement
2. Créer le dossier `uploads/devis/`
3. Redémarrer le service

### Frontend (Vercel)
1. Variables d'env: `REACT_APP_API_URL`
2. Rebuild
3. Vérifier les routes

---

## 📞 Support

En cas de problème:
1. Vérifier les logs backend pour le calcul de distance
2. Tester le géocodage avec une adresse connue
3. Vérifier que le dossier `uploads/devis/` existe et est accessible
4. Confirmer que PDFKit est bien installé

---

**Dernière mise à jour**: 17 février 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
