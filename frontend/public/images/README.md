# 📁 Dossier Images - ELIJAH'GOD

## 🎨 Logo Fourni

Vous avez fourni un logo avec un **"G" doré dans un cercle**.

### Instructions pour ajouter le logo :

1. **Sauvegardez votre image de logo** dans ce dossier sous le nom : `logo.png`
   - Format recommandé : PNG avec transparence
   - Dimensions recommandées : 512x512px minimum (carrées)

2. **Le logo sera automatiquement utilisé** par :
   - Header du site (navigation)
   - Footer
   - Page de paramètres (admin peut le changer)
   - Emails (signature)
   - Documents PDF (devis, factures)

### Autres images à ajouter :

- `banniere.jpg` - **Image du carrousel/hero** de la page d'accueil (1920x1080px recommandé) - **✅ Peut être configurée via admin**
- `logo-192.png` - Icône PWA (192x192px)
- `logo-512.png` - Icône PWA (512x512px)
- `favicon.ico` - Favicon navigateur (32x32px)

### ✨ NOUVEAU : Image du Carrousel (Hero)

Vous pouvez maintenant **configurer l'image de fond du carrousel** directement depuis l'admin :

1. **Placez votre image** dans ce dossier (ex: `carousel.jpg`, `hero-bg.jpg`)
2. **Connectez-vous à l'admin** : `/admin/login`
3. **Allez dans Paramètres** → Onglet "Entreprise"
4. **Entrez le chemin** dans le champ "Image du carrousel" : `/images/carousel.jpg`
5. **Enregistrez** et l'image apparaîtra sur la page d'accueil !

📖 **Guide complet :** Voir [`GUIDE_IMAGE_CAROUSEL.md`](../../../GUIDE_IMAGE_CAROUSEL.md) à la racine du projet

**Recommandations :**
- Format : JPG ou PNG
- Dimensions : 1920x1080px minimum
- Poids : < 500 Ko (optimisé)
- Thématique : Équipement DJ, scène, événements, ambiance festive

### Chemin dans l'application :

Le logo est référencé dans :
- **Backend** : `Settings.entreprise.logo = "/images/logo.png"`
- **Frontend** : `<img src="/images/logo.png" alt="ELIJAH'GOD Logo" />`

### Modification via Admin :

La page **Admin Settings** (à développer) permettra de :
- ✅ Uploader un nouveau logo
- ✅ Prévisualiser avant validation
- ✅ Conserver historique des logos précédents
- ✅ Générer automatiquement les tailles pour PWA

---

**Note** : Pour l'instant, placez manuellement le fichier `logo.png` dans ce dossier. L'upload via interface admin sera développé avec le frontend.
