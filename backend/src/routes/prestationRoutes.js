const express = require('express');
const router = express.Router();
const prestationController = require('../controllers/prestationController');
const { uploadSingleImage, uploadMultipleImages, handleUploadError } = require('../middleware/prestationUpload');

/**
 * 📦 ROUTES PRESTATIONS
 * Routes publiques pour voir les prestations
 * Routes admin pour gérer les prestations
 */

// Routes publiques
router.get('/', prestationController.getPrestations);
router.get('/categories', prestationController.getCategories);
router.get('/:id', prestationController.getPrestationById);
router.post('/:id/calculer-prix', prestationController.calculerPrix);

// Routes admin (TODO: ajouter middleware auth)
router.post('/', prestationController.createPrestation);
router.put('/:id', prestationController.updatePrestation);
router.delete('/:id', prestationController.deletePrestation);

// Routes upload d'images/vidéos
router.post('/:id/upload-image', uploadSingleImage, handleUploadError, prestationController.uploadImage);
router.post('/:id/upload-galerie', uploadMultipleImages, handleUploadError, prestationController.uploadGalerie);

module.exports = router;
