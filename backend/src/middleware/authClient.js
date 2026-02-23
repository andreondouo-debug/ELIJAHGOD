const jwt = require('jsonwebtoken');

/**
 * 🔐 MIDDLEWARE D'AUTHENTIFICATION CLIENT
 * Vérifie le token JWT et injecte clientId dans req
 */
const authClient = (req, res, next) => {
  try {
    // Récupérer le token depuis l'header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '❌ Token manquant. Veuillez vous connecter.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que c'est bien un token client
    if (decoded.type !== 'client') {
      return res.status(403).json({
        success: false,
        message: '❌ Type de token invalide'
      });
    }

    // Ajouter l'ID du client à la requête
    req.clientId = decoded.clientId;
    
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

    console.error('❌ Erreur middleware authClient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification',
      error: error.message
    });
  }
};

module.exports = authClient;

/**
 * Auth optionnel : injecte clientId si token présent, continue sinon
 */
const optionalAuthClient = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'client') req.clientId = decoded.clientId;
  } catch (e) { /* token invalide ou absent — on continue */ }
  next();
};

module.exports.optionalAuthClient = optionalAuthClient;
