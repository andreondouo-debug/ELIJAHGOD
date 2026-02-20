# 🎨 GUIDE COMPLET LOGO - ELIJAH'GOD
## 17 Février 2026

---

## 📍 SITUATION ACTUELLE

Vous avez fourni un **logo avec "G" doré dans un cercle**. Voici comment l'intégrer :

---

## ✅ ÉTAPE 1 : PLACER LE LOGO (MAINTENANT)

### Instructions manuelles :

1. **Sauvegardez votre image de logo** que vous avez fournie
   
2. **Renommez-la** en : `logo.png`

3. **Placez-la** dans le dossier :
   ```
   frontend/public/images/logo.png
   ```

4. **Le logo sera automatiquement utilisé** partout :
   - Header du site (navigation)
   - Footer
   - Page de paramètres
   - Emails automatiques
   - Documents PDF (devis)

### Formats recommandés :

- **Format** : PNG avec transparence (si le cercle a un fond transparent)
- **Dimensions** : 512x512px minimum (carré)
- **Poids** : < 500KB pour performance web

---

## 🔄 ÉTAPE 2 : UPLOAD VIA ADMIN (PLUS TARD)

Quand le frontend sera développé, vous pourrez changer le logo via l'interface admin.

### Fonctionnalité à développer :

**Page** : `/admin/settings/entreprise`

**Section "Logo & Identité"** :
```
┌─────────────────────────────────────────┐
│ Logo actuel :                           │
│  ┌──────────┐                           │
│  │    G     │  [Changer le logo]        │
│  │  (logo)  │                           │
│  └──────────┘                           │
│                                         │
│ Format accepté : PNG, JPG, SVG          │
│ Taille max : 2MB                        │
│ Dimensions recommandées : 512x512px     │
│                                         │
│ [Parcourir...] [Uploader]               │
└─────────────────────────────────────────┘
```

---

## 🛠️ BACKEND DÉJÀ CONFIGURÉ

### Le modèle Settings inclut déjà :

```javascript
// backend/src/models/Settings.js
entreprise: {
  logo: {
    type: String,
    default: "/images/logo.png"
  }
}
```

### Routes disponibles :

```javascript
// GET /api/settings - Public
// Retourne : { entreprise: { logo: "/images/logo.png" } }

// PUT /api/settings - Admin
// Peut modifier : { entreprise: { logo: "/images/nouveau-logo.png" } }
```

---

## 📦 INSTALLATION UPLOAD (Future)

Pour activer l'upload de logo via interface admin, installer :

```bash
cd backend
npm install multer cloudinary
```

### Configuration Cloudinary :

```env
# backend/.env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Code middleware upload :

```javascript
// backend/src/middleware/uploadLogo.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elijahgod/logos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'svg'],
    transformation: [{ width: 512, height: 512, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = upload;
```

### Route upload :

```javascript
// backend/src/routes/settingsRoutes.js
const upload = require('../middleware/uploadLogo');

router.post('/upload-logo', 
  authClient, 
  adminOnly, 
  upload.single('logo'),
  settingsController.uploadLogo
);
```

---

## 🎨 UTILISATION FRONTEND

### Affichage du logo :

```jsx
// frontend/src/components/Header.js
import { useState, useEffect } from 'react';
import axios from 'axios';

function Header() {
  const [logoUrl, setLogoUrl] = useState('/images/logo.png');
  
  useEffect(() => {
    // Récupérer settings
    axios.get('http://localhost:5001/api/settings')
      .then(res => {
        setLogoUrl(res.data.data.entreprise.logo);
      })
      .catch(() => {
        setLogoUrl('/images/logo.png'); // Fallback
      });
  }, []);
  
  return (
    <header>
      <img 
        src={logoUrl} 
        alt="ELIJAH'GOD Logo" 
        style={{ height: '50px' }}
      />
    </header>
  );
}
```

### Formulaire upload (Admin) :

```jsx
// frontend/src/pages/admin/UploadLogoForm.js
import { useState } from 'react';
import axios from 'axios';

function UploadLogoForm() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/settings/upload-logo',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      alert('✅ Logo mis à jour !');
      // Recharger la page ou mettre à jour le state
    } catch (error) {
      alert('❌ Erreur upload : ' + error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nouveau logo :</label>
        <input 
          type="file" 
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleFileChange}
        />
      </div>
      
      {preview && (
        <div>
          <img src={preview} alt="Aperçu" style={{ maxWidth: '200px' }} />
        </div>
      )}
      
      <button type="submit" disabled={!file}>
        Uploader le logo
      </button>
    </form>
  );
}
```

---

## 🚀 DÉMARRAGE RAPIDE

### Pour l'instant (sans upload) :

1. ✅ **Placez** votre logo dans `frontend/public/images/logo.png`
2. ✅ **Lancez** le frontend : `cd frontend && npm start`
3. ✅ Le logo s'affichera automatiquement (une fois Header développé)

### Pour l'upload admin (plus tard) :

1. ⏳ Installer multer + cloudinary
2. ⏳ Créer compte Cloudinary (gratuit)
3. ⏳ Ajouter variables env
4. ⏳ Développer page admin upload logo
5. ⏳ Tester upload via interface

---

## 📋 CHECKLIST INTÉGRATION LOGO

- [x] Dossier `frontend/public/images/` créé
- [x] Modèle Settings inclut champ `logo`
- [x] Routes API settings fonctionnelles
- [ ] **À FAIRE** : Placer fichier `logo.png` dans le dossier
- [ ] **À FAIRE** : Développer composant Header avec logo
- [ ] **À FAIRE** : Développer page admin upload logo
- [ ] **À FAIRE** : Installer multer/cloudinary
- [ ] **À FAIRE** : Tester upload via admin

---

## 🎯 PROCHAINES ÉTAPES

1. **Maintenant** : Copiez votre logo dans `frontend/public/images/logo.png`

2. **Puis** : Développez le Header qui affiche le logo :
   ```jsx
   <img src="/images/logo.png" alt="ELIJAH'GOD" />
   ```

3. **Plus tard** : Ajoutez l'upload admin quand vous développerez la page settings

---

## 📝 NOTES IMPORTANTES

### Où le logo apparaît :

- ✅ **Header** : Navigation principale (toutes pages)
- ✅ **Footer** : Pied de page (toutes pages)
- ✅ **Login/Signup** : Pages d'authentification
- ✅ **Emails** : Template emails automatiques
- ✅ **PDF** : En-tête devis/factures
- ✅ **PWA** : Icône application installable
- ✅ **Réseaux sociaux** : Open Graph meta tags

### Variantes du logo à créer :

Pour une intégration complète, créez ces versions :

```
frontend/public/images/
  ├── logo.png          (512x512px - Version principale)
  ├── logo-192.png      (192x192px - PWA small)
  ├── logo-512.png      (512x512px - PWA large)
  ├── logo-white.png    (Version blanche pour footer sombre)
  ├── favicon.ico       (32x32px - Favicon navigateur)
  └── og-image.png      (1200x630px - Partage réseaux sociaux)
```

### Optimisation performance :

- Compressez le PNG avec TinyPNG ou ImageOptim
- Utilisez format WebP pour versions modernes
- Lazy loading si logo en bas de page
- CDN Cloudinary pour delivery optimisé

---

**Date** : 17 Février 2026  
**Status Backend** : ✅ Prêt  
**Status Frontend** : ⏳ À développer  
**Action immédiate** : Placer `logo.png` dans `frontend/public/images/`
