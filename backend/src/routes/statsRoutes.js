const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authAdmin } = require('../middleware/authAdmin');

/**
 * 📊 ROUTES STATISTIQUES ADMIN
 */

// GET /api/stats/admin - Toutes les statistiques (admin requis)
router.get('/admin', authAdmin, statsController.getStatsAdmin);

module.exports = router;
