const Prestataire = require('../models/Prestataire');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

/**
 * 🔐 INSCRIPTION PRESTATAIRE
 */
exports.inscription = async (req, res) => {
  try {
    const {
      email,
      password,
      nomEntreprise,
      categorie,
      telephone,
      description
    } = req.body;

    // Vérifier si l'email existe déjà
    const existant = await Prestataire.findOne({ email });
    if (existant) {
      return res.status(400).json({
        success: false,
        message: '❌ Cet email est déjà utilisé'
      });
    }

    // Créer le prestataire
    const prestataire = new Prestataire({
      email,
      password,
      nomEntreprise,
      categorie,
      telephone,
      description
    });

    await prestataire.save();

    // Générer un token JWT
    const token = jwt.sign(
      { 
        prestataireId: prestataire._id,
        type: 'prestataire',
        categorie: prestataire.categorie 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: '✅ Inscription réussie ! Votre compte sera vérifié par l\'administrateur.',
      data: {
        prestataire: prestataire.getProfilPublic(),
        token
      }
    });

  } catch (error) {
    console.error('❌ Erreur inscription prestataire:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'inscription'
    });
  }
};

/**
 * 🔑 CONNEXION PRESTATAIRE
 */
exports.connexion = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier les champs requis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '❌ Email et mot de passe requis'
      });
    }

    // Trouver le prestataire
    const prestataire = await Prestataire.findOne({ email });
    if (!prestataire) {
      return res.status(401).json({
        success: false,
        message: '❌ Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const passwordValide = await prestataire.comparePassword(password);
    if (!passwordValide) {
      return res.status(401).json({
        success: false,
        message: '❌ Identifiants invalides'
      });
    }

    // Vérifier si le compte est actif
    if (!prestataire.isActive) {
      return res.status(403).json({
        success: false,
        message: '❌ Votre compte a été désactivé. Contactez l\'administrateur.'
      });
    }

    // Mettre à jour la dernière connexion
    prestataire.derniereConnexion = new Date();
    await prestataire.save();

    // Générer un token JWT
    const token = jwt.sign(
      { 
        prestataireId: prestataire._id,
        type: 'prestataire',
        categorie: prestataire.categorie 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: '✅ Connexion réussie',
      data: {
        prestataire: prestataire.getProfilPublic(),
        token,
        isVerified: prestataire.isVerified
      }
    });

  } catch (error) {
    console.error('❌ Erreur connexion prestataire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
};

/**
 * 📋 LISTE DES PRESTATAIRES (publique)
 */
exports.lister = async (req, res) => {
  try {
    const { categorie, ville, noteMin, verified, limit = 20, page = 1 } = req.query;

    // Construire le filtre
    const filtre = { isActive: true };

    if (categorie) {
      filtre.categorie = categorie;
    }

    if (ville) {
      filtre['adresse.ville'] = new RegExp(ville, 'i');
    }

    if (noteMin) {
      filtre.noteGlobale = { $gte: parseFloat(noteMin) };
    }

    if (verified === 'true') {
      filtre.isVerified = true;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Récupérer les prestataires
    const prestataires = await Prestataire.find(filtre)
      .sort({ noteGlobale: -1, nombreAvis: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password -documents -stats.chiffreAffaires');

    const total = await Prestataire.countDocuments(filtre);

    res.json({
      success: true,
      data: prestataires.map(p => p.getProfilPublic()),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur liste prestataires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des prestataires'
    });
  }
};

/**
 * 📖 PROFIL PUBLIC D'UN PRESTATAIRE
 */
exports.voirProfil = async (req, res) => {
  try {
    const { id } = req.params;

    const prestataire = await Prestataire.findById(id);
    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: '❌ Prestataire introuvable'
      });
    }

    // Incrémenter les vues
    await prestataire.incrementerVues();

    res.json({
      success: true,
      data: prestataire.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur profil prestataire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

/**
 * 👤 MON PROFIL (prestataire connecté)
 */
exports.monProfil = async (req, res) => {
  try {
    const prestataire = await Prestataire.findById(req.prestataireId);
    if (!prestataire) {
      return res.status(404).json({ success: false, message: '❌ Prestataire introuvable' });
    }
    res.json({ success: true, prestataire: prestataire.getProfilPublic() });
  } catch (error) {
    console.error('❌ Erreur monProfil:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du profil' });
  }
};

/**
 * ✏️ METTRE À JOUR SON PROFIL
 */
exports.mettreAJourProfil = async (req, res) => {
  try {
    const prestataireId = req.prestataireId; // Depuis le middleware auth
    const updates = req.body;

    // Champs non modifiables
    delete updates.email;
    delete updates.password;
    delete updates.isVerified;
    delete updates.plan;
    delete updates.commission;
    delete updates.stats;
    delete updates.dateInscription;

    const prestataire = await Prestataire.findByIdAndUpdate(
      prestataireId,
      { ...updates, derniereMiseAJour: new Date() },
      { new: true, runValidators: true }
    );

    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: '❌ Prestataire introuvable'
      });
    }

    res.json({
      success: true,
      message: '✅ Profil mis à jour',
      data: prestataire.getProfilPublic()
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour'
    });
  }
};

/**
 * ⭐ AJOUTER UN AVIS
 */
exports.ajouterAvis = async (req, res) => {
  try {
    const { id } = req.params;
    const { client, note, commentaire, dateEvenement, typeEvenement } = req.body;

    if (!note || note < 1 || note > 5) {
      return res.status(400).json({
        success: false,
        message: '❌ La note doit être entre 1 et 5'
      });
    }

    const prestataire = await Prestataire.findById(id);
    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: '❌ Prestataire introuvable'
      });
    }

    await prestataire.ajouterAvis({
      client,
      note,
      commentaire,
      dateEvenement,
      typeEvenement
    });

    res.json({
      success: true,
      message: '✅ Avis ajouté',
      data: {
        noteGlobale: prestataire.noteGlobale,
        nombreAvis: prestataire.nombreAvis
      }
    });

  } catch (error) {
    console.error('❌ Erreur ajout avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'avis'
    });
  }
};

/**
 * 📊 STATISTIQUES DU PRESTATAIRE
 */
exports.statistiques = async (req, res) => {
  try {
    const prestataireId = req.prestataireId;

    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: '❌ Prestataire introuvable'
      });
    }

    res.json({
      success: true,
      data: prestataire.stats
    });

  } catch (error) {
    console.error('❌ Erreur stats prestataire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * 📅 GÉRER LA DISPONIBILITÉ
 */
exports.gererDisponibilite = async (req, res) => {
  try {
    const prestataireId = req.prestataireId;
    const { action, date, dates } = req.body;

    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: '❌ Prestataire introuvable'
      });
    }

    if (action === 'bloquer') {
      if (dates && Array.isArray(dates)) {
        // Bloquer plusieurs dates
        dates.forEach(d => {
          const dateObj = new Date(d);
          if (!prestataire.disponibilite.calendrier.includes(dateObj)) {
            prestataire.disponibilite.calendrier.push(dateObj);
          }
        });
      } else if (date) {
        // Bloquer une seule date
        await prestataire.bloquerDate(new Date(date));
      }
    } else if (action === 'debloquer') {
      prestataire.disponibilite.calendrier = prestataire.disponibilite.calendrier.filter(
        d => d.toISOString().split('T')[0] !== new Date(date).toISOString().split('T')[0]
      );
    }

    await prestataire.save();

    res.json({
      success: true,
      message: '✅ Disponibilité mise à jour',
      data: {
        calendrier: prestataire.disponibilite.calendrier
      }
    });

  } catch (error) {
    console.error('❌ Erreur gestion disponibilité:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour'
    });
  }
};

/**
 * 📂 LISTE DES CATÉGORIES DE PRESTATAIRES
 */
exports.categories = async (req, res) => {
  try {
    // Lire les catégories depuis Settings (paramétrables par l'admin)
    const settings = await Settings.getSettings();
    const categories = settings.categoriesPrestataires || [
      'DJ', 'Photographe', 'Vidéaste', 'Animateur', 'Groupe de louange',
      'Wedding planner', 'Traiteur', 'Sonorisation', 'Éclairage',
      'Décoration', 'Location matériel', 'Autre'
    ];

    // Compter le nombre de prestataires par catégorie
    const counts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Prestataire.countDocuments({ 
          categorie: cat, 
          isActive: true 
        });
        return { categorie: cat, nombre: count };
      })
    );

    res.json({
      success: true,
      data: counts.filter(c => c.nombre > 0)
    });

  } catch (error) {
    console.error('❌ Erreur catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories'
    });
  }
};

/**
 * 🆕 RÉCUPÉRER PLUSIEURS PRESTATAIRES PAR IDS
 * Utilisé pour charger les détails des prestataires associés à une prestation
 */
exports.getBatch = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '❌ IDs requis (tableau)'
      });
    }

    // Limiter à 50 prestataires max par requête
    if (ids.length > 50) {
      return res.status(400).json({
        success: false,
        message: '❌ Maximum 50 prestataires par requête'
      });
    }

    const prestataires = await Prestataire.find({ 
      _id: { $in: ids },
      isActive: true 
    }).select('-password -__v');

    res.json({
      success: true,
      count: prestataires.length,
      data: prestataires
    });

  } catch (error) {
    console.error('❌ Erreur getBatch prestataires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des prestataires'
    });
  }
};

/**
 * �️ SUPPRIMER UN PRESTATAIRE (Admin)
 * @route DELETE /api/prestataires/admin/:id
 */
exports.supprimerPrestataire = async (req, res) => {
  try {
    const prestataire = await Prestataire.findById(req.params.id);
    if (!prestataire) {
      return res.status(404).json({ success: false, message: '❌ Prestataire introuvable' });
    }
    await Prestataire.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '✅ Prestataire supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression prestataire:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression' });
  }
};

/**
 * ✏️ MODIFIER UN PRESTATAIRE (Admin)
 * @route PUT /api/prestataires/admin/:id
 */
exports.modifierPrestataire = async (req, res) => {
  try {
    const champs = req.body;
    // Empêcher la modification du mot de passe par cette route
    delete champs.password;

    const prestataire = await Prestataire.findByIdAndUpdate(
      req.params.id,
      { $set: { ...champs, derniereMiseAJour: new Date() } },
      { new: true, runValidators: true }
    );

    if (!prestataire) {
      return res.status(404).json({ success: false, message: '❌ Prestataire introuvable' });
    }

    res.json({ success: true, message: '✅ Prestataire mis à jour', data: prestataire.getProfilPublic() });
  } catch (error) {
    console.error('❌ Erreur modification prestataire:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de la modification' });
  }
};

/**
 * 📋 LISTER TOUS LES PRESTATAIRES (Admin — y compris inactifs)
 * @route GET /api/prestataires/admin/tous
 */
exports.listerTousAdmin = async (req, res) => {
  try {
    const prestataires = await Prestataire.find({})
      .select('-password -__v')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: prestataires.length, data: prestataires });
  } catch (error) {
    console.error('❌ Erreur liste admin prestataires:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
};

/**
 * ✅ TOGGLE VÉRIFICATION PRESTATAIRE (Admin)
 * @route PATCH /api/prestataires/admin/:id/toggle-verified
 */
exports.toggleVerified = async (req, res) => {
  try {
    const prestataire = await Prestataire.findById(req.params.id);
    if (!prestataire) {
      return res.status(404).json({ success: false, message: '❌ Prestataire introuvable' });
    }
    prestataire.isVerified = !prestataire.isVerified;
    await prestataire.save();
    res.json({
      success: true,
      message: prestataire.isVerified ? '✅ Compte vérifié avec succès' : '⚠️ Vérification retirée',
      isVerified: prestataire.isVerified
    });
  } catch (error) {
    console.error('❌ Erreur toggle verified:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
};

/**
 * ⭐ MES AVIS (prestataire connecté)
 * @route GET /api/prestataires/me/avis
 */
exports.mesAvis = async (req, res) => {
  try {
    const prestataire = await Prestataire.findById(req.prestataireId)
      .select('avis noteGlobale nombreAvis nomEntreprise');
    if (!prestataire) {
      return res.status(404).json({ success: false, message: '❌ Prestataire introuvable' });
    }
    const avis = (prestataire.avis || []).sort((a, b) => new Date(b.dateAvis) - new Date(a.dateAvis));
    res.json({
      success: true,
      data: {
        avis,
        noteGlobale: prestataire.noteGlobale,
        nombreAvis: prestataire.nombreAvis
      }
    });
  } catch (error) {
    console.error('❌ Erreur mes avis:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des avis' });
  }
};

/**
 * �📤 UPLOAD MÉDIAS (images / vidéos) pour le profil prestataire
 * Attend des fichiers multipart sous le champ 'mediaFiles'
 */
exports.uploadMedia = async (req, res) => {
  try {
    const prestataireId = req.prestataireId;
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ success: false, message: '❌ Aucun fichier envoyé' });
    }

    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({ success: false, message: '❌ Prestataire introuvable' });
    }

    // Traitement des fichiers : images -> photos[], vidéos -> video (seule la première vidéo est conservée)
    for (const f of files) {
      const relativeUrl = `/uploads/prestataires/${f.filename}`;
      if (f.mimetype && f.mimetype.startsWith('image/')) {
        prestataire.photos.push({ url: relativeUrl, publicId: f.filename });
      } else if (f.mimetype && f.mimetype.startsWith('video/')) {
        // Remplacer la vidéo de présentation si existante
        prestataire.video = relativeUrl;
      }
    }

    prestataire.derniereMiseAJour = new Date();
    await prestataire.save();

    res.json({ success: true, message: '✅ Médias ajoutés au profil', data: prestataire.getProfilPublic() });

  } catch (error) {
    console.error('❌ Erreur uploadMedia prestataire:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de l\'upload des médias' });
  }
};
