const Prestation = require('../models/Prestation');
const path = require('path');

/**
 * 📦 CONTROLLER PRESTATIONS
 * Gestion des prestations (services proposés)
 */

// @desc    Obtenir toutes les prestations
// @route   GET /api/prestations
// @access  Public
exports.getPrestations = async (req, res) => {
  try {
    const { categorie, disponible } = req.query;
    
    let filtre = {};
    if (categorie) filtre.categorie = categorie;
    if (disponible !== undefined) filtre.disponible = disponible === 'true';
    
    const prestations = await Prestation.find(filtre).sort('ordre nom');
    
    res.json({
      success: true,
      count: prestations.length,
      data: prestations
    });
  } catch (error) {
    console.error('❌ Erreur getPrestations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des prestations'
    });
  }
};

// @desc    Obtenir une prestation par ID
// @route   GET /api/prestations/:id
// @access  Public
exports.getPrestationById = async (req, res) => {
  try {
    const prestation = await Prestation.findById(req.params.id);
    
    if (!prestation) {
      return res.status(404).json({
        success: false,
        message: 'Prestation non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: prestation
    });
  } catch (error) {
    console.error('❌ Erreur getPrestationById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la prestation'
    });
  }
};

// @desc    Obtenir les catégories disponibles
// @route   GET /api/prestations/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Prestation.distinct('categorie');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('❌ Erreur getCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories'
    });
  }
};

// @desc    Créer une prestation (Admin)
// @route   POST /api/prestations
// @access  Private/Admin
exports.createPrestation = async (req, res) => {
  try {
    const prestation = await Prestation.create(req.body);
    
    res.status(201).json({
      success: true,
      message: '✅ Prestation créée avec succès',
      data: prestation
    });
  } catch (error) {
    console.error('❌ Erreur createPrestation:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de la prestation',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une prestation (Admin)
// @route   PUT /api/prestations/:id
// @access  Private/Admin
exports.updatePrestation = async (req, res) => {
  try {
    const prestation = await Prestation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!prestation) {
      return res.status(404).json({
        success: false,
        message: 'Prestation non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: '✅ Prestation mise à jour',
      data: prestation
    });
  } catch (error) {
    console.error('❌ Erreur updatePrestation:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Supprimer une prestation (Admin)
// @route   DELETE /api/prestations/:id
// @access  Private/Admin
exports.deletePrestation = async (req, res) => {
  try {
    const prestation = await Prestation.findByIdAndDelete(req.params.id);
    
    if (!prestation) {
      return res.status(404).json({
        success: false,
        message: 'Prestation non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: '✅ Prestation supprimée'
    });
  } catch (error) {
    console.error('❌ Erreur deletePrestation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

// @desc    Calculer le prix avec options
// @route   POST /api/prestations/:id/calculer-prix
// @access  Public
exports.calculerPrix = async (req, res) => {
  try {
    const prestation = await Prestation.findById(req.params.id);
    
    if (!prestation) {
      return res.status(404).json({
        success: false,
        message: 'Prestation non trouvée'
      });
    }
    
    const prix = prestation.calculerPrix(req.body.options);
    
    res.json({
      success: true,
      data: {
        prestationId: prestation._id,
        nom: prestation.nom,
        prixBase: prestation.prixBase,
        options: req.body.options,
        prixCalcule: prix
      }
    });
  } catch (error) {
    console.error('❌ Erreur calculerPrix:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du prix'
    });
  }
};

// @desc    Upload image pour une prestation (Admin)
// @route   POST /api/prestations/:id/upload-image
// @access  Private/Admin
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '❌ Aucun fichier fourni'
      });
    }
    
    const prestation = await Prestation.findById(req.params.id);
    
    if (!prestation) {
      return res.status(404).json({
        success: false,
        message: 'Prestation non trouvée'
      });
    }
    
    // Construction de l'URL de l'image (servie par Express)
    const imageUrl = `/uploads/prestations/${req.file.filename}`;
    
    // Ajouter à la galerie
    if (!prestation.galerie) {
      prestation.galerie = [];
    }
    
    prestation.galerie.push({
      url: imageUrl,
      type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
      description: req.body.description || '',
      ordre: prestation.galerie.length,
      miniature: imageUrl
    });
    
    await prestation.save();
    
    res.status(201).json({
      success: true,
      message: '✅ Image uploadée avec succès',
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ Erreur uploadImage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload',
      error: error.message
    });
  }
};

// @desc    Upload images multiples pour galerie (Admin)
// @route   POST /api/prestations/:id/upload-galerie
// @access  Private/Admin
exports.uploadGalerie = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '❌ Aucun fichier fourni'
      });
    }
    
    const prestation = await Prestation.findById(req.params.id);
    
    if (!prestation) {
      return res.status(404).json({
        success: false,
        message: 'Prestation non trouvée'
      });
    }
    
    if (!prestation.galerie) {
      prestation.galerie = [];
    }
    
    // Ajouter toutes les images à la galerie
    const uploadedFiles = req.files.map((file, index) => {
      const imageUrl = `/uploads/prestations/${file.filename}`;
      const galerieItem = {
        url: imageUrl,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        description: '',
        ordre: prestation.galerie.length + index,
        miniature: imageUrl
      };
      
      prestation.galerie.push(galerieItem);
      
      return {
        url: imageUrl,
        filename: file.filename,
        type: galerieItem.type
      };
    });
    
    await prestation.save();
    
    res.status(201).json({
      success: true,
      message: `✅ ${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('❌ Erreur uploadGalerie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload',
      error: error.message
    });
  }
};
