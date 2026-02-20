const express = require('express');
const router = express.Router();
const materielController = require('../controllers/materielController');

// Middleware d'authentification prestataire
const authPrestataire = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '❌ Token manquant'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'prestataire') {
      return res.status(403).json({
        success: false,
        message: '❌ Accès réservé aux prestataires'
      });
    }

    req.prestataireId = decoded.prestataireId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '❌ Token invalide'
    });
  }
};

/**
 * 📋 ROUTES PUBLIQUES
 */
router.get('/', materielController.lister);
router.get('/categories', materielController.categories);
router.get('/:id', materielController.details);
router.get('/:id/disponibilite', materielController.verifierDisponibilite);

/**
 * 📅 RÉSERVATION
 */
router.post('/:id/reserver', materielController.reserver);

/**
 * 🔒 ROUTES PROTÉGÉES (prestataire)
 */
router.post('/', authPrestataire, materielController.ajouter);
router.put('/:id', authPrestataire, materielController.modifier);
router.delete('/:id', authPrestataire, materielController.supprimer);

module.exports = router;
