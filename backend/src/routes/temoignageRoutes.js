const express = require('express');
const router = express.Router();
const temoignageController = require('../controllers/temoignageController');
const authClient = require('../middleware/authClient');
const { adminOnly, valideurOrAdmin } = require('../middleware/checkPermission');

/**
 * 💬 Routes de gestion des témoignages
 * Routes mixtes : publiques, authentifiées et admin
 */

// ============= ROUTES PUBLIQUES =============

// Liste des témoignages approuvés (visible au public)
router.get('/', temoignageController.listerTemoignages);

// Créer un témoignage externe (sans authentification - visiteurs)
router.post('/externe', temoignageController.creerTemoignageExterne);

// ============= ROUTES AUTHENTIFIÉES =============

// Créer un témoignage (clients authentifiés)
router.post('/', 
  authClient, 
  temoignageController.creerTemoignage
);

// Marquer un témoignage comme utile (like)
router.post('/:id/utile', 
  authClient, 
  temoignageController.marquerUtile
);

// ============= ROUTES ADMIN / VALIDEUR =============

// Liste des témoignages en attente de modération
router.get('/moderation', 
  authClient, 
  valideurOrAdmin, 
  temoignageController.temoignagesEnAttente
);

// Approuver un témoignage
router.put('/:id/approuver', 
  authClient, 
  valideurOrAdmin, 
  temoignageController.approuverTemoignage
);

// Refuser un témoignage
router.put('/:id/refuser', 
  authClient, 
  valideurOrAdmin, 
  temoignageController.refuserTemoignage
);

// ============= ROUTES ADMIN UNIQUEMENT =============

// Répondre à un témoignage (admin response)
router.post('/:id/repondre', 
  authClient, 
  adminOnly, 
  temoignageController.repondreTemoignage
);

// Supprimer un témoignage
router.delete('/:id', 
  authClient, 
  adminOnly, 
  temoignageController.supprimerTemoignage
);

module.exports = router;
