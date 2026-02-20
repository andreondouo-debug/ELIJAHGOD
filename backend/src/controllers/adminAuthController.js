const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * 🔐 CONTRÔLEUR AUTHENTIFICATION ADMIN
 * Gère la connexion et l'authentification des administrateurs
 */

// @desc    Connexion admin
// @route   POST /api/admin/auth/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Validation
    if (!email || !motDePasse) {
      return res.status(400).json({ 
        message: '❌ Email et mot de passe requis' 
      });
    }

    // Trouver l'admin (inclure le mot de passe)
    const admin = await Admin.findOne({ email }).select('+motDePasse');

    if (!admin) {
      return res.status(401).json({ 
        message: '❌ Identifiants invalides' 
      });
    }

    // Vérifier si le compte est actif
    if (!admin.actif) {
      return res.status(403).json({ 
        message: '❌ Compte désactivé. Contactez le super admin.' 
      });
    }

    // Vérifier le mot de passe
    const isMatch = await admin.comparerMotDePasse(motDePasse);

    if (!isMatch) {
      return res.status(401).json({ 
        message: '❌ Identifiants invalides' 
      });
    }

    // Mettre à jour la dernière connexion
    admin.derniereConnexion = new Date();
    await admin.save();

    // Générer le token JWT
    const token = jwt.sign(
      { 
        adminId: admin._id,
        role: admin.role,
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les informations (sans le mot de passe)
    res.json({
      message: '✅ Connexion réussie',
      token,
      admin: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role,
        derniereConnexion: admin.derniereConnexion
      }
    });

  } catch (error) {
    console.error('❌ Erreur login admin:', error);
    res.status(500).json({ 
      message: '❌ Erreur lors de la connexion',
      error: error.message 
    });
  }
};

// @desc    Obtenir l'admin connecté
// @route   GET /api/admin/auth/me
// @access  Private/Admin
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return res.status(404).json({ 
        message: '❌ Admin non trouvé' 
      });
    }

    res.json({
      admin: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role,
        derniereConnexion: admin.derniereConnexion,
        actif: admin.actif
      }
    });

  } catch (error) {
    console.error('❌ Erreur profil admin:', error);
    res.status(500).json({ 
      message: '❌ Erreur lors de la récupération du profil',
      error: error.message 
    });
  }
};

// @desc    Mettre à jour le profil admin
// @route   PUT /api/admin/auth/profile
// @access  Private/Admin
exports.updateAdminProfile = async (req, res) => {
  try {
    const { nom, email, ancienMotDePasse, nouveauMotDePasse } = req.body;

    const admin = await Admin.findById(req.adminId).select('+motDePasse');

    if (!admin) {
      return res.status(404).json({ 
        message: '❌ Admin non trouvé' 
      });
    }

    // Mettre à jour le nom si fourni
    if (nom) admin.nom = nom;

    // Mettre à jour l'email si fourni
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ 
          message: '❌ Cet email est déjà utilisé' 
        });
      }
      admin.email = email;
    }

    // Changer le mot de passe si fourni
    if (ancienMotDePasse && nouveauMotDePasse) {
      const isMatch = await admin.comparerMotDePasse(ancienMotDePasse);
      if (!isMatch) {
        return res.status(401).json({ 
          message: '❌ Ancien mot de passe incorrect' 
        });
      }
      admin.motDePasse = nouveauMotDePasse;
    }

    await admin.save();

    res.json({
      message: '✅ Profil mis à jour avec succès',
      admin: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil admin:', error);
    res.status(500).json({ 
      message: '❌ Erreur lors de la mise à jour du profil',
      error: error.message 
    });
  }
};

// @desc    Créer un nouvel admin (super_admin seulement)
// @route   POST /api/admin/auth/create
// @access  Private/SuperAdmin
exports.createAdmin = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;

    // Validation
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ 
        message: '❌ Tous les champs sont requis' 
      });
    }

    // Vérifier si l'email existe déjà
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: '❌ Cet email est déjà utilisé' 
      });
    }

    // Créer le nouvel admin
    const admin = await Admin.create({
      nom,
      email,
      motDePasse,
      role: role || 'admin'
    });

    res.status(201).json({
      message: '✅ Admin créé avec succès',
      admin: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('❌ Erreur création admin:', error);
    res.status(500).json({ 
      message: '❌ Erreur lors de la création de l\'admin',
      error: error.message 
    });
  }
};

// @desc    Lister tous les admins (super_admin seulement)
// @route   GET /api/admin/auth/list
// @access  Private/SuperAdmin
exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort('-createdAt');

    res.json({
      count: admins.length,
      admins: admins.map(admin => ({
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        role: admin.role,
        actif: admin.actif,
        derniereConnexion: admin.derniereConnexion,
        createdAt: admin.createdAt
      }))
    });

  } catch (error) {
    console.error('❌ Erreur liste admins:', error);
    res.status(500).json({ 
      message: '❌ Erreur lors de la récupération des admins',
      error: error.message 
    });
  }
};

// @desc    Activer/désactiver un admin (super_admin seulement)
// @route   PATCH /api/admin/auth/:id/toggle
// @access  Private/SuperAdmin
exports.toggleAdminStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ 
        message: '❌ Admin non trouvé' 
      });
    }

    // Ne pas désactiver soi-même
    if (admin._id.toString() === req.adminId.toString()) {
      return res.status(400).json({ 
        message: '❌ Vous ne pouvez pas désactiver votre propre compte' 
      });
    }

    admin.actif = !admin.actif;
    await admin.save();

    res.json({
      message: `✅ Admin ${admin.actif ? 'activé' : 'désactivé'} avec succès`,
      admin: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email,
        actif: admin.actif
      }
    });

  } catch (error) {
    console.error('❌ Erreur toggle admin:', error);
    res.status(500).json({ 
      message: '❌ Erreur lors de la modification du statut',
      error: error.message 
    });
  }
};
