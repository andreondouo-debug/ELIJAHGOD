const Materiel = require('../models/Materiel');
const Prestataire = require('../models/Prestataire');

/**
 * ➕ AJOUTER DU MATÉRIEL (prestataire)
 */
exports.ajouter = async (req, res) => {
  try {
    const prestataireId = req.prestataireId;
    const materielData = req.body;

    // Vérifier que le prestataire existe
    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: '❌ Prestataire introuvable'
      });
    }

    // Créer le matériel
    const materiel = new Materiel({
      ...materielData,
      prestataire: prestataireId
    });

    await materiel.save();

    res.status(201).json({
      success: true,
      message: '✅ Matériel ajouté avec succès',
      data: materiel
    });

  } catch (error) {
    console.error('❌ Erreur ajout matériel:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'ajout du matériel'
    });
  }
};

/**
 * 📋 LISTE DU MATÉRIEL (public ou prestataire)
 */
exports.lister = async (req, res) => {
  try {
    const { categorie, prestataireId, disponible, search, limit = 20, page = 1 } = req.query;

    // Construire le filtre
    const filtre = {};

    if (categorie) {
      filtre.categorie = categorie;
    }

    if (prestataireId) {
      filtre.prestataire = prestataireId;
    }

    if (disponible === 'true') {
      filtre.isActive = true;
      filtre.quantiteDisponible = { $gt: 0 };
    }

    if (search) {
      filtre.$text = { $search: search };
    }

    // Si c'est un prestataire qui fait la requête, montrer uniquement son matériel
    if (req.prestataireId && !prestataireId) {
      filtre.prestataire = req.prestataireId;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Récupérer le matériel
    const materiels = await Materiel.find(filtre)
      .populate('prestataire', 'nomEntreprise logo noteGlobale')
      .sort({ miseEnAvant: -1, dateAjout: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Materiel.countDocuments(filtre);

    res.json({
      success: true,
      data: materiels,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur liste matériel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du matériel'
    });
  }
};

/**
 * 📖 DÉTAILS D'UN MATÉRIEL
 */
exports.details = async (req, res) => {
  try {
    const { id } = req.params;

    const materiel = await Materiel.findById(id)
      .populate('prestataire', 'nomEntreprise logo noteGlobale telephone email');

    if (!materiel) {
      return res.status(404).json({
        success: false,
        message: '❌ Matériel introuvable'
      });
    }

    // Incrémenter les vues
    await materiel.incrementerVues();

    res.json({
      success: true,
      data: materiel
    });

  } catch (error) {
    console.error('❌ Erreur détails matériel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du matériel'
    });
  }
};

/**
 * ✏️ MODIFIER DU MATÉRIEL (prestataire)
 */
exports.modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const prestataireId = req.prestataireId;
    const updates = req.body;

    // Vérifier que le matériel appartient au prestataire
    const materiel = await Materiel.findOne({ _id: id, prestataire: prestataireId });
    if (!materiel) {
      return res.status(404).json({
        success: false,
        message: '❌ Matériel introuvable ou non autorisé'
      });
    }

    // Ne pas permettre de changer le prestataire
    delete updates.prestataire;
    delete updates.stats;

    Object.assign(materiel, updates);
    materiel.derniereMiseAJour = new Date();
    await materiel.save();

    res.json({
      success: true,
      message: '✅ Matériel mis à jour',
      data: materiel
    });

  } catch (error) {
    console.error('❌ Erreur modification matériel:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la modification'
    });
  }
};

/**
 * 🗑️ SUPPRIMER DU MATÉRIEL (prestataire)
 */
exports.supprimer = async (req, res) => {
  try {
    const { id } = req.params;
    const prestataireId = req.prestataireId;

    const materiel = await Materiel.findOneAndDelete({ 
      _id: id, 
      prestataire: prestataireId 
    });

    if (!materiel) {
      return res.status(404).json({
        success: false,
        message: '❌ Matériel introuvable ou non autorisé'
      });
    }

    res.json({
      success: true,
      message: '✅ Matériel supprimé'
    });

  } catch (error) {
    console.error('❌ Erreur suppression matériel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

/**
 * ✅ VÉRIFIER LA DISPONIBILITÉ
 */
exports.verifierDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateDebut, dateFin, quantite = 1 } = req.query;

    if (!dateDebut || !dateFin) {
      return res.status(400).json({
        success: false,
        message: '❌ Dates de début et de fin requises'
      });
    }

    const materiel = await Materiel.findById(id);
    if (!materiel) {
      return res.status(404).json({
        success: false,
        message: '❌ Matériel introuvable'
      });
    }

    const dispo = materiel.verifierDisponibilite(dateDebut, dateFin, parseInt(quantite));
    const prix = materiel.calculerPrix(dateDebut, dateFin);

    res.json({
      success: true,
      data: {
        ...dispo,
        ...prix
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification disponibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
};

/**
 * 📅 RÉSERVER DU MATÉRIEL
 */
exports.reserver = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateDebut, dateFin, quantite, client } = req.body;

    if (!dateDebut || !dateFin || !quantite || !client) {
      return res.status(400).json({
        success: false,
        message: '❌ Toutes les informations sont requises'
      });
    }

    const materiel = await Materiel.findById(id);
    if (!materiel) {
      return res.status(404).json({
        success: false,
        message: '❌ Matériel introuvable'
      });
    }

    if (!materiel.isActive) {
      return res.status(400).json({
        success: false,
        message: '❌ Ce matériel n\'est plus disponible'
      });
    }

    const reservation = await materiel.reserver({
      dateDebut,
      dateFin,
      quantite: parseInt(quantite),
      client
    });

    const prix = materiel.calculerPrix(dateDebut, dateFin);

    res.status(201).json({
      success: true,
      message: '✅ Réservation créée',
      data: {
        reservation,
        prix
      }
    });

  } catch (error) {
    console.error('❌ Erreur réservation matériel:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la réservation'
    });
  }
};

/**
 * 📂 LISTE DES CATÉGORIES DE MATÉRIEL
 */
exports.categories = async (req, res) => {
  try {
    const categories = [
      'Sonorisation',
      'Éclairage',
      'Effets spéciaux',
      'Machines à fumée',
      'Jets d\'artifice',
      'DJ equipment',
      'Vidéo projecteur',
      'Écran LED',
      'Structure/Scène',
      'Décoration',
      'Mobilier',
      'Autre'
    ];

    // Compter le nombre de matériels par catégorie
    const counts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Materiel.countDocuments({ 
          categorie: cat, 
          isActive: true,
          quantiteDisponible: { $gt: 0 }
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
