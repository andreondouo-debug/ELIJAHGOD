const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authClient = require('../middleware/authClient');

/**
 * 🛣️ ROUTES CLIENT
 * Gestion des comptes clients
 */

// ============================================
// ROUTES PUBLIQUES
// ============================================

// @route   POST /api/clients/inscription
// @desc    Inscription d'un nouveau client
// @access  Public
router.post('/inscription', clientController.inscription);

// @route   POST /api/clients/connexion
// @desc    Connexion d'un client
// @access  Public
router.post('/connexion', clientController.connexion);

// @route   GET /api/clients/verifier-email/:token
// @desc    Vérifier l'email avec le token
// @access  Public
router.get('/verifier-email/:token', clientController.verifierEmail);

// @route   POST /api/clients/demander-reset-password
// @desc    Demander un reset de mot de passe
// @access  Public
router.post('/demander-reset-password', clientController.demanderResetPassword);

// @route   POST /api/clients/reset-password/:token
// @desc    Réinitialiser le mot de passe
// @access  Public
router.post('/reset-password/:token', clientController.resetPassword);

// ============================================
// ROUTES PROTÉGÉES (Authentification requise)
// ============================================

// @route   GET /api/clients/profil
// @desc    Obtenir le profil du client connecté
// @access  Privé (Client)
router.get('/profil', authClient, clientController.obtenirProfil);

// @route   PUT /api/clients/profil
// @desc    Mettre à jour le profil
// @access  Privé (Client)
router.put('/profil', authClient, clientController.mettreAJourProfil);

// @route   POST /api/clients/changer-mot-de-passe
// @desc    Changer le mot de passe
// @access  Privé (Client)
router.post('/changer-mot-de-passe', authClient, clientController.changerMotDePasse);

// @route   GET /api/clients/statistiques
// @desc    Obtenir les statistiques du client
// @access  Privé (Client)
router.get('/statistiques', authClient, clientController.obtenirStatistiques);

module.exports = router;
