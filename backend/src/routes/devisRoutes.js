const express = require('express');
const router = express.Router();
const devisController = require('../controllers/devisController');
const authClient = require('../middleware/authClient');
const { authAdmin } = require('../middleware/authAdmin'); // Import destructuré

/**
 * 🛣️ ROUTES DEVIS - WORKFLOW INTERACTIF
 * Routes pour la gestion complète du cycle de vie des devis
 */

// ============================================
// ROUTES CLIENT (Authentification requise)
// ============================================

// @route   POST /api/devis/brouillon
// @desc    Créer un nouveau brouillon de devis (+ création compte auto si besoin)
// @access  Public/Client
router.post('/brouillon', devisController.creerBrouillon);

// @route   PUT /api/devis/:devisId/etape
// @desc    Sauvegarder une étape du workflow guidé
// @access  Privé (Client)
router.put('/:devisId/etape', authClient, devisController.sauvegarderEtape);

// @route   POST /api/devis/:devisId/soumettre
// @desc    Soumettre le devis finalisé
// @access  Privé (Client)
router.post('/:devisId/soumettre', authClient, devisController.soumettre);

// @route   GET /api/devis/client/mes-devis
// @desc    Lister tous mes devis (avec token client)
// @access  Privé (Client)
router.get('/client/mes-devis', authClient, devisController.mesDevis);

// ============================================
// ROUTES PDF - IMPORTANT: AVANT /:devisId
// ============================================

// @route   GET /api/devis/:devisId/pdf
// @desc    Télécharger le PDF du devis
// @access  Privé (Client)
router.get('/:devisId/pdf', authClient, devisController.genererPDF);

// @route   GET /api/devis/:devisId/pdf-url
// @desc    Obtenir l'URL du PDF sans télécharger
// @access  Privé (Client)
router.get('/:devisId/pdf-url', authClient, devisController.obtenirUrlPDF);

// @route   GET /api/devis/:devisId
// @desc    Voir les détails d'un devis
// @access  Privé (Client ou Admin)
router.get('/:devisId', authClient, devisController.detailsDevis);

// @route   PUT /api/devis/:devisId/valider-modifications
// @desc    Client valide ou refuse les modifications admin
// @access  Privé (Client)
router.put('/:devisId/valider-modifications', authClient, devisController.validerModifications);

// @route   POST /api/devis/:devisId/signer
// @desc    Signer le contrat (Client ou Admin)
// @access  Privé (Client ou Admin)
router.post('/:devisId/signer', authClient, devisController.signer);

// ============================================
// ROUTES ADMIN (Authentification Admin requise)
// ============================================

// @route   GET /api/devis/admin/tous
// @desc    Lister tous les devis (Admin)
// @access  Privé (Admin)
router.get('/admin/tous', authAdmin, devisController.listerTous);

// @route   GET /api/devis/admin/:devisId/pdf
// @desc    Admin télécharge le PDF du devis
// @access  Privé (Admin)
router.get('/admin/:devisId/pdf', authAdmin, devisController.genererPDF);

// @route   GET /api/devis/admin/:devisId
// @desc    Voir les détails d'un devis (Admin)
// @access  Privé (Admin)
router.get('/admin/:devisId', authAdmin, devisController.detailsDevis);

// @route   PATCH /api/devis/:devisId/statut
// @desc    Changer simplement le statut d'un devis (Admin)
// @access  Privé (Admin)
router.patch('/:devisId/statut', authAdmin, devisController.changerStatut);

// @route   PUT /api/devis/admin/:devisId/valider
// @desc    Valider, modifier ou refuser un devis
// @access  Privé (Admin)
router.put('/admin/:devisId/valider', authAdmin, devisController.validerModifier);

// @route   PUT /api/devis/admin/:devisId/modifier
// @desc    Modifier les prestations et montants d'un devis
// @access  Privé (Admin)
router.put('/admin/:devisId/modifier', authAdmin, devisController.modifierDevis);

// @route   POST /api/devis/admin/:devisId/valider-envoyer
// @desc    Valider les modifications et envoyer le devis au client
// @access  Privé (Admin)
router.post('/admin/:devisId/valider-envoyer', authAdmin, devisController.validerEtEnvoyer);

// @route   PUT /api/devis/:devisId/client-action
// @desc    Client valide ou retourne le devis
// @access  Privé (Client)
router.put('/:devisId/client-action', authClient, devisController.actionClient);

// @route   POST /api/devis/admin/:devisId/transformer-contrat
// @desc    Transformer un devis en contrat
// @access  Privé (Admin)
router.post('/admin/:devisId/transformer-contrat', authAdmin, devisController.transformerEnContrat);

// @route   POST /api/devis/admin/:devisId/signer
// @desc    Admin signe le contrat
// @access  Privé (Admin)
router.post('/admin/:devisId/signer', authAdmin, devisController.signer);

// @route   GET /api/devis/admin/:devisId/pdf
// @desc    Admin télécharge le PDF du devis
// @access  Privé (Admin)
router.get('/admin/:devisId/pdf', authAdmin, devisController.genererPDF);

module.exports = router;