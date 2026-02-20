const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { authAdmin, requireSuperAdmin } = require('../middleware/authAdmin');

/**
 * 🔐 ROUTES AUTHENTIFICATION ADMIN
 */

// Routes publiques
router.post('/login', adminAuthController.loginAdmin);

// Routes protégées (admin)
router.get('/me', authAdmin, adminAuthController.getAdminProfile);
router.put('/profile', authAdmin, adminAuthController.updateAdminProfile);

// Routes protégées (super admin uniquement)
router.post('/create', authAdmin, requireSuperAdmin, adminAuthController.createAdmin);
router.get('/list', authAdmin, requireSuperAdmin, adminAuthController.listAdmins);
router.patch('/:id/toggle', authAdmin, requireSuperAdmin, adminAuthController.toggleAdminStatus);

module.exports = router;
