# 📋 SYSTÈME DE DEVIS INTERACTIF WORKFLOW

## Vue d'ensemble

Système complet de construction de devis guidée avec assistant conversationnel, workflow de validation, transformation en contrat, et signatures électroniques.

---

## 🎯 Fonctionnalités principales

### 1. **Construction Interactive**
- ✅ Assistant virtuel qui guide le client étape par étape
- ✅ Interface conversationnelle (question/réponse)
- ✅ Calcul en temps réel du montant total
- ✅ Sauvegarde automatique à chaque étape
- ✅ Indicateur de progression visuel

### 2. **Création de Compte Automatique**
- ✅ Si client non connecté → création compte automatique
- ✅ Envoi email de vérification
- ✅ Authentification JWT (30 jours)
- ✅ Dashboard personnel avec historique devis

### 3. **Workflow Complet (15 statuts)**
```
brouillon → soumis → en_etude → modifie_admin → 
attente_validation_client → valide_client → accepte → 
entretien_prevu → transforme_contrat → contrat_signe → valide_final
```

### 4. **Entretiens (Physique ou Visio)**
- ✅ Client peut demander un entretien
- ✅ Admin planifie (date, lieu/lien, durée)
- ✅ Notifications email automatiques
- ✅ Statuts: non_prevu → a_planifier → planifie → effectue

### 5. **Contrats & Signatures**
- ✅ Transformation devis → contrat (numéro unique)
- ✅ Signature électronique canvas (client + admin)
- ✅ Consentement CGV obligatoire
- ✅ Génération PDF (à implémenter)

### 6. **Historique Complet**
- ✅ Chaque action enregistrée avec date/auteur
- ✅ Conversation guidée sauvegardée
- ✅ Modifications admin tracées

---

## 📊 Structure des Données

### Modèle Devis (16 sections)

#### 1. Référence Client
```javascript
{
  clientId: ObjectId,  // Lien vers Client
  client: {            // Copie pour historique
    nom, prenom, email, telephone, adresse, entreprise
  }
}
```

#### 2. Détails Événement
```javascript
evenement: {
  type: 'Mariage' | 'Anniversaire' | ...,
  titre: "Mariage de Marie et Jean",
  description: String,
  date: Date,
  heureDebut, heureFin, dureeEstimee,
  lieu: { nom, adresse, ville, codePostal, typeVenue },
  nbInvites: Number,
  nbInvitesEstime: "50-100",
  thematique, ambiance
}
```

#### 3. Prestations Sélectionnées
```javascript
prestations: [{
  prestation: ObjectId,
  prestataire: ObjectId,
  nom, categorie,
  quantite, duree,
  prixUnitaire, prixTotal,
  options: { weekend, nuit, installation, personnalisation },
  commentaire
}]
```

#### 4. Matériel Sélectionné
```javascript
materiels: [{
  materiel: ObjectId,
  prestataire: ObjectId,
  nom, categorie,
  quantite,
  dateDebut, dateFin,
  prixLocation: { jour, total, caution },
  options: { livraison, installation, fraisLivraison, fraisInstallation }
}]
```

#### 5. Tarification Complète
```javascript
montants: {
  sousTotalPrestations: Number,
  sousTotalMateriels: Number,
  fraisSupplementaires: [{ libelle, montant }],
  totalAvantRemise: Number,
  remise: { type: 'pourcentage'|'montant', valeur, raison },
  montantRemise: Number,
  totalFinal: Number,       // HT
  acompte: { pourcentage: 30, montant },
  tauxTVA: 20,
  montantTVA: Number,
  totalTTC: Number
}
```

#### 6. Workflow & Statuts
```javascript
statut: 'brouillon' | 'soumis' | ...,
etapeActuelle: 'informations' | 'type_evenement' | ...,
progressionPourcentage: 0-100
```

#### 7. Signatures Électroniques
```javascript
signatures: {
  client: {
    signePar: String,
    dateSignature: Date,
    ipAddress: String,
    signatureData: String,  // Base64 canvas
    consentement: { cgv, traitementDonnees, annulation }
  },
  admin: { signePar, dateSignature, signatureData }
}
```

#### 8. Entretien
```javascript
entretien: {
  demande: Boolean,
  type: 'physique' | 'visio' | 'non_necessaire',
  statut: 'non_prevu' | 'a_planifier' | 'planifie' | 'effectue',
  dateConfirmee: Date,
  lieu: String,
  lienVisio: String,
  dureeEstimee: Number,
  notesEntretien: String,
  compteRendu: String
}
```

#### 9. Documents Générés
```javascript
documents: {
  devisPdf: { url, genereLe, version },
  contratPdf: { url, genereLe, version },
  facture: { url, genereLe },
  autres: [{ nom, url, type, uploadLe }]
}
```

---

## 🛣️ API Endpoints

### Routes Client

#### `POST /api/devis/brouillon`
Créer un nouveau brouillon (+ compte auto si besoin)
```javascript
Body: {
  client: {
    prenom: "Jean",
    nom: "Dupont",
    email: "jean@example.com",
    telephone: "+33612345678",
    password: "motdepasse" // optionnel
  },
  source: "web"
}

Response: {
  success: true,
  message: "✅ Brouillon créé",
  devis: {
    _id: "...",
    numeroDevis: "EG-202402-0001",
    statut: "brouillon",
    etapeActuelle: "informations",
    progressionPourcentage: 10
  }
}
```

#### `PUT /api/devis/:devisId/etape`
Sauvegarder une étape du workflow
```javascript
Headers: { Authorization: "Bearer <token>" }

Body: {
  etape: "type_evenement",
  data: {
    type: "Mariage",
    titre: "Mariage de Marie et Jean",
    description: "Cérémonie + cocktail + soirée",
    thematique: "Bohème chic",
    ambiance: "Élégante et festive"
  }
}

Response: {
  success: true,
  message: "✅ Étape sauvegardée",
  devis: {
    _id, numeroDevis, statut,
    etapeActuelle: "date_lieu",  // Étape suivante
    progressionPourcentage: 30,
    montants: {...},
    conversation: [...]
  }
}
```

**Étapes disponibles:**
- `informations` (initiale)
- `type_evenement`
- `date_lieu`
- `invites`
- `prestations`
- `materiels`
- `demandes_speciales`
- `recapitulatif`
- `validation`

#### `POST /api/devis/:devisId/soumettre`
Soumettre le devis finalisé
```javascript
Headers: { Authorization: "Bearer <token>" }

Response: {
  success: true,
  message: "✅ Devis soumis avec succès!",
  devis: { _id, numeroDevis, statut: "soumis", montants }
}
// Email confirmé envoyé au client
```

#### `GET /api/devis/mes-devis?statut=soumis&page=1&limit=10`
Lister mes devis
```javascript
Headers: { Authorization: "Bearer <token>" }

Response: {
  success: true,
  devis: [{
    numeroDevis: "EG-202402-0001",
    evenement: { type, titre, date },
    statut: "soumis",
    montants: { totalTTC: 5000 },
    dates: { creation, soumission },
    progressionPourcentage: 100
  }],
  pagination: { page: 1, total: 15, pages: 2 }
}
```

#### `GET /api/devis/:devisId`
Détails complets d'un devis
```javascript
Headers: { Authorization: "Bearer <token>" }

Response: {
  success: true,
  devis: { /* Objet complet avec toutes les données */ }
}
```

#### `PUT /api/devis/:devisId/valider-modifications`
Valider ou refuser les modifications admin
```javascript
Headers: { Authorization: "Bearer <token>" }

Body: {
  accepte: true  // ou false pour refuser
}

Response: {
  success: true,
  message: "✅ Modifications validées",
  devis: { statut: "valide_client", ... }
}
```

#### `POST /api/devis/:devisId/signer`
Signer le contrat (canvas signature)
```javascript
Headers: { Authorization: "Bearer <token>" }

Body: {
  partie: "client",  // ou "admin"
  signatureData: "<base64_canvas_data>",
  signataire: "Jean Dupont",
  consentement: {
    cgv: true,
    traitementDonnees: true,
    annulation: true
  }
}

Response: {
  success: true,
  message: "✅ Signature client enregistrée",
  devis: { statut: "contrat_signe", ... }
}
```

---

### Routes Admin

#### `GET /api/devis/admin/tous?statut=soumis&page=1&search=jean`
Lister tous les devis
```javascript
Headers: { Authorization: "Bearer <admin_token>" }

Response: {
  success: true,
  devis: [{ clientId, numeroDevis, evenement, statut, montants, dates }],
  pagination: {...}
}
```

#### `PUT /api/devis/admin/:devisId/valider`
Valider, modifier ou refuser un devis
```javascript
Headers: { Authorization: "Bearer <admin_token>" }

Body: {
  action: "proposition",  // 'validation', 'proposition', 'refus'
  message: "Voici notre proposition adaptée...",
  modifications: "Ajout DJ pour 4h, retrait éclairage LED",
  nouveauMontant: 4500,  // optionnel
  justification: "Budget optimisé selon vos besoins"
}

Response: {
  success: true,
  message: "✅ Devis mis à jour",
  devis: { statut: "modifie_admin", reponsesAdmin: [...] }
}
// Email envoyé au client
```

#### `POST /api/devis/admin/:devisId/transformer-contrat`
Transformer devis validé en contrat
```javascript
Headers: { Authorization: "Bearer <admin_token>" }

Response: {
  success: true,
  message: "✅ Devis transformé en contrat",
  numeroContrat: "CONT-202402-0001",
  devis: { numeroContrat, statut: "transforme_contrat", ... }
}
```

#### `POST /api/devis/admin/:devisId/planifier-entretien`
Planifier un entretien
```javascript
Headers: { Authorization: "Bearer <admin_token>" }

Body: {
  date: "2024-02-20T14:00:00Z",
  lieu: "Bureau ElijahGod Events, 123 rue...",  // Si physique
  lienVisio: "https://meet.google.com/abc-def-ghi",  // Si visio
  dureeEstimee: 60  // minutes
}

Response: {
  success: true,
  message: "✅ Entretien planifié",
  devis: { entretien: { statut: "planifie", ... } }
}
// Email envoyé au client
```

---

## 🔐 Authentification

### Client

#### `POST /api/clients/inscription`
```javascript
Body: {
  prenom: "Jean",
  nom: "Dupont",
  email: "jean@example.com",
  password: "motdepasse",
  telephone: "+33612345678"
}

Response: {
  success: true,
  message: "✅ Inscription réussie! Vérifiez votre email.",
  token: "<jwt_token>",
  client: { _id, prenom, nom, email, isEmailVerified: false }
}
```

#### `POST /api/clients/connexion`
```javascript
Body: {
  email: "jean@example.com",
  password: "motdepasse"
}

Response: {
  success: true,
  message: "🎉 Bienvenue Jean!",
  token: "<jwt_token>",
  client: { _id, prenom, nom, email, isEmailVerified: true }
}
```

#### `GET /api/clients/verifier-email/:token`
Vérification email après inscription

#### `POST /api/clients/demander-reset-password`
#### `POST /api/clients/reset-password/:token`

#### `GET /api/clients/profil`
#### `PUT /api/clients/profil`
#### `POST /api/clients/changer-mot-de-passe`
#### `GET /api/clients/statistiques`

---

## 💻 Intégration Frontend

### Exemple: Page de construction de devis

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function DevisBuilder() {
  const [etapeActuelle, setEtapeActuelle] = useState('informations');
  const [devisId, setDevisId] = useState(null);
  const [progression, setProgression] = useState(0);
  const [montant, setMontant] = useState(0);
  const [conversation, setConversation] = useState([]);

  // 1. Créer brouillon au montage
  useEffect(() => {
    const creerBrouillon = async () => {
      const response = await axios.post('/api/devis/brouillon', {
        client: getUserFromStorage(),
        source: 'web'
      });
      setDevisId(response.data.devis._id);
      setEtapeActuelle(response.data.devis.etapeActuelle);
    };
    creerBrouillon();
  }, []);

  // 2. Sauvegarder une étape
  const sauvegarderEtape = async (etape, data) => {
    const response = await axios.put(
      `/api/devis/${devisId}/etape`,
      { etape, data },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setEtapeActuelle(response.data.devis.etapeActuelle);
    setProgression(response.data.devis.progressionPourcentage);
    setMontant(response.data.devis.montants.totalTTC);
    setConversation(response.data.devis.conversation);
  };

  // 3. Soumettre le devis
  const soumettre = async () => {
    await axios.post(
      `/api/devis/${devisId}/soumettre`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Rediriger vers page confirmation
  };

  return (
    <div className="devis-builder">
      {/* Barre de progression */}
      <div className="progress-bar">
        <div style={{width: `${progression}%`}}></div>
      </div>

      {/* Assistant conversationnel */}
      <div className="conversation">
        {conversation.map(msg => (
          <div className={`message ${msg.source}`}>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>

      {/* Formulaire selon l'étape */}
      {etapeActuelle === 'type_evenement' && (
        <TypeEvenementForm 
          onSubmit={(data) => sauvegarderEtape('type_evenement', data)} 
        />
      )}

      {/* Affichage prix en temps réel */}
      <div className="montant-total">
        <h3>Total estimé: {montant.toFixed(2)} €</h3>
      </div>
    </div>
  );
}
```

### Exemple: Dashboard client

```javascript
function ClientDashboard() {
  const [devis, setDevis] = useState([]);

  useEffect(() => {
    const chargerDevis = async () => {
      const response = await axios.get('/api/devis/mes-devis', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevis(response.data.devis);
    };
    chargerDevis();
  }, []);

  return (
    <div className="dashboard">
      <h1>Mes devis</h1>
      <div className="devis-grid">
        {devis.map(d => (
          <div className="devis-card" key={d._id}>
            <span className={`badge ${d.statut}`}>{d.statut}</span>
            <h3>{d.numeroDevis}</h3>
            <p>{d.evenement.type} - {d.evenement.titre}</p>
            <p>{new Date(d.evenement.date).toLocaleDateString()}</p>
            <p className="montant">{d.montants.totalTTC.toFixed(2)} €</p>
            <Link to={`/devis/${d._id}`}>Voir détails</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📧 Notifications Email

### Emails automatiques envoyés:

1. **Création compte** → Lien vérification email
2. **Devis soumis** → Confirmation client + notification admin
3. **Admin modifie** → Notification client avec lien validation
4. **Client valide** → Notification admin
5. **Contrat généré** → Envoi PDF aux 2 parties
6. **Entretien planifié** → Rappel avec date/lieu/lien
7. **Contrat signé** → Confirmation finale

---

## 🎨 Étapes Frontend à créer

### Pages nécessaires:

1. **DevisBuilderPage** (client)
   - Wizard multi-étapes avec assistant conversationnel
   - Barre de progression
   - Prix en temps réel
   - Sauvegarde automatique

2. **ClientDashboardPage** (client)
   - Liste devis avec statuts
   - Filtres (brouillon, soumis, validés, refusés)
   - Statistiques (total dépensé, nombre événements)

3. **DevisDetailsPage** (client/admin)
   - Affichage complet du devis
   - Historique des modifications
   - Chat admin/client
   - Actions selon statut

4. **AdminDevisListPage** (admin)
   - Table avec tous les devis
   - Filtres avancés
   - Recherche
   - Actions en masse

5. **AdminDevisValidationPage** (admin)
   - Formulaire validation/modification
   - Suggestion montants
   - Historique conversation
   - Planifier entretien

6. **ContratSignaturePage** (client/admin)
   - Canvas signature électronique
   - CGV à cocher
   - Prévisualisation PDF

---

## 🔧 Configuration Requise

### Variables d'environnement (.env)

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/elijahgod
JWT_SECRET=<64+ caractères random>
FRONTEND_URL=http://localhost:3001

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@elijahgod.com
SMTP_PASS=<password>
SMTP_FROM=noreply@elijahgod.com
COMPANY_NAME=ElijahGod Events
```

---

## 🚀 Prochaines étapes (À implémenter)

### Priorité 1 (Fonctionnel minimal)
- [ ] Créer toutes les pages frontend (React)
- [ ] Formulaires multi-étapes avec validation
- [ ] Assistant conversationnel UI/UX
- [ ] Canvas signature électronique
- [ ] Tests E2E du workflow complet

### Priorité 2 (Amélioration)
- [ ] Génération PDF (pdfkit ou Puppeteer)
- [ ] Upload vers cloud (Cloudinary)
- [ ] Système de paiements (PayPal SDK)
- [ ] Notifications push (Firebase)
- [ ] Chat en temps réel (Socket.io)

### Priorité 3 (Avancé)
- [ ] Templates de contrats personnalisables
- [ ] Rappels automatiques (cron jobs)
- [ ] Analytics (Google Analytics)
- [ ] Exports Excel (admin)
- [ ] API webhooks pour intégrations tierces

---

## 📝 Notes Techniques

### Calcul des montants
La méthode `calculerMontants()` du modèle Devis:
- Additionne prestations + matériels
- Applique remises (% ou montant fixe)
- Calcule TVA (20%)
- Calcule acompte (30% par défaut)

### Workflow states
Les transitions sont contrôlées par le backend:
```
Seul le client peut: soumettre, valider modifications, signer
Seul l'admin peut: valider, modifier, transformer en contrat, planifier entretien
```

### Sécurité
- JWT avec expiration 30 jours (clients) / 7 jours (admin)
- Vérification propriété du devis sur chaque requête
- Consentement CGV obligatoire avant signature
- IP address enregistrée lors de signature

---

## 📞 Support

Pour toute question sur l'implémentation:
- **Backend**: Voir `backend/src/controllers/devisController.js`
- **Modèle**: Voir `backend/src/models/Devis.js`
- **Routes**: Voir `backend/src/routes/devisRoutes.js`

---

*Documentation générée le 17 février 2026*
