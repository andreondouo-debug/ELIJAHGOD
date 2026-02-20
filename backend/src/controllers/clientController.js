const Client = require('../models/Client');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // À créer

/**
 * 🔐 CONTRÔLEUR CLIENT
 * Gestion de l'authentification et du profil client
 */

// ============================================
// 1. INSCRIPTION CLIENT
// ============================================
exports.inscription = async (req, res) => {
  try {
    const { prenom, nom, email, password, telephone, adresse, entreprise } = req.body;

    // Vérifier si l'email existe déjà
    const clientExiste = await Client.findOne({ email: email.toLowerCase() });
    if (clientExiste) {
      return res.status(400).json({
        success: false,
        message: '❌ Cet email est déjà utilisé'
      });
    }

    // Créer le client
    const client = new Client({
      prenom,
      nom,
      email: email.toLowerCase(),
      password,
      telephone,
      adresse,
      entreprise
    });

    await client.save();

    // Générer le token de vérification email
    const verificationToken = await client.generateEmailVerificationToken();
    await client.save();

    // Envoyer l'email de vérification
    const urlVerification = `${process.env.FRONTEND_URL}/client/verifier-email/${verificationToken}`;
    
    try {
      await sendEmail({
        to: client.email,
        subject: '✅ Vérifiez votre adresse email',
        html: `
          <h2>Bienvenue ${client.prenom}!</h2>
          <p>Merci d'avoir créé votre compte. Veuillez vérifier votre email en cliquant sur le lien ci-dessous:</p>
          <a href="${urlVerification}" style="display:inline-block;padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;">
            Vérifier mon email
          </a>
          <p><small>Ce lien expire dans 24 heures</small></p>
        `
      });
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    // Générer le JWT
    const token = jwt.sign(
      {
        clientId: client._id,
        type: 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: '✅ Inscription réussie! Vérifiez votre email.',
      token,
      client: client.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur inscription client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// ============================================
// 2. CONNEXION CLIENT
// ============================================
exports.connexion = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '❌ Email et mot de passe requis'
      });
    }

    // Trouver le client
    const client = await Client.findOne({ email: email.toLowerCase() });
    if (!client) {
      return res.status(401).json({
        success: false,
        message: '❌ Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const passwordValide = await client.comparePassword(password);
    if (!passwordValide) {
      return res.status(401).json({
        success: false,
        message: '❌ Email ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    client.derniereConnexion = new Date();
    await client.save();

    // Générer le JWT
    const token = jwt.sign(
      {
        clientId: client._id,
        type: 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: `🎉 Bienvenue ${client.prenom}!`,
      token,
      client: client.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur connexion client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// ============================================
// 3. VÉRIFIER EMAIL
// ============================================
exports.verifierEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hasher le token reçu
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Trouver le client avec ce token non expiré
    const client = await Client.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!client) {
      return res.status(400).json({
        success: false,
        message: '❌ Token invalide ou expiré'
      });
    }

    // Marquer l'email comme vérifié
    client.isEmailVerified = true;
    client.emailVerificationToken = undefined;
    client.emailVerificationExpires = undefined;
    await client.save();

    res.json({
      success: true,
      message: '✅ Email vérifié avec succès!'
    });

  } catch (error) {
    console.error('❌ Erreur vérification email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
};

// ============================================
// 4. DEMANDER RESET MOT DE PASSE
// ============================================
exports.demanderResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const client = await Client.findOne({ email: email.toLowerCase() });
    if (!client) {
      // Ne pas révéler si l'email existe ou non
      return res.json({
        success: true,
        message: '📧 Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    // Générer le token
    const resetToken = await client.generatePasswordResetToken();
    await client.save();

    // Envoyer l'email
    const urlReset = `${process.env.FRONTEND_URL}/client/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        to: client.email,
        subject: '🔑 Réinitialisation de votre mot de passe',
        html: `
          <h2>Réinitialisation de mot de passe</h2>
          <p>Bonjour ${client.prenom},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous:</p>
          <a href="${urlReset}" style="display:inline-block;padding:10px 20px;background:#dc3545;color:white;text-decoration:none;border-radius:5px;">
            Réinitialiser mon mot de passe
          </a>
          <p><small>Ce lien expire dans 1 heure</small></p>
          <p><small>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</small></p>
        `
      });
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    res.json({
      success: true,
      message: '📧 Email de réinitialisation envoyé'
    });

  } catch (error) {
    console.error('❌ Erreur demande reset:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande',
      error: error.message
    });
  }
};

// ============================================
// 5. RÉINITIALISER MOT DE PASSE
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '❌ Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Hasher le token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Trouver le client
    const client = await Client.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!client) {
      return res.status(400).json({
        success: false,
        message: '❌ Token invalide ou expiré'
      });
    }

    // Mettre à jour le mot de passe
    client.password = password; // Sera hashé par le pre-save hook
    client.passwordResetToken = undefined;
    client.passwordResetExpires = undefined;
    await client.save();

    res.json({
      success: true,
      message: '✅ Mot de passe réinitialisé avec succès!'
    });

  } catch (error) {
    console.error('❌ Erreur reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation',
      error: error.message
    });
  }
};

// ============================================
// 6. OBTENIR PROFIL (Protégé)
// ============================================
exports.obtenirProfil = async (req, res) => {
  try {
    const client = await Client.findById(req.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: '❌ Client non trouvé'
      });
    }

    res.json({
      success: true,
      client: client.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur obtenir profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// ============================================
// 7. METTRE À JOUR PROFIL (Protégé)
// ============================================
exports.mettreAJourProfil = async (req, res) => {
  try {
    const champsModifiables = [
      'prenom',
      'nom',
      'telephone',
      'adresse',
      'entreprise',
      'photo',
      'preferences'
    ];

    const updates = {};
    for (const champ of champsModifiables) {
      if (req.body[champ] !== undefined) {
        updates[champ] = req.body[champ];
      }
    }

    const client = await Client.findByIdAndUpdate(
      req.clientId,
      updates,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: '❌ Client non trouvé'
      });
    }

    res.json({
      success: true,
      message: '✅ Profil mis à jour',
      client: client.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// ============================================
// 8. CHANGER MOT DE PASSE (Protégé)
// ============================================
exports.changerMotDePasse = async (req, res) => {
  try {
    const { ancienPassword, nouveauPassword } = req.body;

    if (!ancienPassword || !nouveauPassword) {
      return res.status(400).json({
        success: false,
        message: '❌ Ancien et nouveau mot de passe requis'
      });
    }

    if (nouveauPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '❌ Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    const client = await Client.findById(req.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: '❌ Client non trouvé'
      });
    }

    // Vérifier l'ancien mot de passe
    const passwordValide = await client.comparePassword(ancienPassword);
    if (!passwordValide) {
      return res.status(401).json({
        success: false,
        message: '❌ Ancien mot de passe incorrect'
      });
    }

    // Mettre à jour
    client.password = nouveauPassword;
    await client.save();

    res.json({
      success: true,
      message: '✅ Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    });
  }
};

// ============================================
// 9. OBTENIR STATISTIQUES (Protégé)
// ============================================
exports.obtenirStatistiques = async (req, res) => {
  try {
    const client = await Client.findById(req.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: '❌ Client non trouvé'
      });
    }

    res.json({
      success: true,
      stats: {
        nombreDevis: client.nombreDevis,
        nombreReservations: client.nombreReservations,
        totalDepense: client.totalDepense,
        dateInscription: client.createdAt,
        derniereConnexion: client.derniereConnexion
      }
    });

  } catch (error) {
    console.error('❌ Erreur stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};
