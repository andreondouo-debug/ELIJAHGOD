const Temoignage = require('../models/Temoignage');
const Client = require('../models/Client');
const Devis = require('../models/Devis');

/**
 * 💬 CONTRÔLEUR TÉMOIGNAGES
 */

/**
 * Créer un témoignage (client authentifié)
 * POST /api/temoignages
 */
exports.creerTemoignage = async (req, res) => {
  try {
    const {
      titre,
      contenu,
      note,
      devisId,
      prestationsCommentees,
      materielsCommentes
    } = req.body;

    // Validation
    if (!contenu || !note) {
      return res.status(400).json({
        message: 'Le contenu et la note sont requis'
      });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({
        message: 'La note doit être entre 1 et 5'
      });
    }

    // Charger le client
    const client = await Client.findById(req.clientId);

    // Préparer les données du témoignage
    const temoignageData = {
      auteur: {
        client: req.clientId,
        nom: client.getNomComplet(),
        entreprise: client.entreprise,
        photo: client.photo
      },
      type: 'avis_client',
      titre,
      contenu,
      note,
      prestationsCommentees,
      materielsCommentes,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    // Ajouter infos événement si devisId fourni
    if (devisId) {
      const devis = await Devis.findOne({ _id: devisId, clientId: req.clientId });
      if (devis) {
        temoignageData.evenement = {
          devis: devisId,
          type: devis.evenement.type,
          date: devis.evenement.date
        };
      }
    }

    const temoignage = await Temoignage.create(temoignageData);

    res.status(201).json({
      message: '✅ Témoignage créé avec succès. Il sera visible après modération.',
      temoignage
    });

  } catch (error) {
    console.error('❌ Erreur création témoignage:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du témoignage'
    });
  }
};

/**
 * Créer un témoignage externe (sans authentification)
 * POST /api/temoignages/externe
 */
exports.creerTemoignageExterne = async (req, res) => {
  try {
    const {
      nom,
      entreprise,
      email,
      titre,
      contenu,
      note
    } = req.body;

    // Validation
    if (!nom || !email || !contenu || !note) {
      return res.status(400).json({
        message: 'Nom, email, contenu et note sont requis'
      });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({
        message: 'La note doit être entre 1 et 5'
      });
    }

    const temoignage = await Temoignage.create({
      auteur: {
        nom,
        entreprise
      },
      type: 'temoignage_externe',
      titre,
      contenu,
      note,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: '✅ Témoignage soumis avec succès. Il sera visible après validation.',
      temoignage
    });

  } catch (error) {
    console.error('❌ Erreur création témoignage externe:', error);
    res.status(500).json({
      message: 'Erreur lors de la soumission du témoignage'
    });
  }
};

/**
 * Lister les témoignages publics
 * GET /api/temoignages
 */
exports.listerTemoignages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      note,
      featured
    } = req.query;

    const query = {
      isVisible: true,
      statut: 'approuve'
    };

    if (note) {
      query.note = parseInt(note);
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const skip = (page - 1) * limit;

    const [temoignages, total, stats] = await Promise.all([
      Temoignage.find(query)
        .populate('auteur.client', 'prenom nom photo')
        .populate('evenement.devis', 'evenement.type')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Temoignage.countDocuments(query),
      Temoignage.getStatistiques()
    ]);

    res.json({
      temoignages,
      statistiques: stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur listage témoignages:', error);
    res.status(500).json({
      message: 'Erreur lors du chargement des témoignages'
    });
  }
};

/**
 * Lister les témoignages en attente de modération (admin/valideur)
 * GET /api/temoignages/moderation
 */
exports.temoignagesEnAttente = async (req, res) => {
  try {
    const temoignages = await Temoignage.find({ statut: 'en_attente' })
      .populate('auteur.client', 'prenom nom email photo')
      .populate('evenement.devis', 'numeroDevis evenement')
      .sort('-createdAt');

    res.json({
      temoignages,
      total: temoignages.length
    });

  } catch (error) {
    console.error('❌ Erreur listage modération:', error);
    res.status(500).json({
      message: 'Erreur lors du chargement des témoignages'
    });
  }
};

/**
 * Approuver un témoignage (admin/valideur)
 * PUT /api/temoignages/:id/approuver
 */
exports.approuverTemoignage = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const temoignage = await Temoignage.findById(id);

    if (!temoignage) {
      return res.status(404).json({
        message: 'Témoignage non trouvé'
      });
    }

    await temoignage.approuver(req.clientId);

    if (isFeatured) {
      temoignage.isFeatured = true;
      await temoignage.save();
    }

    res.json({
      message: '✅ Témoignage approuvé',
      temoignage
    });

  } catch (error) {
    console.error('❌ Erreur approbation:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'approbation'
    });
  }
};

/**
 * Refuser un témoignage (admin/valideur)
 * PUT /api/temoignages/:id/refuser
 */
exports.refuserTemoignage = async (req, res) => {
  try {
    const { id } = req.params;
    const { raison } = req.body;

    const temoignage = await Temoignage.findById(id);

    if (!temoignage) {
      return res.status(404).json({
        message: 'Témoignage non trouvé'
      });
    }

    await temoignage.refuser(req.clientId, raison);

    res.json({
      message: '✅ Témoignage refusé',
      temoignage
    });

  } catch (error) {
    console.error('❌ Erreur refus:', error);
    res.status(500).json({
      message: 'Erreur lors du refus'
    });
  }
};

/**
 * Répondre à un témoignage (admin)
 * POST /api/temoignages/:id/repondre
 */
exports.repondreTemoignage = async (req, res) => {
  try {
    const { id } = req.params;
    const { texte } = req.body;

    if (!texte) {
      return res.status(400).json({
        message: 'Le texte de la réponse est requis'
      });
    }

    const temoignage = await Temoignage.findById(id);

    if (!temoignage) {
      return res.status(404).json({
        message: 'Témoignage non trouvé'
      });
    }

    await temoignage.ajouterReponse(req.clientId, texte);

    res.json({
      message: '✅ Réponse ajoutée',
      temoignage
    });

  } catch (error) {
    console.error('❌ Erreur réponse:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'ajout de la réponse'
    });
  }
};

/**
 * Marquer un témoignage comme utile
 * POST /api/temoignages/:id/utile
 */
exports.marquerUtile = async (req, res) => {
  try {
    const { id } = req.params;

    const temoignage = await Temoignage.findById(id);

    if (!temoignage) {
      return res.status(404).json({
        message: 'Témoignage non trouvé'
      });
    }

    if (!temoignage.isVisible) {
      return res.status(403).json({
        message: 'Ce témoignage n\'est pas visible'
      });
    }

    await temoignage.marquerUtile(req.clientId);

    res.json({
      message: '✅ Témoignage marqué comme utile',
      likes: temoignage.likes
    });

  } catch (error) {
    console.error('❌ Erreur marquer utile:', error);
    res.status(500).json({
      message: 'Erreur lors du marquage'
    });
  }
};

/**
 * Supprimer un témoignage (admin)
 * DELETE /api/temoignages/:id
 */
exports.supprimerTemoignage = async (req, res) => {
  try {
    const { id } = req.params;

    const temoignage = await Temoignage.findByIdAndDelete(id);

    if (!temoignage) {
      return res.status(404).json({
        message: 'Témoignage non trouvé'
      });
    }

    res.json({
      message: '✅ Témoignage supprimé'
    });

  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    res.status(500).json({
      message: 'Erreur lors de la suppression'
    });
  }
};
