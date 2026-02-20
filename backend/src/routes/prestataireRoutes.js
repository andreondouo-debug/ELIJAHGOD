const express = require('express');
const router = express.Router();
const prestataireController = require('../controllers/prestataireController');
const { authAdmin } = require('../middleware/authAdmin');
const { uploadMultiple, handleUploadError } = require('../middleware/prestataireUpload');

// Middleware d'authentification prestataire
const authPrestataire = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '❌ Token manquant' });
    }
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'prestataire') {
      return res.status(403).json({ success: false, message: '❌ Accès réservé aux prestataires' });
    }
    req.prestataireId = decoded.prestataireId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '❌ Token invalide' });
  }
};

/**
 * 🔐 ROUTES D'AUTHENTIFICATION
 */
router.post('/inscription', prestataireController.inscription);
router.post('/connexion', prestataireController.connexion);

/**
 * 📋 ROUTES PUBLIQUES
 */
router.get('/', prestataireController.lister);
router.get('/categories', prestataireController.categories);
router.post('/batch', prestataireController.getBatch);

/**
 * 🛡️ ROUTES ADMIN (authAdmin requis) — avant /:id pour éviter les conflits
 */
router.get('/admin/tous', authAdmin, prestataireController.listerTousAdmin);
router.put('/admin/:id', authAdmin, prestataireController.modifierPrestataire);
router.delete('/admin/:id', authAdmin, prestataireController.supprimerPrestataire);

/**
 * 🔒 ROUTES PROTÉGÉES PRESTATAIRE — avant /:id pour éviter les conflits
 */
router.get('/me/profil', authPrestataire, prestataireController.monProfil);
router.get('/me/statistiques', authPrestataire, prestataireController.statistiques);
router.post('/disponibilite', authPrestataire, prestataireController.gererDisponibilite);
router.put('/profil', authPrestataire, prestataireController.mettreAJourProfil);
router.post('/profil/media', authPrestataire, uploadMultiple, handleUploadError, prestataireController.uploadMedia);

/**
 * 📌 ROUTES PUBLIQUES dynamiques (toujours en dernier)
 */
router.get('/:id', prestataireController.voirProfil);
router.post('/:id/avis', prestataireController.ajouterAvis);

module.exports = router;
