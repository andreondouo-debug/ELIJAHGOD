const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');

/**
 * 📅 ROUTES PLANNING
 * Routes publiques pour vérifier les disponibilités
 * Routes admin pour gérer les réservations
 */

// Routes publiques
router.post('/verifier-disponibilite', planningController.verifierDisponibilite);
router.get('/dates-indisponibles/:annee/:mois', planningController.getDatesIndisponibles);

// Routes admin (TODO: ajouter middleware auth)
router.get('/reservations', planningController.getAllReservations);
router.get('/reservations/:id', planningController.getReservationById);
router.put('/reservations/:id', planningController.updateReservation);
router.put('/reservations/:id/annuler', planningController.annulerReservation);

module.exports = router;
