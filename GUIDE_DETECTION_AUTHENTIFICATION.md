# 🔐 GUIDE - DÉTECTION D'AUTHENTIFICATION

## 📋 Table des Matières
1. [Vue d'ensemble du système](#vue-densemble-du-système)
2. [Vérifier dans les composants](#vérifier-dans-les-composants)
3. [Vérifier dans le navigateur](#vérifier-dans-le-navigateur)
4. [Patterns courants](#patterns-courants)
5. [Composant de debug](#composant-de-debug)
6. [Protection des routes](#protection-des-routes)

---

## Vue d'ensemble du système

### 🎯 3 Systèmes d'authentification séparés

ELIJAHGOD utilise **3 systèmes d'authentification distincts** pour 3 types d'utilisateurs :

| Type | Context | Token localStorage | État principal | Flag auth |
|------|---------|-------------------|----------------|-----------|
| **Admin** 👑 | `AdminContext` | `adminToken` | `admin` | *(pas de flag)* |
| **Client** 👤 | `ClientContext` | `clientToken` | `client` | `isAuthenticated` |
| **Prestataire** 🎤 | `PrestataireContext` | `prestataireToken` | `prestataire` | `isAuthenticated` |

### 📦 Structure des Contexts

#### AdminContext
```javascript
import { AdminContext } from '../context/AdminContext';

const { 
  admin,           // Objet utilisateur admin (null si non connecté)
  token,           // JWT token (ou null)
  loading,         // État de chargement
  login,           // Fonction: login(email, motDePasse)
  logout,          // Fonction: logout()
  loadAdminProfile // Fonction: charger/rafraîchir profil
} = useContext(AdminContext);
```

#### ClientContext
```javascript
import { ClientContext } from '../context/ClientContext';

const { 
  client,          // Objet utilisateur client (null si non connecté)
  token,           // JWT token (ou null)
  isAuthenticated, // Boolean: true si connecté
  loading,         // État de chargement
  login,           // Fonction: login(email, password)
  logout,          // Fonction: logout()
  chargerProfil    // Fonction: charger/rafraîchir profil
} = useContext(ClientContext);
```

#### PrestataireContext
```javascript
import { PrestataireContext } from '../context/PrestataireContext';

const { 
  prestataire,     // Objet utilisateur prestataire (null si non connecté)
  token,           // JWT token (ou null)
  isAuthenticated, // Boolean: true si connecté
  loading,         // État de chargement
  login,           // Fonction: login(email, password)
  logout,          // Fonction: logout()
  chargerProfil    // Fonction: charger/rafraîchir profil
} = useContext(PrestataireContext);
```

---

## Vérifier dans les composants

### ✅ Pattern 1: Vérifier si UN utilisateur est connecté (peu importe le type)

```javascript
import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { ClientContext } from '../context/ClientContext';
import { PrestataireContext } from '../context/PrestataireContext';

function MonComposant() {
  const { admin } = useContext(AdminContext);
  const { client } = useContext(ClientContext);
  const { prestataire } = useContext(PrestataireContext);

  // Vérifier si AU MOINS UN est connecté
  const isConnected = admin || client || prestataire;

  if (!isConnected) {
    return <p>❌ Aucun utilisateur connecté</p>;
  }

  return <p>✅ Utilisateur connecté</p>;
}
```

### ✅ Pattern 2: Déterminer QUEL type d'utilisateur est connecté

```javascript
function MonComposant() {
  const { admin } = useContext(AdminContext);
  const { client } = useContext(ClientContext);
  const { prestataire } = useContext(PrestataireContext);

  if (admin) {
    return (
      <div>
        <h2>👑 Espace Admin</h2>
        <p>Bienvenue, {admin.nom || admin.prenom}</p>
        <p>Email: {admin.email}</p>
        <p>Rôle: {admin.role}</p>
      </div>
    );
  }

  if (client) {
    return (
      <div>
        <h2>👤 Espace Client</h2>
        <p>Bienvenue, {client.prenom} {client.nom}</p>
        <p>Email: {client.email}</p>
      </div>
    );
  }

  if (prestataire) {
    return (
      <div>
        <h2>🎤 Espace Prestataire</h2>
        <p>Entreprise: {prestataire.nomEntreprise}</p>
        <p>Contact: {prestataire.prenom} {prestataire.nom}</p>
        <p>Catégorie: {prestataire.categorie}</p>
      </div>
    );
  }

  return <p>❌ Non connecté</p>;
}
```

### ✅ Pattern 3: Afficher des menus différents selon le profil

```javascript
function Header() {
  const { admin } = useContext(AdminContext);
  const { client, isAuthenticated: clientAuth } = useContext(ClientContext);
  const { prestataire, isAuthenticated: prestataireAuth } = useContext(PrestataireContext);

  return (
    <header>
      <nav>
        {/* Menu Admin */}
        {admin && (
          <ul>
            <li><Link to="/admin/dashboard">📊 Dashboard</Link></li>
            <li><Link to="/admin/utilisateurs">👥 Utilisateurs</Link></li>
            <li><Link to="/admin/prestations-avancees">🎛️ Prestations</Link></li>
          </ul>
        )}

        {/* Menu Client */}
        {clientAuth && (
          <ul>
            <li><Link to="/client/dashboard">🏠 Mon Espace</Link></li>
            <li><Link to="/devis">📋 Nouveau Devis</Link></li>
            <li><Link to="/mes-devis">📝 Mes Devis</Link></li>
          </ul>
        )}

        {/* Menu Prestataire */}
        {prestataireAuth && (
          <ul>
            <li><Link to="/prestataire/dashboard">🏢 Mon Espace</Link></li>
            <li><Link to="/prestataire/demandes">📨 Demandes</Link></li>
            <li><Link to="/prestataire/profil">⚙️ Profil</Link></li>
          </ul>
        )}

        {/* Menu non connecté */}
        {!admin && !client && !prestataire && (
          <ul>
            <li><Link to="/connexion">🔐 Connexion</Link></li>
            <li><Link to="/inscription">📝 Inscription</Link></li>
          </ul>
        )}
      </nav>
    </header>
  );
}
```

### ✅ Pattern 4: Rediriger selon l'authentification

```javascript
import { useNavigate } from 'react-router-dom';

function ProtectedPage() {
  const navigate = useNavigate();
  const { admin } = useContext(AdminContext);
  const { client } = useContext(ClientContext);
  const { prestataire } = useContext(PrestataireContext);

  useEffect(() => {
    // Si aucun utilisateur connecté, rediriger
    if (!admin && !client && !prestataire) {
      navigate('/connexion');
    }
  }, [admin, client, prestataire, navigate]);

  // Afficher contenu protégé
  return <div>Contenu protégé</div>;
}
```

### ✅ Pattern 5: Vérifier un type spécifique d'utilisateur

```javascript
function AdminOnlyPage() {
  const { admin } = useContext(AdminContext);

  if (!admin) {
    return (
      <div>
        <h2>❌ Accès Refusé</h2>
        <p>Cette page est réservée aux administrateurs.</p>
        <Link to="/connexion">Se connecter avec un compte admin</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>✅ Bienvenue Admin: {admin.nom}</h2>
      {/* Contenu réservé admin */}
    </div>
  );
}
```

---

## Vérifier dans le navigateur

### 🌐 Console du navigateur (F12)

#### 1. Vérifier les tokens dans localStorage
```javascript
// Ouvrir la console (F12) et taper:
localStorage.getItem('adminToken');
localStorage.getItem('clientToken');
localStorage.getItem('prestataireToken');

// Ou voir tout:
console.log('Admin Token:', localStorage.getItem('adminToken'));
console.log('Client Token:', localStorage.getItem('clientToken'));
console.log('Prestataire Token:', localStorage.getItem('prestataireToken'));
```

#### 2. Décoder un token JWT
```javascript
// Copier le token et le décoder:
const token = localStorage.getItem('clientToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Payload JWT:', payload);
}
```

#### 3. Inspecter localStorage visuellement
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet **Application** (Chrome) ou **Stockage** (Firefox)
3. Cliquer sur **Local Storage** → `http://localhost:3000`
4. Voir les clés: `adminToken`, `clientToken`, `prestataireToken`

### 🧪 Tester l'état des contexts

#### Dans la console React DevTools
1. Installer **React Developer Tools** (extension Chrome/Firefox)
2. Ouvrir DevTools → Onglet **Components**
3. Sélectionner le composant racine `<App>`
4. Chercher les Contexts dans le panneau de droite:
   - `AdminContext.Provider` → voir `value.admin`
   - `ClientContext.Provider` → voir `value.client`
   - `PrestataireContext.Provider` → voir `value.prestataire`

---

## Patterns courants

### 🛡️ Pattern 6: Route protégée générique

```javascript
// components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { ClientContext } from '../context/ClientContext';
import { PrestataireContext } from '../context/PrestataireContext';

function ProtectedRoute({ children, requireAdmin = false, requireClient = false, requirePrestataire = false }) {
  const { admin } = useContext(AdminContext);
  const { client } = useContext(ClientContext);
  const { prestataire } = useContext(PrestataireContext);

  // Vérifier type spécifique requis
  if (requireAdmin && !admin) {
    return <Navigate to="/connexion" replace />;
  }

  if (requireClient && !client) {
    return <Navigate to="/connexion" replace />;
  }

  if (requirePrestataire && !prestataire) {
    return <Navigate to="/connexion" replace />;
  }

  // Vérifier au moins un utilisateur connecté
  if (!requireAdmin && !requireClient && !requirePrestataire) {
    if (!admin && !client && !prestataire) {
      return <Navigate to="/connexion" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
```

#### Utilisation dans App.js
```javascript
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Route admin uniquement */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Route client uniquement */}
      <Route 
        path="/client/dashboard" 
        element={
          <ProtectedRoute requireClient>
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Route prestataire uniquement */}
      <Route 
        path="/prestataire/dashboard" 
        element={
          <ProtectedRoute requirePrestataire>
            <PrestataireDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Route n'importe quel utilisateur connecté */}
      <Route 
        path="/profil" 
        element={
          <ProtectedRoute>
            <ProfilPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

### 🔄 Pattern 7: Hook personnalisé pour l'auth

```javascript
// hooks/useAuth.js
import { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { ClientContext } from '../context/ClientContext';
import { PrestataireContext } from '../context/PrestataireContext';

export const useAuth = () => {
  const { admin, token: adminToken, logout: logoutAdmin } = useContext(AdminContext);
  const { client, token: clientToken, isAuthenticated: clientAuth, logout: logoutClient } = useContext(ClientContext);
  const { prestataire, token: prestataireToken, isAuthenticated: prestataireAuth, logout: logoutPrestataire } = useContext(PrestataireContext);

  // Déterminer qui est connecté
  const user = admin || client || prestataire;
  const token = adminToken || clientToken || prestataireToken;
  const isAuthenticated = !!user;

  // Déterminer le type
  let userType = null;
  if (admin) userType = 'admin';
  else if (client) userType = 'client';
  else if (prestataire) userType = 'prestataire';

  // Logout unifié
  const logout = () => {
    if (admin) logoutAdmin();
    if (client) logoutClient();
    if (prestataire) logoutPrestataire();
  };

  return {
    user,
    token,
    isAuthenticated,
    userType,
    isAdmin: !!admin,
    isClient: !!client,
    isPrestataire: !!prestataire,
    admin,
    client,
    prestataire,
    logout
  };
};
```

#### Utilisation du hook
```javascript
import { useAuth } from '../hooks/useAuth';

function MonComposant() {
  const { isAuthenticated, userType, user, isAdmin, isClient, isPrestataire } = useAuth();

  if (!isAuthenticated) {
    return <p>Non connecté</p>;
  }

  return (
    <div>
      <p>Type: {userType}</p>
      {isAdmin && <p>👑 Admin: {user.nom}</p>}
      {isClient && <p>👤 Client: {user.prenom} {user.nom}</p>}
      {isPrestataire && <p>🎤 Prestataire: {user.nomEntreprise}</p>}
    </div>
  );
}
```

---

## Composant de debug

### 📊 ConnectionStatus - Outil de développement

Un composant spécial a été créé pour **visualiser l'état d'authentification en temps réel** :

```javascript
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  return (
    <div>
      {/* Votre app normale */}
      <Routes>...</Routes>

      {/* Composant de debug (à masquer en production) */}
      {process.env.NODE_ENV === 'development' && <ConnectionStatus />}
    </div>
  );
}
```

### Fonctionnalités de ConnectionStatus:
- ✅ Affiche qui est connecté (Admin/Client/Prestataire)
- ✅ Montre les détails du profil actif
- ✅ Affiche un aperçu des tokens
- ✅ Compare localStorage vs Context
- ✅ Boutons d'action:
  - 🗑️ **Tout déconnecter** (clear localStorage + reload)
  - 🔄 **Rafraîchir** (reload page)
  - 📋 **Console Log** (affiche tout dans la console)
- ✅ Fixed bottom-right, scrollable
- ✅ Responsive mobile

### Pour l'utiliser:
1. Importer dans `App.js`
2. Ajouter `<ConnectionStatus />` n'importe où (recommandé: en bas)
3. Un panneau apparaît en bas à droite avec toutes les infos

---

## Protection des routes

### 🔐 Exemple complet de configuration des routes

```javascript
// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages publiques
import HomePage from './pages/HomePage';
import ConnexionPage from './pages/ConnexionPage';
import InscriptionPage from './pages/InscriptionPage';

// Pages Admin
import AdminDashboard from './pages/AdminDashboard';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import GestionPrestationsAdmin from './pages/GestionPrestationsAdmin';

// Pages Client
import ClientDashboard from './pages/ClientDashboard';
import DevisPage from './pages/DevisPage';
import MesDevisPage from './pages/MesDevisPage';

// Pages Prestataire
import PrestataireDashboard from './pages/PrestataireDashboard';
import DemandesPrestataire from './pages/DemandesPrestataire';
import ProfilPrestataire from './pages/ProfilPrestataire';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />

        {/* Routes Admin protégées */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/utilisateurs" 
          element={
            <ProtectedRoute requireAdmin>
              <GestionUtilisateurs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/prestations-avancees" 
          element={
            <ProtectedRoute requireAdmin>
              <GestionPrestationsAdmin />
            </ProtectedRoute>
          } 
        />

        {/* Routes Client protégées */}
        <Route 
          path="/client/dashboard" 
          element={
            <ProtectedRoute requireClient>
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/devis" 
          element={
            <ProtectedRoute requireClient>
              <DevisPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mes-devis" 
          element={
            <ProtectedRoute requireClient>
              <MesDevisPage />
            </ProtectedRoute>
          } 
        />

        {/* Routes Prestataire protégées */}
        <Route 
          path="/prestataire/dashboard" 
          element={
            <ProtectedRoute requirePrestataire>
              <PrestataireDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/prestataire/demandes" 
          element={
            <ProtectedRoute requirePrestataire>
              <DemandesPrestataire />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/prestataire/profil" 
          element={
            <ProtectedRoute requirePrestataire>
              <ProfilPrestataire />
            </ProtectedRoute>
          } 
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🎯 Récapitulatif rapide

### Comment savoir si quelqu'un est connecté?
```javascript
const { admin } = useContext(AdminContext);
const { client } = useContext(ClientContext);
const { prestataire } = useContext(PrestataireContext);

const isConnected = admin || client || prestataire;
```

### Comment savoir QUEL profil?
```javascript
if (admin) {
  console.log('👑 Admin connecté:', admin.email);
} else if (client) {
  console.log('👤 Client connecté:', client.prenom, client.nom);
} else if (prestataire) {
  console.log('🎤 Prestataire connecté:', prestataire.nomEntreprise);
} else {
  console.log('❌ Personne connecté');
}
```

### Tokens dans localStorage?
```javascript
// Console du navigateur:
localStorage.getItem('adminToken');      // Token admin
localStorage.getItem('clientToken');     // Token client
localStorage.getItem('prestataireToken'); // Token prestataire
```

### Vérifier visuellement?
1. Ajouter `<ConnectionStatus />` dans App.js
2. Un panneau affiche tout en bas à droite
3. Voir qui est connecté, avec quelles données

---

## 🚀 Pour aller plus loin

### Ajouter une vérification de token expiré
```javascript
import { jwtDecode } from 'jwt-decode';

function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

// Utilisation:
const token = localStorage.getItem('clientToken');
if (isTokenExpired(token)) {
  console.log('Token expiré, déconnexion...');
  logout();
}
```

### Middleware pour refresh automatique
```javascript
// apiService.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001'
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const clientToken = localStorage.getItem('clientToken');
  const prestataireToken = localStorage.getItem('prestataireToken');
  
  const token = adminToken || clientToken || prestataireToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide/expiré
      localStorage.removeItem('adminToken');
      localStorage.removeItem('clientToken');
      localStorage.removeItem('prestataireToken');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## ✅ Checklist de vérification

- [ ] Importer les 3 contexts dans mes composants
- [ ] Vérifier si `admin`, `client`, ou `prestataire` est non-null
- [ ] Utiliser `isAuthenticated` pour ClientContext et PrestataireContext
- [ ] Protéger mes routes sensibles avec `<ProtectedRoute>`
- [ ] Afficher des menus conditionnels selon le profil
- [ ] Tester la déconnexion (localStorage doit être vidé)
- [ ] Vérifier les tokens dans DevTools → Application → Local Storage
- [ ] Utiliser `<ConnectionStatus />` en mode développement
- [ ] Gérer les redirections après login/logout
- [ ] Tester l'expiration de token (après 7 jours)

---

**🎉 Vous savez maintenant comment détecter qui est connecté et avec quel profil!**
