#!/bin/bash

# 🎨 SCRIPT INSTALLATION LOGO - ELIJAH'GOD
# Aide à placer le logo au bon endroit

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

LOGO_DIR="frontend/public/images"
LOGO_PATH="$LOGO_DIR/logo.png"

echo ""
echo "🎨 ========================================"
echo "   INSTALLATION LOGO - ELIJAH'GOD"
echo "========================================"
echo ""

# Vérifier que le dossier existe
if [ ! -d "$LOGO_DIR" ]; then
    echo -e "${YELLOW}⚠️  Création du dossier images...${NC}"
    mkdir -p "$LOGO_DIR"
    echo -e "${GREEN}✅ Dossier créé : $LOGO_DIR${NC}"
fi

# Vérifier si le logo existe déjà
if [ -f "$LOGO_PATH" ]; then
    echo -e "${GREEN}✅ Logo déjà présent : $LOGO_PATH${NC}"
    echo ""
    
    # Afficher les infos du fichier
    if command -v file &> /dev/null; then
        echo -e "${BLUE}ℹ️  Informations du logo actuel :${NC}"
        file "$LOGO_PATH"
    fi
    
    if command -v du &> /dev/null; then
        SIZE=$(du -h "$LOGO_PATH" | cut -f1)
        echo -e "${BLUE}ℹ️  Taille : $SIZE${NC}"
    fi
    
    echo ""
    
    read -p "Voulez-vous le remplacer ? (o/N) : " replace
    if [[ ! $replace =~ ^[Oo]$ ]]; then
        echo -e "${BLUE}👍 Conservation du logo actuel${NC}"
        exit 0
    fi
fi

# Instructions pour placer le logo
echo -e "${YELLOW}📍 INSTRUCTIONS :${NC}"
echo ""
echo "1. Vous avez fourni un logo avec un 'G' doré dans un cercle"
echo ""
echo "2. Sauvegardez ce logo depuis votre navigateur ou finder"
echo ""
echo "3. Placez le fichier ici :"
echo -e "   ${GREEN}$LOGO_PATH${NC}"
echo ""
echo "4. Formats recommandés :"
echo "   - Format : PNG avec transparence"
echo "   - Dimensions : 512x512px (carré)"
echo "   - Poids : < 500KB"
echo ""

# Ouvrir le dossier dans Finder (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}📂 Ouverture du dossier dans Finder...${NC}"
    open "$LOGO_DIR"
fi

# Créer un fichier placeholder
PLACEHOLDER="$LOGO_DIR/.logo-placeholder.txt"
cat > "$PLACEHOLDER" << 'EOF'
🎨 LOGO ELIJAHGOD À PLACER ICI

Fichier attendu : logo.png

Votre logo fourni : 
- "G" doré dans un cercle
- Style : Bronze/Gold
- Forme : Circulaire

Format recommandé :
- PNG avec transparence
- 512x512px (carré)
- < 500KB

Une fois placé, supprimer ce fichier.
EOF

echo -e "${GREEN}✅ Placeholder créé : $PLACEHOLDER${NC}"
echo ""

# Attendre que l'utilisateur place le logo
echo -e "${YELLOW}⏳ En attente du fichier logo.png...${NC}"
echo ""
echo "Appuyez sur Entrée une fois le logo placé (ou Ctrl+C pour quitter)"
read -p ""

# Vérifier si le logo a été placé
if [ -f "$LOGO_PATH" ]; then
    echo ""
    echo -e "${GREEN}✅ Logo détecté !${NC}"
    
    # Vérifier le type de fichier
    if command -v file &> /dev/null; then
        FILE_TYPE=$(file -b "$LOGO_PATH")
        echo -e "${BLUE}ℹ️  Type : $FILE_TYPE${NC}"
        
        if [[ $FILE_TYPE == *"PNG"* || $FILE_TYPE == *"JPEG"* || $FILE_TYPE == *"image"* ]]; then
            echo -e "${GREEN}✅ Format valide${NC}"
        else
            echo -e "${RED}⚠️  Attention : Le fichier n'est peut-être pas une image${NC}"
        fi
    fi
    
    # Vérifier la taille
    if command -v du &> /dev/null; then
        SIZE=$(du -h "$LOGO_PATH" | cut -f1)
        SIZE_BYTES=$(du -b "$LOGO_PATH" | cut -f1)
        echo -e "${BLUE}ℹ️  Taille : $SIZE${NC}"
        
        if [ $SIZE_BYTES -gt 524288 ]; then  # 512KB
            echo -e "${YELLOW}⚠️  Le logo dépasse 512KB, considérez une compression${NC}"
        fi
    fi
    
    # Supprimer le placeholder
    rm -f "$PLACEHOLDER"
    
    echo ""
    echo -e "${GREEN}🎉 Logo installé avec succès !${NC}"
    echo ""
    echo "Le logo sera automatiquement utilisé dans :"
    echo "  - Header du site"
    echo "  - Footer"
    echo "  - Page de paramètres admin"
    echo "  - Emails"
    echo "  - Documents PDF"
    echo ""
    echo "Pour le voir en action :"
    echo "  cd frontend && npm start"
    
else
    echo ""
    echo -e "${RED}❌ Logo non trouvé${NC}"
    echo "Le fichier n'a pas été placé à : $LOGO_PATH"
    echo ""
    echo "Relancez ce script une fois le logo placé :"
    echo "  ./install-logo.sh"
fi

echo ""
echo "📚 Documentation complète : GUIDE_LOGO_COMPLET.md"
echo ""
