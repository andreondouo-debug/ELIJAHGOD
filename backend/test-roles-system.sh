#!/bin/bash

# 🧪 SCRIPT DE TEST - SYSTÈME RÔLES & TÉMOIGNAGES
# Test des endpoints backend nouvellement créés

# Configuration
BASE_URL="http://localhost:5001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 =================================="
echo "   TESTS BACKEND - RÔLES & TÉMOIGNAGES"
echo "   Backend URL: $BASE_URL"
echo "===================================="
echo ""

# Variables globales
ADMIN_TOKEN=""
CLIENT_TOKEN=""
PROSPECT_TOKEN=""
USER_ID=""
TEMOIGNAGE_ID=""

# Fonction pour afficher résultat
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local expected_code=$5
    local description=$6
    
    if [ -n "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected_code" ]; then
        print_result 0 "$description (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_result 1 "$description (Expected $expected_code, got $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    
    echo ""
    echo "$body"
}

# ============================================
# 1. HEALTH CHECK
# ============================================
echo "📡 1. HEALTH CHECK"
echo "-------------------"
test_endpoint "GET" "/api/health" "" "" "200" "Health check"

# ============================================
# 2. CRÉATION COMPTES TEST
# ============================================
echo ""
echo "👤 2. CRÉATION COMPTES TEST"
echo "----------------------------"

# Admin
echo "Création compte Admin..."
admin_response=$(curl -s -X POST "$BASE_URL/api/clients/register" \
    -H "Content-Type: application/json" \
    -d '{
        "prenom": "Admin",
        "nom": "Test",
        "email": "admin@test.com",
        "telephone": "0601020304",
        "password": "admin123"
    }')

echo "$admin_response" | jq '.'

# Extraire token et ID
ADMIN_TOKEN=$(echo "$admin_response" | jq -r '.token // empty')
ADMIN_ID=$(echo "$admin_response" | jq -r '.client._id // empty')

if [ -n "$ADMIN_TOKEN" ]; then
    print_result 0 "Admin créé avec succès"
    echo "Token: ${ADMIN_TOKEN:0:20}..."
    echo "ID: $ADMIN_ID"
else
    print_result 1 "Échec création admin"
fi

echo ""

# Client
echo "Création compte Client..."
client_response=$(curl -s -X POST "$BASE_URL/api/clients/register" \
    -H "Content-Type: application/json" \
    -d '{
        "prenom": "Client",
        "nom": "Test",
        "email": "client@test.com",
        "telephone": "0601020305",
        "password": "client123"
    }')

CLIENT_TOKEN=$(echo "$client_response" | jq -r '.token // empty')
CLIENT_ID=$(echo "$client_response" | jq -r '.client._id // empty')

if [ -n "$CLIENT_TOKEN" ]; then
    print_result 0 "Client créé avec succès"
else
    print_result 1 "Échec création client"
fi

echo ""

# Prospect
echo "Création compte Prospect..."
prospect_response=$(curl -s -X POST "$BASE_URL/api/clients/register" \
    -H "Content-Type: application/json" \
    -d '{
        "prenom": "Prospect",
        "nom": "Test",
        "email": "prospect@test.com",
        "telephone": "0601020306",
        "password": "prospect123"
    }')

PROSPECT_TOKEN=$(echo "$prospect_response" | jq -r '.token // empty')
PROSPECT_ID=$(echo "$prospect_response" | jq -r '.client._id // empty')

if [ -n "$PROSPECT_TOKEN" ]; then
    print_result 0 "Prospect créé avec succès"
else
    print_result 1 "Échec création prospect"
fi

echo ""

# ============================================
# 3. PROMOUVOIR ADMIN MANUELLEMENT
# ============================================
echo ""
echo "🏆 3. PROMOTION ADMIN"
echo "---------------------"
echo "⚠️  ATTENTION: Vous devez promouvoir manuellement le compte admin dans MongoDB:"
echo ""
echo "db.clients.updateOne("
echo "  { email: 'admin@test.com' },"
echo "  { \$set: { "
echo "      role: 'admin',"
echo "      'permissions.canViewAllDevis': true,"
echo "      'permissions.canValidateDevis': true,"
echo "      'permissions.canManageUsers': true,"
echo "      'permissions.canManageSettings': true,"
echo "      'permissions.canManagePrestations': true,"
echo "      'permissions.canManageMateriel': true,"
echo "      'permissions.canViewReports': true"
echo "    }"
echo "  }"
echo ")"
echo ""
read -p "Appuyez sur Entrée une fois la promotion effectuée..."

# ============================================
# 4. TESTS GESTION UTILISATEURS (Admin uniquement)
# ============================================
echo ""
echo "👥 4. TESTS GESTION UTILISATEURS"
echo "--------------------------------"

# Liste utilisateurs
echo "Test: Liste tous les utilisateurs (admin)"
test_endpoint "GET" "/api/users?page=1&limit=10" "" "$ADMIN_TOKEN" "200" "Liste utilisateurs"

# Stats utilisateurs
echo "Test: Statistiques utilisateurs (admin)"
test_endpoint "GET" "/api/users/stats" "" "$ADMIN_TOKEN" "200" "Stats utilisateurs"

# Détails utilisateur
echo "Test: Détails d'un utilisateur (admin)"
test_endpoint "GET" "/api/users/$CLIENT_ID" "" "$ADMIN_TOKEN" "200" "Détails utilisateur"

# Modifier rôle
echo "Test: Modifier rôle (prospect → client)"
test_endpoint "PUT" "/api/users/$PROSPECT_ID/role" '{"role":"client"}' "$ADMIN_TOKEN" "200" "Modifier rôle"

# Modifier permissions
echo "Test: Modifier permissions"
test_endpoint "PUT" "/api/users/$CLIENT_ID/permissions" '{"permissions":{"canViewReports":true}}' "$ADMIN_TOKEN" "200" "Modifier permissions"

# Toggle statut
echo "Test: Désactiver compte"
test_endpoint "PUT" "/api/users/$CLIENT_ID/status" '{"isActive":false}' "$ADMIN_TOKEN" "200" "Toggle statut"

echo "Test: Réactiver compte"
test_endpoint "PUT" "/api/users/$CLIENT_ID/status" '{"isActive":true}' "$ADMIN_TOKEN" "200" "Toggle statut"

# ============================================
# 5. TESTS PERMISSIONS (Sécurité)
# ============================================
echo ""
echo "🔐 5. TESTS SÉCURITÉ PERMISSIONS"
echo "---------------------------------"

# Client essaie d'accéder à /api/users (should fail)
echo "Test: Client tente d'accéder à liste users (doit échouer)"
test_endpoint "GET" "/api/users" "" "$CLIENT_TOKEN" "403" "Accès refusé pour client"

# Client essaie de modifier un rôle (should fail)
echo "Test: Client tente de modifier un rôle (doit échouer)"
test_endpoint "PUT" "/api/users/$PROSPECT_ID/role" '{"role":"admin"}' "$CLIENT_TOKEN" "403" "Modification rôle refusée"

# ============================================
# 6. TESTS TÉMOIGNAGES
# ============================================
echo ""
echo "💬 6. TESTS TÉMOIGNAGES"
echo "-----------------------"

# Créer témoignage externe (public, no auth)
echo "Test: Créer témoignage externe (sans auth)"
temoignage_externe=$(curl -s -X POST "$BASE_URL/api/temoignages/externe" \
    -H "Content-Type: application/json" \
    -d '{
        "nom": "Jean Dupont",
        "entreprise": "Mairie de Paris",
        "email": "jean@example.com",
        "titre": "Prestation exceptionnelle",
        "contenu": "ELIJAH GOD a assuré la sonorisation de notre événement. Service professionnel et de qualité !",
        "note": 5
    }')

echo "$temoignage_externe" | jq '.'
TEMOIGNAGE_ID=$(echo "$temoignage_externe" | jq -r '.temoignage._id // empty')

if [ -n "$TEMOIGNAGE_ID" ]; then
    print_result 0 "Témoignage externe créé"
else
    print_result 1 "Échec création témoignage externe"
fi

echo ""

# Créer témoignage client authentifié
echo "Test: Créer témoignage client (avec auth)"
temoignage_client=$(curl -s -X POST "$BASE_URL/api/temoignages" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CLIENT_TOKEN" \
    -d '{
        "titre": "Super DJ pour mariage",
        "contenu": "ELIJAH GOD a animé notre mariage le mois dernier. Ambiance garantie, invités ravis !",
        "note": 5
    }')

echo "$temoignage_client" | jq '.'

TEMOIGNAGE_CLIENT_ID=$(echo "$temoignage_client" | jq -r '.temoignage._id // empty')

if [ -n "$TEMOIGNAGE_CLIENT_ID" ]; then
    print_result 0 "Témoignage client créé"
else
    print_result 1 "Échec création témoignage client"
fi

echo ""

# Liste témoignages publics (should be empty, car en_attente)
echo "Test: Lister témoignages publics (doit être vide - modération requise)"
test_endpoint "GET" "/api/temoignages?page=1&limit=10" "" "" "200" "Liste témoignages publics"

# Liste témoignages en attente (admin/valideur)
echo "Test: Lister témoignages en attente de modération (admin)"
test_endpoint "GET" "/api/temoignages/moderation" "" "$ADMIN_TOKEN" "200" "Témoignages en attente"

# Approuver témoignage
echo "Test: Approuver témoignage (admin)"
test_endpoint "PUT" "/api/temoignages/$TEMOIGNAGE_ID/approuver" '{"isFeatured":true}' "$ADMIN_TOKEN" "200" "Approuver témoignage"

# Vérifier que témoignage approuvé apparaît maintenant
echo "Test: Vérifier témoignage approuvé dans liste publique"
test_endpoint "GET" "/api/temoignages?page=1&limit=10" "" "" "200" "Liste avec témoignages approuvés"

# Marquer utile (like)
echo "Test: Marquer témoignage utile (like)"
test_endpoint "POST" "/api/temoignages/$TEMOIGNAGE_ID/utile" "" "$CLIENT_TOKEN" "200" "Marquer utile"

# Répondre au témoignage (admin)
echo "Test: Répondre à témoignage (admin)"
test_endpoint "POST" "/api/temoignages/$TEMOIGNAGE_ID/repondre" '{"texte":"Merci Jean pour votre retour ! Ravis d avoir contribué à votre événement."}' "$ADMIN_TOKEN" "200" "Répondre témoignage"

# Refuser second témoignage
if [ -n "$TEMOIGNAGE_CLIENT_ID" ]; then
    echo "Test: Refuser témoignage (admin)"
    test_endpoint "PUT" "/api/temoignages/$TEMOIGNAGE_CLIENT_ID/refuser" '{"raison":"Test de refus"}' "$ADMIN_TOKEN" "200" "Refuser témoignage"
fi

# ============================================
# 7. RÉSUMÉ DES TESTS
# ============================================
echo ""
echo "📊 7. RÉSUMÉ DES TESTS"
echo "---------------------"
echo ""
echo "Comptes créés:"
echo "  - Admin: admin@test.com / admin123"
echo "  - Client: client@test.com / client123"
echo "  - Prospect: prospect@test.com / prospect123"
echo ""
echo "IDs:"
echo "  - Admin ID: $ADMIN_ID"
echo "  - Client ID: $CLIENT_ID"
echo "  - Prospect ID: $PROSPECT_ID"
echo "  - Témoignage ID: $TEMOIGNAGE_ID"
echo ""
echo "Tokens (20 premiers caractères):"
echo "  - Admin: ${ADMIN_TOKEN:0:20}..."
echo "  - Client: ${CLIENT_TOKEN:0:20}..."
echo "  - Prospect: ${PROSPECT_TOKEN:0:20}..."
echo ""
echo "✅ Tests terminés !"
echo ""
echo "🔧 Prochaines étapes:"
echo "  1. Vérifier les logs backend: cd backend && npm run dev"
echo "  2. Tester avec Postman ou Insomnia"
echo "  3. Développer le frontend (voir TACHES_FRONTEND_ROLES.md)"
echo ""
