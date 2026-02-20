const Client = require('../models/Client');
const Devis = require('../models/Devis');

/**
 * 👥 CONTRÔLEUR GESTION DES UTILISATEURS (ADMIN)
 */

/**
 * Lister tous les utilisateurs avec filtres
 * GET /api/users
 */
exports.listerUtilisateurs = async (req, res) => {
  try {
    const { 
      role, 
      statut, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = '-createdAt'
    } = req.query;

    // Construction de la requête
    let query = {};

    if (role) {
      query.role = role;
    }

    if (statut !== undefined) {
      query.isActive = statut === 'actif';
    }

    if (search) {
      query.$or = [
        { prenom: new RegExp(search, 'i') },
        { nom: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { entreprise: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [utilisateurs, total] = await Promise.all([
      Client.find(query)
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit)),
      Client.countDocuments(query)
    ]);

    res.json({
      utilisateurs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur listage utilisateurs:', error);
    res.status(500).json({
      message: 'Erreur lors du listage des utilisateurs'
    });
  }
};

/**
 * Obtenir les détails d'un utilisateur
 * GET /api/users/:userId
 */
exports.detailsUtilisateur = async (req, res) => {
  try {
    const { userId } = req.params;

    const utilisateur = await Client.findById(userId)
      .select('-password -emailVerificationToken -passwordResetToken');

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }

    // Charger les statistiques de devis
    const statsDevis = await Devis.aggregate([
      { $match: { clientId: utilisateur._id } },
      {
        $group: {
          _id: null,
          nombreDevis: { $sum: 1 },
          totalMontants: { $sum: '$montants.totalTTC' },
          statuts: {
            $push: '$statut'
          }
        }
      }
    ]);

    res.json({
      utilisateur,
      statistiques: statsDevis[0] || { nombreDevis: 0, totalMontants: 0 }
    });

  } catch (error) {
    console.error('❌ Erreur détails utilisateur:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des détails'
    });
  }
};

/**
 * Modifier le rôle d'un utilisateur
 * PUT /api/users/:userId/role
 */
exports.modifierRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const rolesValides = ['prospect', 'client', 'prestataire', 'valideur', 'admin'];

    if (!rolesValides.includes(role)) {
      return res.status(400).json({
        message: 'Rôle invalide',
        rolesValides
      });
    }

    const utilisateur = await Client.findById(userId);

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }

    // Ne pas permettre de se rétrograder soi-même en tant qu'admin
    if (userId === req.clientId && role !== 'admin') {
      return res.status(403).json({
        message: 'Vous ne pouvez pas modifier votre propre rôle admin'
      });
    }

    utilisateur.role = role;
    utilisateur.setDefaultPermissions(); // Définir les permissions par défaut
    await utilisateur.save();

    res.json({
      message: `✅ Rôle modifié avec succès: ${role}`,
      utilisateur: utilisateur.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur modification rôle:', error);
    res.status(500).json({
      message: 'Erreur lors de la modification du rôle'
    });
  }
};

/**
 * Modifier les permissions d'un utilisateur
 * PUT /api/users/:userId/permissions
 */
exports.modifierPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    const utilisateur = await Client.findById(userId);

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }

    if (utilisateur.role === 'admin') {
      return res.status(403).json({
        message: 'Impossible de modifier les permissions d\'un admin'
      });
    }

    // Mettre à jour les permissions
    Object.keys(permissions).forEach(key => {
      if (utilisateur.permissions.hasOwnProperty(key)) {
        utilisateur.permissions[key] = permissions[key];
      }
    });

    await utilisateur.save();

    res.json({
      message: '✅ Permissions modifiées avec succès',
      utilisateur: utilisateur.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur modification permissions:', error);
    res.status(500).json({
      message: 'Erreur lors de la modification des permissions'
    });
  }
};

/**
 * Activer/Désactiver un utilisateur
 * PUT /api/users/:userId/status
 */
exports.toggleStatut = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const utilisateur = await Client.findById(userId);

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }

    // Ne pas permettre de se désactiver soi-même
    if (userId === req.clientId) {
      return res.status(403).json({
        message: 'Vous ne pouvez pas désactiver votre propre compte'
      });
    }

    utilisateur.isActive = isActive;
    await utilisateur.save();

    res.json({
      message: `✅ Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      utilisateur: utilisateur.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur modification statut:', error);
    res.status(500).json({
      message: 'Erreur lors de la modification du statut'
    });
  }
};

/**
 * Supprimer un utilisateur
 * DELETE /api/users/:userId
 */
exports.supprimerUtilisateur = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ne pas permettre de se supprimer soi-même
    if (userId === req.clientId) {
      return res.status(403).json({
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    const utilisateur = await Client.findById(userId);

    if (!utilisateur) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur a des devis
    const nombreDevis = await Devis.countDocuments({ clientId: userId });

    if (nombreDevis > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer: l'utilisateur a ${nombreDevis} devis associés. Désactivez le compte à la place.`,
        nombreDevis
      });
    }

    await Client.findByIdAndDelete(userId);

    res.json({
      message: '✅ Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur suppression utilisateur:', error);
    res.status(500).json({
      message: 'Erreur lors de la suppression'
    });
  }
};

/**
 * Statistiques globales des utilisateurs
 * GET /api/users/stats
 */
exports.statistiquesUtilisateurs = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          actifs: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    const totalUtilisateurs = await Client.countDocuments();
    const utilisateursActifs = await Client.countDocuments({ isActive: true });

    res.json({
      totalUtilisateurs,
      utilisateursActifs,
      parRole: stats,
      dernierMois: await Client.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    });

  } catch (error) {
    console.error('❌ Erreur statistiques:', error);
    res.status(500).json({
      message: 'Erreur lors du calcul des statistiques'
    });
  }
};
