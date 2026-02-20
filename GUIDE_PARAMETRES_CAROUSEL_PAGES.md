# 🎬 Guide Paramètres Carousel & Pages - ELIJAH'GOD

## 📋 Vue d'Ensemble

Cette fonctionnalité permet de **personnaliser entièrement le carousel (Hero Section) et les sections de la page d'accueil** depuis l'interface d'administration, sans toucher au code.

### ✨ Fonctionnalités Principales

1. **Modification du Carousel (Hero Section)**
   - Titre principal
   - Sous-titre (tagline)
   - 2 boutons d'action (texte + lien)
   - Disposition (horizontal, vertical, centre)
   - Alignement (gauche, centre, droite)

2. **Gestion des Sections de la Page d'Accueil**
   - Réorganiser l'ordre par drag & drop
   - Activer/désactiver les sections
   - Modifier les textes (titre, sous-titre, contenu)
   - Choisir la disposition (horizontal, vertical, grille, centre)

---

## 🚀 Accès aux Paramètres

1. Connectez-vous en tant qu'**administrateur**
2. Allez dans **Paramètres** (⚙️)
3. Cliquez sur l'onglet **🎬 Carousel & Pages**

---

## 🎯 Section 1 : Carousel (Hero Section)

### Configuration du Hero

Le carousel est la première section visible avec l'image de fond et le message d'accueil.

#### Champs Modifiables

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Titre Principal** | Nom de votre entreprise ou message principal | `ELIJAH'GOD` |
| **Sous-titre (Tagline)** | Message accrocheur | `Servir avec excellence, inspiré par la foi.` |
| **Bouton Principal - Texte** | Texte du bouton CTA principal | `✨ Créons votre devis` |
| **Bouton Principal - Lien** | Route vers la page ciblée | `/devis` |
| **Bouton Secondaire - Texte** | Texte du bouton secondaire | `Découvrir nos services` |
| **Bouton Secondaire - Lien** | Route vers la page ciblée | `/prestations` |

#### Options de Disposition

**Disposition** :
- **🎯 Centre** : Contenu centré verticalement et horizontalement (par défaut)
- **↔️ Horizontal** : Contenu aligné en ligne (boutons à côté du texte)
- **↕️ Vertical** : Contenu empilé verticalement

**Alignement** :
- **⬅️ Gauche** : Texte aligné à gauche
- **⬆️ Centre** : Texte centré (par défaut)
- **➡️ Droite** : Texte aligné à droite

### Exemple de Configuration

```json
{
  "titre": "ELIJAH'GOD",
  "tagline": "Prestations événementielles d'exception",
  "boutonPrincipal": {
    "texte": "🎉 Demander un devis",
    "lien": "/devis"
  },
  "boutonSecondaire": {
    "texte": "Nos prestations",
    "lien": "/prestations"
  },
  "disposition": "centre",
  "alignement": "centre"
}
```

---

## 📑 Section 2 : Sections de la Page d'Accueil

### Types de Sections Disponibles

1. **🎯 Mission** : Présentation de votre mission et valeurs
2. **👥 Équipe** : Présentation de votre équipe de prestataires
3. **⭐ Valeurs** : Vos valeurs et engagements
4. **📢 Appel à l'action (CTA)** : Section finale avec boutons d'action

### Gestion des Sections

#### Drag & Drop (Réorganiser)

1. **Cliquez et maintenez** sur l'icône ☰ d'une section
2. **Glissez** la section vers le haut ou le bas
3. **Relâchez** pour placer la section
4. Le numéro d'ordre (#1, #2, #3...) se met à jour automatiquement

#### Activer/Désactiver une Section

- **✅ Visible** : La section s'affiche sur la page d'accueil
- **❌ Masquée** : La section est cachée (grisée dans l'interface)

Cochez/décochez simplement la case pour activer ou désactiver une section.

### Configuration de Chaque Section

Pour chaque section, vous pouvez modifier :

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| **Titre** | Titre principal de la section | Oui |
| **Sous-titre** | Texte complémentaire sous le titre | Non |
| **Contenu** | Texte/description de la section | Non |
| **Disposition** | Mise en page de la section | Oui |

#### Options de Disposition des Sections

- **↔️ Horizontal** : Éléments alignés en ligne horizontale
- **↕️ Vertical** : Éléments empilés verticalement
- **🔲 Grille** : Éléments affichés en grille (cartes)
- **🎯 Centré** : Contenu centré sur la page

### Exemple de Configuration - Section Mission

```json
{
  "id": "mission",
  "type": "mission",
  "titre": "Bienvenue chez ELIJAH'GOD",
  "sousTitre": "",
  "contenu": "Une micro‑entreprise dédiée à la création d'événements harmonieux, professionnels et porteurs de sens.",
  "disposition": "vertical",
  "ordre": 1,
  "actif": true
}
```

---

## 💾 Sauvegarde des Modifications

1. Après avoir effectué toutes vos modifications
2. Cliquez sur **💾 Enregistrer les paramètres** en bas de page
3. Un message de confirmation s'affiche : `✅ Paramètres enregistrés avec succès !`
4. Les modifications sont **immédiatement visibles** sur la page d'accueil

---

## 🎨 Conseils de Design

### Pour le Carousel

✅ **Titre court et impactant** : Maximum 3-4 mots  
✅ **Tagline concise** : 1-2 phrases maximum  
✅ **Boutons clairs** : Utilisez des verbes d'action (Créer, Découvrir, Demander...)  
✅ **Emojis** : Ajoutez des emojis pour rendre les boutons plus attractifs

### Pour les Sections

✅ **Ordre logique** : Mission → Équipe → Valeurs → CTA  
✅ **Uniformité** : Utilisez le même niveau de détail pour chaque section  
✅ **Progression** : Guidez le visiteur vers l'action finale (CTA)  
✅ **Lisibilité** : Phrases courtes et claires

---

## 📱 Responsive Design

Toutes les dispositions sont **automatiquement adaptées aux mobiles** :

- Sur mobile, les dispositions **horizontales** deviennent **verticales**
- Les grilles s'ajustent au nombre de colonnes disponibles
- Les boutons s'empilent verticalement sur petits écrans

---

## 🔧 Comportement par Défaut

Si aucune section n'est configurée dans les paramètres, la page d'accueil affiche les **sections par défaut** :

1. Mission
2. Équipe
3. Valeurs
4. Final CTA

Des sections fixes (Role, Bible Verse, Inclusivity) sont **toujours affichées** après les sections paramétrables.

---

## 🐛 Résolution de Problèmes

### Les modifications ne s'affichent pas

1. Vérifiez que vous avez bien cliqué sur **💾 Enregistrer**
2. Rafraîchissez la page d'accueil (Ctrl+R ou Cmd+R)
3. Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

### Une section n'apparaît pas

1. Vérifiez que la section est **activée** (✅ Visible)
2. Assurez-vous que la section a au moins un **titre**
3. Vérifiez l'**ordre** de la section

### Le drag & drop ne fonctionne pas

1. Assurez-vous de **maintenir le clic** sur l'icône ☰
2. Essayez avec un autre navigateur (Chrome recommandé)
3. Rafraîchissez la page et réessayez

---

## 🎯 Cas d'Usage Exemples

### Exemple 1 : Site Événementiel Classique

**Carousel** :
- Titre : `ELIJAH'GOD`
- Tagline : `Vos événements, notre passion`
- Disposition : Centre
- Alignement : Centre

**Sections** (ordre) :
1. Mission (vertical)
2. Équipe (grille)
3. Valeurs (grille)
4. CTA (centré)

### Exemple 2 : Focus sur les Services

**Carousel** :
- Titre : `ELIJAH'GOD`
- Tagline : `DJ • Sonorisation • Animation`
- Disposition : Horizontal
- Alignement : Gauche

**Sections** (ordre) :
1. Équipe (grille)
2. Mission (vertical)
3. CTA (centré)

### Exemple 3 : Présentation Institutionnelle

**Carousel** :
- Titre : `ELIJAH'GOD`
- Tagline : `Servir avec excellence, inspiré par la foi`
- Disposition : Vertical
- Alignement : Centre

**Sections** (ordre) :
1. Mission (vertical)
2. Valeurs (horizontal)
3. Équipe (grille)
4. CTA (centré)

---

## 🔗 Fichiers Modifiés

### Backend
- `backend/src/models/Settings.js` : Modèle MongoDB étendu avec carousel et homepage
- Sections ajoutées :
  - `carousel` : Configuration du hero
  - `homepage.sections` : Tableau des sections paramétrables
  - `homepage.sectionsParDefaut` : Valeurs par défaut

### Frontend
- `frontend/src/pages/ParametresPage.js` : Interface d'administration
  - Ajout de l'onglet "🎬 Carousel & Pages"
  - Formulaires de modification
  - Drag & drop pour réorganiser
- `frontend/src/pages/HomePage.js` : Utilisation des paramètres dynamiques
  - Lecture des settings
  - Rendu conditionnel des sections
  - Fallback sur valeurs par défaut
- `frontend/src/pages/HomePage.css` : Styles pour dispositions
  - `.hero-horizontal`, `.hero-vertical`, `.hero-centre`
  - `.hero-align-gauche`, `.hero-align-droite`, `.hero-align-centre`
  - `.section-horizontal`, `.section-vertical`, `.section-grille`, `.section-centre`

---

## ✅ Checklist de Configuration

- [ ] Personnaliser le titre et tagline du carousel
- [ ] Configurer les 2 boutons du carousel
- [ ] Choisir la disposition et l'alignement du carousel
- [ ] Réorganiser les sections dans l'ordre souhaité
- [ ] Modifier les titres et contenus de chaque section
- [ ] Choisir la disposition de chaque section
- [ ] Activer/désactiver les sections selon besoins
- [ ] Enregistrer les paramètres
- [ ] Vérifier l'affichage sur desktop
- [ ] Vérifier l'affichage sur mobile
- [ ] Tester les liens des boutons

---

## 📞 Support

Pour toute question ou problème :
- **Email** : contact@elijahgod.fr
- **Documentation projet** : Voir `ETAT_PROJET_12JAN2026.md`

---

**Version** : 1.0  
**Date** : 18 Février 2026  
**Auteur** : ELIJAH'GOD Dev Team
