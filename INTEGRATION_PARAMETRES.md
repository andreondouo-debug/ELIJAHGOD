# 🔗 Intégration Automatique des Paramètres

Ce document explique comment les paramètres sont automatiquement utilisés partout dans l'application.

## 📧 Système d'Emails

### Intégration dans les emails
Tous les emails utilisent automatiquement les paramètres pour :

**En-tête**
- Logo : `settings.entreprise.logo`
- Nom entreprise : `settings.entreprise.nom`

**Corps du message**
- Contact email : `settings.contact.email`
- Téléphone : `settings.contact.telephone`
- Adresse : `settings.contact.adresse`

**Signature**
- Signature personnalisée : `settings.emailConfig.emailSignature`

**Destinataires**
- Notifications admin : `settings.emailConfig.emailAdmin`

### Activation/Désactivation
```javascript
if (settings.emailConfig.emailNotifications) {
  // Envoyer l'email
}
```

## 💰 Système de Devis

### Calcul automatique des prix

**Dans le modèle Prestation**
```javascript
calculerPrix(options) {
  const settings = await Settings.getSettings();
  let prix = this.prixBase;
  
  // Supplément weekend
  if (options.weekend) {
    prix += prix * (settings.tarifs.supplementWeekendPourcentage / 100);
  }
  
  // Supplément nuit
  if (options.nuit) {
    prix += prix * (settings.tarifs.supplementNuitPourcentage / 100);
  }
  
  // Frais de déplacement
  if (options.distance > settings.tarifs.distanceGratuiteKm) {
    const kmFacturables = options.distance - settings.tarifs.distanceGratuiteKm;
    prix += kmFacturables * settings.tarifs.fraisDeplacementParKm;
  }
  
  return prix;
}
```

### Validité des devis
```javascript
// Calcul automatique de la date de validité
const settings = await Settings.getSettings();
devis.dateValidite = new Date();
devis.dateValidite.setDate(
  devis.dateValidite.getDate() + settings.devis.validiteJours
);
```

### Messages dans les devis
- Message de confirmation : `settings.devis.messageConfirmation`
- CGV incluses : `settings.devis.cgv`

## 📅 Système de Planning

### Vérification des disponibilités

**Jours non travaillés**
```javascript
const settings = await Settings.getSettings();
const jourSemaine = new Date(date).toLocaleLowerCase('fr-FR', { weekday: 'long' });

if (settings.planning.joursNonTravailles.includes(jourSemaine)) {
  return { disponible: false, raison: 'Jour non travaillé' };
}
```

**Délai minimum de réservation**
```javascript
const dateReservation = new Date(date);
const dateMin = new Date();
dateMin.setDate(dateMin.getDate() + settings.planning.delaiReservationMinJours);

if (dateReservation < dateMin) {
  return { 
    disponible: false, 
    raison: `Réservation minimum ${settings.planning.delaiReservationMinJours} jours à l'avance` 
  };
}
```

**Horaires par défaut**
- Heure d'ouverture : `settings.planning.heureOuvertureDefaut`
- Heure de fermeture : `settings.planning.heureFermetureDefaut`

## 🎨 Interface Utilisateur

### Chargement des paramètres au démarrage

**Context React**
```javascript
// src/context/SettingsContext.js
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        setSettings(response.data.data);
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
```

### Utilisation dans les composants

**Header**
```jsx
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

function Header() {
  const { settings } = useContext(SettingsContext);
  
  if (!settings) return null;
  
  return (
    <header>
      <img src={settings.entreprise.logo} alt={settings.entreprise.nom} />
      <h1>{settings.entreprise.nom}</h1>
      <p>{settings.entreprise.slogan}</p>
    </header>
  );
}
```

**Footer**
```jsx
function Footer() {
  const { settings } = useContext(SettingsContext);
  
  return (
    <footer>
      <p>{settings.messages.piedDePage}</p>
      <div className="contact">
        <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>
        <a href={`tel:${settings.contact.telephone}`}>{settings.contact.telephone}</a>
      </div>
      <div className="social">
        {settings.reseauxSociaux.facebook && (
          <a href={settings.reseauxSociaux.facebook}>Facebook</a>
        )}
        {settings.reseauxSociaux.instagram && (
          <a href={settings.reseauxSociaux.instagram}>Instagram</a>
        )}
      </div>
    </footer>
  );
}
```

### Thème dynamique (CSS)

**App.js**
```javascript
useEffect(() => {
  if (settings) {
    document.documentElement.style.setProperty('--color-primary', settings.site.couleurPrincipale);
    document.documentElement.style.setProperty('--color-secondary', settings.site.couleurSecondaire);
    document.documentElement.style.setProperty('--color-accent', settings.site.couleurAccent);
  }
}, [settings]);
```

**CSS**
```css
:root {
  --color-primary: #1a1a2e;    /* Sera remplacé par settings */
  --color-secondary: #16213e;
  --color-accent: #0f3460;
}

.button-primary {
  background-color: var(--color-primary);
}
```

## 🔍 SEO Dynamique

**Composant Helmet**
```jsx
import { Helmet } from 'react-helmet';
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

function SEO({ pageTitle, pageDescription }) {
  const { settings } = useContext(SettingsContext);
  
  if (!settings) return null;
  
  const title = pageTitle 
    ? `${pageTitle} | ${settings.entreprise.nom}` 
    : settings.seo.metaTitre;
    
  const description = pageDescription || settings.seo.metaDescription;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={settings.seo.motsCles.join(', ')} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={settings.entreprise.banniere} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
```

## 🔒 Mode Maintenance

**App.js - Vérification globale**
```jsx
function App() {
  const { settings, loading } = useContext(SettingsContext);
  
  if (loading) return <Loader />;
  
  // Bloquer l'accès si maintenance activée
  if (settings?.site.maintenanceMode) {
    return <MaintenancePage message={settings.site.messageMaintenace} />;
  }
  
  return <Routes>...</Routes>;
}
```

## 💳 Affichage Conditionnel des Prix

```jsx
function PrestationCard({ prestation }) {
  const { settings } = useContext(SettingsContext);
  
  return (
    <div className="prestation">
      <h3>{prestation.nom}</h3>
      <p>{prestation.description}</p>
      
      {settings.site.afficherPrix ? (
        <p className="prix">{prestation.prixBase}€</p>
      ) : (
        <button>Demander un devis</button>
      )}
    </div>
  );
}
```

## 📊 Mise à Jour des Statistiques

**Automatique après chaque opération**

```javascript
// Dans devisController.js après création d'un devis
exports.createDevis = async (req, res) => {
  // ... création du devis
  
  // Mise à jour automatique des stats
  const settings = await Settings.getSettings();
  settings.stats.totalDevis += 1;
  settings.stats.totalClients = await Devis.distinct('client.email').then(e => e.length);
  await settings.save();
};
```

## 🔄 Rechargement en Temps Réel

**Hook personnalisé pour rafraîchir les paramètres**
```javascript
// src/hooks/useSettings.js
export const useSettings = () => {
  const { settings, setSettings } = useContext(SettingsContext);
  
  const refreshSettings = async () => {
    const response = await axios.get('/api/settings');
    setSettings(response.data.data);
  };
  
  return { settings, refreshSettings };
};
```

## ✅ Checklist d'Intégration

- [x] Emails utilisent les paramètres
- [x] Devis calculent avec les tarifs configurés
- [x] Planning vérifie les jours et horaires
- [x] Interface charge les paramètres au démarrage
- [x] Thème s'applique dynamiquement
- [x] SEO est personnalisé
- [x] Mode maintenance fonctionne
- [x] Statistiques se mettent à jour
- [ ] Page admin pour gérer les paramètres (à créer)
- [ ] Export/Import des paramètres

## 🎯 Prochaines Étapes

1. Créer l'interface d'administration visuelle
2. Ajouter l'upload d'images (logo, bannière)
3. Historique des modifications
4. Prévisualisation avant sauvegarde
5. Templates de paramètres prédéfinis
