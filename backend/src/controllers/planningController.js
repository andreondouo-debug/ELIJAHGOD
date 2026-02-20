const Reservation = require('../models/Reservation');

/**
 * 📅 CONTROLLER PLANNING
 * Gestion du planning et des réservations
 */

// @desc    Vérifier la disponibilité d'une date
// @route   POST /api/planning/verifier-disponibilite
// @access  Public
exports.verifierDisponibilite = async (req, res) => {
  try {
    const { date, heureDebut, heureFin } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'La date est requise'
      });
    }
    
    const resultat = await Reservation.verifierDisponibilite(date, heureDebut, heureFin);
    
    res.json({
      success: true,
      data: resultat
    });
  } catch (error) {
    console.error('❌ Erreur verifierDisponibilite:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de disponibilité'
    });
  }
};

// @desc    Obtenir les dates indisponibles d'un mois
// @route   GET /api/planning/dates-indisponibles/:annee/:mois
// @access  Public
exports.getDatesIndisponibles = async (req, res) => {
  try {
    const { annee, mois } = req.params;
    
    const dates = await Reservation.getDatesIndisponibles(
      parseInt(annee),
      parseInt(mois)
    );
    
    res.json({
      success: true,
      data: dates
    });
  } catch (error) {
    console.error('❌ Erreur getDatesIndisponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dates'
    });
  }
};

// @desc    Obtenir toutes les réservations (Admin)
// @route   GET /api/planning/reservations
// @access  Private/Admin
exports.getAllReservations = async (req, res) => {
  try {
    const { statut, dateDebut, dateFin } = req.query;
    
    let filtre = {};
    if (statut) filtre.statut = statut;
    if (dateDebut || dateFin) {
      filtre.date = {};
      if (dateDebut) filtre.date.$gte = new Date(dateDebut);
      if (dateFin) filtre.date.$lte = new Date(dateFin);
    }
    
    const reservations = await Reservation.find(filtre)
      .populate('devis')
      .sort('date');
    
    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('❌ Erreur getAllReservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
};

// @desc    Obtenir une réservation par ID (Admin)
// @route   GET /api/planning/reservations/:id
// @access  Private/Admin
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('devis');
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('❌ Erreur getReservationById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation'
    });
  }
};

// @desc    Mettre à jour une réservation (Admin)
// @route   PUT /api/planning/reservations/:id
// @access  Private/Admin
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: '✅ Réservation mise à jour',
      data: reservation
    });
  } catch (error) {
    console.error('❌ Erreur updateReservation:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Annuler une réservation (Admin)
// @route   PUT /api/planning/reservations/:id/annuler
// @access  Private/Admin
exports.annulerReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }
    
    reservation.statut = 'annulee';
    reservation.notes = req.body.notes || reservation.notes;
    await reservation.save();
    
    res.json({
      success: true,
      message: '✅ Réservation annulée',
      data: reservation
    });
  } catch (error) {
    console.error('❌ Erreur annulerReservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation'
    });
  }
};
