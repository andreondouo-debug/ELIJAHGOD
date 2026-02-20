# 🖼️ Guide : Ajouter une Image au Carrousel

## Vue d'ensemble

Le carrousel (section hero) de la page d'accueil peut afficher une **image de fond personnalisée** configurable directement depuis les paramètres admin.

## 🎯 Fonctionnalité

- **Image de fond dynamique** sur la section hero de la page d'accueil
- **Gérée via les paramètres admin** (Page `/admin/parametres`)
- **Overlay semi-transparent** pour assurer la lisibilité du texte
- **Support images locales ou URLs externes**

---

## 📋 Comment ajouter une image au carrousel

### Méthode 1 : Image Locale (Recommandée)

1. **Placez votre image dans le dossier :**
   ```
   frontend/public/images/
   ```

2. **Nommez votre fichier** (exemples) :
   - `carousel.jpg`
   - `hero-bg.jpg`
   - `banniere-accueil.png`

3. **Connectez-vous à l'admin** :
   - Allez sur `http://localhost:3000/admin/login`
   - Email : `admin@elijahgod.com`
   - Mot de passe : `admin123`

4. **Configurez l'image** :
   - Cliquez sur **"⚙️ Paramètres"** dans le tableau de bord
   - Allez dans l'onglet **"🏢 Entreprise"**
   - Dans le champ **"🖼️ Image du carrousel (bannière)"**, entrez :
     ```
     /images/carousel.jpg
     ```
   - Cliquez sur **"💾 Enregistrer les modifications"**

5. **Vérifiez le résultat** :
   - Retournez sur la page d'accueil
   - L'image devrait maintenant apparaître en fond du hero

### Méthode 2 : URL Externe

1. **Obtenez l'URL complète** de votre image hébergée en ligne
   - Exemple : `https://exemple.com/images/mon-carousel.jpg`

2. **Dans les paramètres admin**, entrez l'URL complète :
   ```
   https://exemple.com/images/mon-carousel.jpg
   ```

3. **Enregistrez** et vérifiez le résultat

---

## 🎨 Recommandations pour l'image

### Dimensions idéales
- **Largeur** : 1920px minimum (pour écrans larges)
- **Hauteur** : 1080px minimum
- **Format** : 16:9 ou 21:9 (paysage)

### Qualité et poids
- **Format** : JPG (pour photos), PNG (pour images avec transparence)
- **Poids** : < 500 Ko (optimisez avec TinyPNG ou similaire)
- **Qualité** : 80-90% (bon compromis qualité/poids)

### Composition
- ⚠️ **Zone centrale lisible** : Évitez les détails importants au centre (où apparaît le texte)
- ✅ **Contraste suffisant** : L'overlay noir à 50% d'opacité est appliqué automatiquement
- ✅ **Sujet sur les côtés** : Placez les éléments visuels forts sur les bords
- ✅ **Couleurs adaptées** : Images sombres ou moyennement lumineuses recommandées

### Thématique
Suggestions d'images pour ELIJAH'GOD :
- 🎧 Console de DJ / équipement audio professionnel
- 🎤 Scène avec éclairage événementiel
- 🎉 Événement en action (vue d'ensemble)
- ✨ Ambiance festive / lumières / foule heureuse
- 🎵 Instruments de musique / groupe live
- 🙏 Thématique spirituelle/église (si pertinent)

---

## 🔧 Structure technique

### Fichiers modifiés

1. **`frontend/src/pages/HomePage.js`**
   - Import de `SettingsContext`
   - Application dynamique de l'image via `style={{ backgroundImage: ... }}`

2. **`frontend/src/pages/ParametresPage.js`**
   - Champ de saisie amélioré avec prévisualisation
   - Instructions détaillées pour l'admin
   - Gestion d'erreur si l'image ne charge pas

3. **`backend/src/models/Settings.js`**
   - Champ `entreprise.banniere` (existait déjà)
   - Valeur par défaut : `/images/banniere.jpg`

### CSS appliqué

```css
.hero {
  /* Image de fond appliquée dynamiquement */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  /* Overlay noir semi-transparent */
  background: rgba(0, 0, 0, 0.5);
}
```

---

## 🧪 Test rapide

```bash
# 1. Téléchargez une image de test
cd frontend/public/images/
curl -o carousel-test.jpg https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920

# 2. Dans l'admin, configurez :
# Champ bannière : /images/carousel-test.jpg

# 3. Rechargez la page d'accueil
# L'image devrait apparaître en fond
```

---

## ❓ Résolution de problèmes

### L'image ne s'affiche pas

**1. Vérifiez le chemin :**
- ✅ `/images/carousel.jpg` (commence par `/`)
- ❌ `images/carousel.jpg` (manque le `/`)
- ❌ `./images/carousel.jpg` (ne fonctionne pas depuis public)

**2. Vérifiez que le fichier existe :**
```bash
ls -lh frontend/public/images/carousel.jpg
```

**3. Vérifiez la console du navigateur :**
- Ouvrez les DevTools (F12)
- Onglet Console : cherchez des erreurs 404

**4. Cache du navigateur :**
- Rafraîchissez avec Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)

### L'image est trop lourde / la page rame

**Optimisez l'image :**
```bash
# Avec ImageMagick
convert input.jpg -resize 1920x1080^ -quality 85 -strip output.jpg

# Avec online : https://tinypng.com/
```

### Le texte n'est pas lisible

**Option 1 : Augmentez l'opacité de l'overlay**

Modifiez `HomePage.css` :
```css
.hero-overlay {
  background: rgba(0, 0, 0, 0.7); /* Au lieu de 0.5 */
}
```

**Option 2 : Ajoutez un flou**

Modifiez `HomePage.js` :
```javascript
backgroundImage: settings?.entreprise?.banniere 
  ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${settings.entreprise.banniere})` 
  : undefined,
filter: 'blur(2px)', // Ajouter cette ligne
```

---

## 📸 Exemples de sources d'images gratuites

- **[Unsplash](https://unsplash.com/)** : Photos haute qualité gratuites
  - Recherche : "DJ equipment", "concert stage", "event lighting"
- **[Pexels](https://pexels.com/)** : Photos et vidéos gratuites
- **[Pixabay](https://pixabay.com/)** : Images libres de droits
- **Photos personnelles** : Utilisez vos propres photos d'événements ELIJAH'GOD !

---

## 🚀 Prochaines améliorations possibles

- [ ] Upload direct depuis l'interface (sans passer par le dossier)
- [ ] Carrousel multiple (plusieurs images en rotation)
- [ ] Gestion via Cloudinary pour optimisation automatique
- [ ] Crop/resize depuis l'admin
- [ ] Bibliothèque d'images avec galerie

---

**Créé le :** 17 février 2026  
**Pour :** Projet ELIJAH'GOD  
**Par :** AI Assistant
