const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const authClient = require('../middleware/authClient');
const { adminOnly } = require('../middleware/checkPermission');

/**
 * 🔐 Routes de gestion des utilisateurs
 * Toutes les routes nécessitent une authentification admin
 */

// Statistiques utilisateurs (placée en premier pour éviter conflit avec :userId)
router.get('/stats', 
  authClient, 
  adminOnly, 
  userManagementController.statistiquesUtilisateurs
);

// Liste de tous les utilisateurs avec filtres
router.get('/', 
  authClient, 
  adminOnly, 
  userManagementController.listerUtilisateurs
);

// Détails d'un utilisateur spécifique
router.get('/:userId', 
  authClient, 
  adminOnly, 
  userManagementController.detailsUtilisateur
);

// Modifier le rôle d'un utilisateur
router.put('/:userId/role', 
  authClient, 
  adminOnly, 
  userManagementController.modifierRole
);

// Modifier les permissions d'un utilisateur
router.put('/:userId/permissions', 
  authClient, 
  adminOnly, 
  userManagementController.modifierPermissions
);

// Activer/Désactiver un compte utilisateur
router.put('/:userId/status', 
  authClient, 
  adminOnly, 
  userManagementController.toggleStatut
);

// Supprimer un utilisateur
router.delete('/:userId', 
  authClient, 
  adminOnly, 
  userManagementController.supprimerUtilisateur
);

module.exports = router;
