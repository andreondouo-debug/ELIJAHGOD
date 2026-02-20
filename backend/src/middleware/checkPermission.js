/**
 * 🔐 MIDDLEWARE VÉRIFICATION PERMISSIONS
 * Vérifie si l'utilisateur a une permission spécifique
 */

const Client = require('../models/Client');

/**
 * Middleware pour vérifier une permission spécifique
 * @param {string} permission - Nom de la permission à vérifier
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.clientId) {
        return res.status(401).json({
          message: 'Authentification requise'
        });
      }

      // Charger le client complet
      const client = await Client.findById(req.clientId);

      if (!client) {
        return res.status(404).json({
          message: 'Utilisateur non trouvé'
        });
      }

      // Vérifier si le compte est actif
      if (!client.isActive) {
        return res.status(403).json({
          message: 'Votre compte a été désactivé. Contactez un administrateur.'
        });
      }

      // Admin a tous les droits
      if (client.role === 'admin') {
        req.client = client;
        return next();
      }

      // Vérifier la permission spécifique
      if (!client.hasPermission(permission)) {
        return res.status(403).json({
          message: `Vous n'avez pas la permission requise: ${permission}`,
          permissionRequise: permission,
          votreRole: client.role
        });
      }

      // Attacher le client à la requête
      req.client = client;
      next();

    } catch (error) {
      console.error('❌ Erreur vérification permission:', error);
      res.status(500).json({
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  };
};

/**
 * Middleware pour vérifier le rôle
 * @param {string|Array} roles - Rôle(s) autorisé(s)
 */
const checkRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.clientId) {
        return res.status(401).json({
          message: 'Authentification requise'
        });
      }

      const client = await Client.findById(req.clientId);

      if (!client) {
        return res.status(404).json({
          message: 'Utilisateur non trouvé'
        });
      }

      if (!client.isActive) {
        return res.status(403).json({
          message: 'Votre compte a été désactivé'
        });
      }

      // Vérifier si le rôle de l'utilisateur est dans la liste autorisée
      if (!roles.includes(client.role)) {
        return res.status(403).json({
          message: 'Accès refusé. Rôle insuffisant.',
          roleRequis: roles,
          votreRole: client.role
        });
      }

      req.client = client;
      next();

    } catch (error) {
      console.error('❌ Erreur vérification rôle:', error);
      res.status(500).json({
        message: 'Erreur lors de la vérification du rôle'
      });
    }
  };
};

/**
 * Middleware pour admin uniquement
 */
const adminOnly = checkRole('admin');

/**
 * Middleware pour valideur ou admin
 */
const valideurOrAdmin = checkRole('valideur', 'admin');

/**
 * Middleware pour prestataire, valideur ou admin
 */
const prestataireOrHigher = checkRole('prestataire', 'valideur', 'admin');

module.exports = {
  checkPermission,
  checkRole,
  adminOnly,
  valideurOrAdmin,
  prestataireOrHigher
};
