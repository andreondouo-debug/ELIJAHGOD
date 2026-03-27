const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const evenementController = require('../controllers/evenementController');
const { authAdmin } = require('../middleware/authAdmin');

/**
 * 🔐 Middleware auth combiné Admin OU Prestataire
 * Permet l'accès aux deux rôles
 */
const authAdminOuPrestataire = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '❌ Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'admin') {
      req.adminId = decoded.adminId;
      req.adminNom = decoded.nom || 'Admin';
    } else if (decoded.type === 'prestataire') {
      req.prestataireId = decoded.prestataireId;
      req.prestataireNom = decoded.nom || 'Prestataire';
    } else {
      return res.status(403).json({ success: false, message: '❌ Accès réservé aux admins et prestataires' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '❌ Token invalide' });
  }
};

/**
 * 📅 ROUTES ÉVÉNEMENTS / AGENDA
 */

// CRUD principal
router.post('/', authAdminOuPrestataire, evenementController.creerEvenement);
router.get('/', authAdminOuPrestataire, evenementController.listerEvenements);
router.get('/:id', authAdminOuPrestataire, evenementController.getEvenement);
router.put('/:id', authAdminOuPrestataire, evenementController.majEvenement);
router.delete('/:id', authAdminOuPrestataire, evenementController.supprimerEvenement);

// Statut
router.patch('/:id/statut', authAdminOuPrestataire, evenementController.changerStatut);

// Programme (étapes)
router.post('/:id/programme', authAdminOuPrestataire, evenementController.ajouterEtape);
router.put('/:id/programme/:etapeId', authAdminOuPrestataire, evenementController.majEtape);
router.delete('/:id/programme/:etapeId', authAdminOuPrestataire, evenementController.supprimerEtape);

// Todos
router.post('/:id/todos', authAdminOuPrestataire, evenementController.ajouterTodo);
router.put('/:id/todos/:todoId', authAdminOuPrestataire, evenementController.majTodo);
router.delete('/:id/todos/:todoId', authAdminOuPrestataire, evenementController.supprimerTodo);

// Boîte à outils
router.post('/:id/outils', authAdminOuPrestataire, evenementController.ajouterOutil);
router.put('/:id/outils/:outilId', authAdminOuPrestataire, evenementController.majOutil);
router.delete('/:id/outils/:outilId', authAdminOuPrestataire, evenementController.supprimerOutil);

module.exports = router;
