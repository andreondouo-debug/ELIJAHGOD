const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * 🔐 MIDDLEWARE D'AUTHENTIFICATION ADMIN
 * Vérifie le token JWT admin et injecte adminId dans req
 */
const authAdmin = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '❌ Token manquant. Accès admin requis.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que c'est bien un token admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '❌ Accès réservé aux administrateurs'
      });
    }

    // Vérifier que l'admin existe et est actif
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ 
        message: '❌ Admin non trouvé' 
      });
    }

    if (!admin.actif) {
      return res.status(403).json({ 
        message: '❌ Compte désactivé' 
      });
    }

    // Ajouter l'ID et le rôle de l'admin à la requête
    req.adminId = decoded.adminId;
    req.adminRole = decoded.role;
    
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '❌ Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '❌ Token expiré. Veuillez vous reconnecter.'
      });
    }

    console.error('❌ Erreur middleware authAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification',
      error: error.message
    });
  }
};

/**
 * 🔒 MIDDLEWARE AUTORISATION SUPER ADMIN
 * Vérifie que l'admin est un super_admin
 */
const requireSuperAdmin = (req, res, next) => {
  if (req.adminRole !== 'super_admin') {
    return res.status(403).json({ 
      message: '❌ Accès refusé. Privilèges super admin requis.' 
    });
  }
  next();
};

module.exports = { authAdmin, requireSuperAdmin };
