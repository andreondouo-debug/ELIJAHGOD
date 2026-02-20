const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { uploadPhoto, uploadGalerie, handleUploadError } = require('../middleware/aProposUpload');
const { uploadCarousel, handleUploadError: handleCarouselError } = require('../middleware/carouselUpload');

/**
 * ⚙️ ROUTES PARAMÈTRES
 * Routes publiques pour consulter les paramètres
 * Routes admin pour gérer les paramètres
 */

// Routes publiques
router.get('/', settingsController.getSettings);

// Routes admin (TODO: ajouter middleware auth)
router.get('/admin', settingsController.getSettingsAdmin);
router.get('/stats', settingsController.getStats);
router.put('/', settingsController.updateSettings);

// Routes spécifiques par section
router.put('/entreprise', settingsController.updateEntreprise);
router.put('/contact', settingsController.updateContact);
router.put('/reseaux-sociaux', settingsController.updateReseauxSociaux);
router.put('/devis', settingsController.updateDevisSettings);
router.put('/tarifs', settingsController.updateTarifs);
router.put('/messages', settingsController.updateMessages);
router.put('/email', settingsController.updateEmailConfig);
router.put('/planning', settingsController.updatePlanningSettings);
router.put('/site', settingsController.updateSiteSettings);
router.put('/seo', settingsController.updateSEO);

// Réinitialisation
router.post('/reset', settingsController.resetSettings);

// --- À propos : upload photo & galerie ---
router.post('/apropos/upload-photo', (req, res, next) => {
  uploadPhoto(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
}, settingsController.uploadPhotoProfil);

router.post('/apropos/galerie', (req, res, next) => {
  uploadGalerie(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
}, settingsController.uploadGalerieImages);

router.put('/apropos/galerie/legende', settingsController.updateGalerieLegende);
router.delete('/apropos/galerie/:index', settingsController.deleteGalerieImage);

// --- Carousel : upload image de fond ---
router.post('/carousel/upload-banniere', (req, res, next) => {
  uploadCarousel(req, res, (err) => {
    if (err) return handleCarouselError(err, req, res, next);
    next();
  });
}, settingsController.uploadCarouselBanniere);

router.delete('/carousel/banniere', settingsController.deleteCarouselBanniere);

module.exports = router;
