# 📋 TÂCHES FRONTEND - SYSTÈME RÔLES & TÉMOIGNAGES
## À développer - Priorités définies

---

## 🔴 PRIORITÉ 1 - ADMIN SETTINGS PAGE (6-8h)

### Page: AdminSettingsPage.js
**Chemin**: `frontend/src/pages/admin/AdminSettingsPage.js`
**Route**: `/admin/settings` (protégée, role='admin' requis)

#### 📦 Composants à créer:

1. **UserManagementTab.js** (4h)
   - Table Material-UI avec colonnes:
     - Photo + Nom complet
     - Email
     - Rôle (badge coloré)
     - Statut (toggle isActive)
     - Dernière connexion
     - Actions (icône éditer, icône supprimer)
   
   - **Filtres**:
     - Dropdown rôle (tous, prospect, client, prestataire, valideur, admin)
     - Input search (nom, email, entreprise)
     - Toggle "Actifs uniquement"
   
   - **Pagination**: 10/25/50 par page
   
   - **Actions**:
     - Clic sur ligne → ouvre PermissionsModal
     - Toggle isActive → appel PUT /api/users/:id/status
     - Icône supprimer → confirm modal → DELETE /api/users/:id

2. **PermissionsModal.js** (2h)
   - **Header**: Photo + Nom + Email utilisateur
   
   - **Section Rôle**:
     - Dropdown: prospect | client | prestataire | valideur | admin
     - Bouton "Définir permissions par défaut" (appelle setDefaultPermissions)
   
   - **Section Permissions** (7 checkboxes):
     ```
     [ ] Voir tous les devis (canViewAllDevis)
     [ ] Valider les devis (canValidateDevis)
     [ ] Gérer les utilisateurs (canManageUsers)
     [ ] Gérer les paramètres (canManageSettings)
     [ ] Gérer les prestations (canManagePrestations)
     [ ] Gérer le matériel (canManageMateriel)
     [ ] Voir les rapports (canViewReports)
     ```
   
   - Si role='admin': Checkboxes disabled avec message "Admin a toutes les permissions"
   
   - **Boutons footer**:
     - Annuler (ferme modal sans sauver)
     - Enregistrer (PUT /api/users/:id/role + PUT /api/users/:id/permissions)

3. **StatsCards.js** (1h)
   - Cartes avec icônes:
     - 👥 Total utilisateurs (avec évolution +X ce mois)
     - ✅ Utilisateurs actifs (pourcentage)
     - 🌱 Prospects (count)
     - 💼 Clients (count)
     - 🎵 Prestataires (count)
     - 🔍 Valideurs (count)
     - 🏆 Admins (count)
   
   - Source: GET /api/users/stats

4. **SystemSettingsTab.js** (1.5h)
   - **Logo et Identité**:
     - Prévisualisation logo actuel
     - Upload nouveau logo (drag & drop ou bouton)
     - Format accepté: PNG, JPG, SVG (max 2MB)
     - Dimensions recommandées affichées
     - Bouton "Réinitialiser au logo par défaut"
   
   - **Réseaux sociaux**:
     - Inputs: Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok
     - Toggle actif/inactif pour chaque
     - Prévisualisation icônes avec liens
   
   - **Informations entreprise**:
     - Nom, Slogan, Description
     - Email, Téléphone
     - Adresse complète
   
   - **Bouton Enregistrer**: PUT /api/settings

#### 🎨 Design:
- Tabs Material-UI en haut (Utilisateurs | Paramètres Système)
- Cards blanches avec ombres légères
- Badges colorés par rôle:
  - Admin: Rouge (#f44336)
  - Valideur: Bleu (#2196f3)
  - Prestataire: Violet (#9c27b0)
  - Client: Vert (#4caf50)
  - Prospect: Gris (#9e9e9e)
- Icônes Material-UI (Edit, Delete, Check, Close)

#### 📡 API Calls:
```javascript
// Récupérer liste utilisateurs
axios.get('/api/users', {
  params: { page, limit, role, search, statut },
  headers: { Authorization: `Bearer ${token}` }
})

// Modifier rôle
axios.put(`/api/users/${userId}/role`, 
  { role: 'client' },
  { headers: { Authorization: `Bearer ${token}` }}
)

// Modifier permissions
axios.put(`/api/users/${userId}/permissions`, 
  { permissions: { canViewAllDevis: true, ... } },
  { headers: { Authorization: `Bearer ${token}` }}
)

// Toggle statut
axios.put(`/api/users/${userId}/status`, 
  { isActive: false },
  { headers: { Authorization: `Bearer ${token}` }}
)

// Supprimer
axios.delete(`/api/users/${userId}`, {
  headers: { Authorization: `Bearer ${token}` }
})

// Stats
axios.get('/api/users/stats', {
  headers: { Authorization: `Bearer ${token}` }
})
```

---

## 🟠 PRIORITÉ 2 - TÉMOIGNAGES SYSTÈME (5-7h)

### 1. TemoignagesSection.js (2h)
**Chemin**: `frontend/src/components/Temoignages/TemoignagesSection.js`
**Usage**: Page Accueil (featured uniquement) + Page `/temoignages` (tous)

#### Fonctionnalités:
- Affichage grille 3 colonnes (responsive 1 col mobile)
- Filtres étoiles (boutons: Tous | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐)
- Pagination 9 témoignages par page
- Carte stats en haut: Note moyenne ⭐ X.X/5 | XXX avis clients

#### API:
```javascript
axios.get('/api/temoignages', {
  params: { page: 1, limit: 9, note: 5, featured: true }
})
```

#### Props:
```javascript
<TemoignagesSection 
  featured={true}  // Si true, affiche seulement isFeatured=true
  limit={6}        // Nombre max à afficher
  showFilters={true}
/>
```

---

### 2. TemoignageCard.js (1.5h)
**Chemin**: `frontend/src/components/Temoignages/TemoignageCard.js`

#### Contenu:
```
┌─────────────────────────────┐
│ 👤 Photo   Jean Dupont      │
│            Mariage - 15/01  │
│ ⭐⭐⭐⭐⭐                    │
├─────────────────────────────┤
│ "Prestation exceptionnelle  │
│  DJ professionnel..."       │
│                             │
│ [Voir plus]                 │
├─────────────────────────────┤
│ 👍 15 personnes ont trouvé  │
│    cela utile  [Utile]      │
├─────────────────────────────┤
│ 💬 Réponse ELIJAH'GOD:      │
│    "Merci Jean ! ..."       │
└─────────────────────────────┘
```

#### Interactions:
- Clic "Utile" → POST /api/temoignages/:id/utile (si authentifié)
- Animation +1 sur compteur likes
- Bouton disabled si déjà marqué utile
- Badge "⭐ Coup de coeur" si isFeatured=true

---

### 3. TemoignageForm.js (2h)
**Chemin**: `frontend/src/components/Temoignages/TemoignageForm.js`
**Modes**: Modal OU Page dédiée `/temoignage/nouveau`

#### Version Authentifiée (clients):
```javascript
POST /api/temoignages
{
  titre: "Prestation au top !",
  contenu: "Je recommande vivement...",
  note: 5,
  devisId: "672def...", // Optionnel
  prestationsCommentees: ["672..."], // Optionnel
  materielsCommentes: ["673..."] // Optionnel
}
```

#### Champs:
1. **Note** (obligatoire): Sélecteur étoiles cliquable
2. **Titre** (obligatoire, max 100 chars)
3. **Votre avis** (obligatoire, textarea, 10-1000 chars, compteur)
4. **Événement concerné** (dropdown des devis du client, optionnel)
5. Checkbox CGU: "J'accepte que mon avis soit publié"

#### Version Externe (visiteurs):
```javascript
POST /api/temoignages/externe
{
  nom: "Marie Martin",
  entreprise: "Mairie de Paris",
  email: "marie@example.com",
  titre: "...",
  contenu: "...",
  note: 4
}
```

#### Champs supplémentaires:
1. **Nom complet** (obligatoire)
2. **Entreprise/Événement** (optionnel)
3. **Email** (obligatoire, format validation)

#### Validation frontend:
- Note obligatoire (1-5)
- Contenu min 10 chars, max 1000
- Email format valide (externe uniquement)
- CGU cochée

#### Messages:
- Succès: "✅ Merci ! Votre témoignage sera publié après modération."
- Erreur: Toast avec message d'erreur

---

### 4. ModerationPanel.js (1.5h)
**Chemin**: `frontend/src/pages/admin/ModerationPanel.js`
**Route**: `/admin/temoignages` (protégée, valideurOrAdmin)

#### Layout:
- Tabs: En attente (badge count) | Approuvés | Refusés
- Table avec colonnes:
  - Date soumission
  - Auteur (nom + photo si auth, sinon "Externe")
  - ⭐ Note
  - Extrait contenu (100 chars)
  - Actions

#### Section "En attente":
```javascript
GET /api/temoignages/moderation
```

#### Actions par ligne:
1. **Bouton Voir détail** → Ouvre DetailModal:
   - Affiche témoignage complet
   - Info auteur (email, entreprise, devis lié)
   - Métadonnées (IP, userAgent, date)
   
2. **Bouton Approuver** ✅:
   ```javascript
   PUT /api/temoignages/:id/approuver
   { isFeatured: false } // Checkbox "Mettre en avant"
   ```
   
3. **Bouton Refuser** ❌:
   - Ouvre modal avec input "Raison du refus" (obligatoire)
   ```javascript
   PUT /api/temoignages/:id/refuser
   { raison: "Contenu inapproprié" }
   ```

4. **Bouton Répondre** 💬 (admin uniquement):
   ```javascript
   POST /api/temoignages/:id/repondre
   { texte: "Merci pour votre retour !" }
   ```

#### Stats en haut:
- En attente: X témoignages
- Taux d'approbation: XX%
- Note moyenne des approuvés: ⭐ X.X/5

---

## 🟡 PRIORITÉ 3 - COMPOSANTS COMMUNS (2-3h)

### 1. SocialMediaLinks.js (1h)
**Chemin**: `frontend/src/components/common/SocialMediaLinks.js`

#### Fonctionnalités:
- Récupère settings: `GET /api/settings`
- Affiche seulement les liens actifs avec URL renseignée
- Icônes: React Icons (FaFacebook, FaInstagram, etc.)
- 2 variantes: 
  - `variant="footer"` → icônes blanches 32px avec hover effet
  - `variant="inline"` → icônes colorées 24px

#### Props:
```javascript
<SocialMediaLinks 
  variant="footer"      // "footer" | "inline"
  color="#ffffff"       // Couleur icônes
  size={32}             // Taille px
  spacing={16}          // Espacement entre icônes
/>
```

#### Usage:
- Footer (toutes pages)
- Page Contact
- Header optionnel (mobile burger menu)

---

### 2. UserBadge.js (1h)
**Chemin**: `frontend/src/components/common/UserBadge.js`

#### Badges par rôle:
```javascript
const ROLE_COLORS = {
  admin: { bg: '#f44336', text: '#fff', icon: '🏆' },
  valideur: { bg: '#2196f3', text: '#fff', icon: '🔍' },
  prestataire: { bg: '#9c27b0', text: '#fff', icon: '🎵' },
  client: { bg: '#4caf50', text: '#fff', icon: '💼' },
  prospect: { bg: '#9e9e9e', text: '#fff', icon: '🌱' }
}
```

#### Tooltip hover:
- Affiche nom du rôle en français
- Liste des permissions actives (si prop `showPermissions={true}`)

#### Props:
```javascript
<UserBadge 
  role="admin"
  showPermissions={true}
  size="small"  // "small" | "medium" | "large"
/>
```

#### Usage:
- Table utilisateurs (admin panel)
- Profil utilisateur (coin supérieur droit)
- Liste commentaires/témoignages

---

## 🎯 CHECKLIST DÉVELOPPEMENT

### Avant de commencer:
- [ ] Lancer backend: `cd backend && npm run dev`
- [ ] Lancer frontend: `cd frontend && npm start`
- [ ] Créer un compte admin test
- [ ] Importer Material-UI: `npm install @mui/material @emotion/react @emotion/styled`
- [ ] Importer React Icons: `npm install react-icons`

### Phase 1 - Admin Settings:
- [ ] Créer dossier `frontend/src/pages/admin/`
- [ ] AdminSettingsPage.js (structure + routing)
- [ ] UserManagementTab.js (table + filtres)
- [ ] PermissionsModal.js (formulaire + checkboxes)
- [ ] StatsCards.js (appel API stats)
- [ ] SystemSettingsTab.js (formulaire settings)
- [ ] Tester tous les endpoints users

### Phase 2 - Témoignages:
- [ ] Créer dossier `frontend/src/components/Temoignages/`
- [ ] TemoignagesSection.js (grille + filtres)
- [ ] TemoignageCard.js (affichage card)
- [ ] TemoignageForm.js (2 modes: auth + externe)
- [ ] ModerationPanel.js (admin/valideur)
- [ ] Intégrer sur homepage (section featured)
- [ ] Créer page `/temoignages`
- [ ] Tester workflow complet modération

### Phase 3 - Composants:
- [ ] SocialMediaLinks.js (2 variants)
- [ ] UserBadge.js (5 rôles)
- [ ] Intégrer dans Footer
- [ ] Intégrer dans Header mobile
- [ ] Page Contact

---

## 🧪 TESTS MANUELS

### Admin Settings:
1. [ ] Admin peut voir liste complète utilisateurs
2. [ ] Filtres fonctionnent (rôle, search, statut)
3. [ ] Modification rôle met à jour permissions par défaut
4. [ ] Cannot modifier permissions admin
5. [ ] Cannot se supprimer soi-même
6. [ ] Cannot se désactiver soi-même
7. [ ] Cannot supprimer user avec devis existants
8. [ ] Toggle isActive fonctionne immédiatement
9. [ ] Stats s'actualisent après modifications

### Témoignages:
1. [ ] Client auth peut créer témoignage
2. [ ] Visiteur non-auth peut créer témoignage externe
3. [ ] Témoignages en attente visibles dans panel modération
4. [ ] Admin/Valideur peut approuver
5. [ ] Refus nécessite raison obligatoire
6. [ ] Témoignage approuvé apparaît publiquement
7. [ ] Featured s'affiche en premier
8. [ ] Like fonctionne (auth uniquement)
9. [ ] Like ne peut pas être dupliqué
10. [ ] Admin peut répondre
11. [ ] Réponse admin s'affiche sur card publique
12. [ ] Filtres étoiles fonctionnent
13. [ ] Pagination fonctionne

### Auto-promotion:
1. [ ] Créer compte prospect
2. [ ] Faire demande devis
3. [ ] Admin valide le devis
4. [ ] Vérifier que rôle = 'client' automatiquement
5. [ ] Vérifier entrée dans historique devis

---

## 📚 RESSOURCES

### Documentation API:
- `SYSTEME_ROLES_RAPPORT.md` - Documentation complète backend
- `backend/src/routes/userRoutes.js` - Endpoints users
- `backend/src/routes/temoignageRoutes.js` - Endpoints témoignages

### Design inspiration:
- Material-UI Components: https://mui.com/material-ui/getting-started/
- React Icons Gallery: https://react-icons.github.io/react-icons/

### Endpoints backend:
- Users: `http://localhost:5001/api/users`
- Témoignages: `http://localhost:5001/api/temoignages`
- Settings: `http://localhost:5001/api/settings`

---

**Date**: 17 Février 2026
**Estimation totale**: 13-18 heures développement frontend
**Backend status**: ✅ Production-ready
