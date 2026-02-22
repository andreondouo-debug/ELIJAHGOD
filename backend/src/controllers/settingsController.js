const Settings = require('../models/Settings');

/**
 * ⚙️ CONTROLLER PARAMÈTRES
 * Gestion des paramètres du site
 */

// @desc    Obtenir tous les paramètres
// @route   GET /api/settings
// @access  Public (sauf infos sensibles)
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Ne pas exposer les infos sensibles en public
    const publicSettings = {
      entreprise: settings.entreprise,
      contact: {
        email: settings.contact.email,
        telephone: settings.contact.telephone,
        adresse: settings.contact.adresse,
        horaires: settings.contact.horaires
      },
      reseauxSociaux: settings.reseauxSociaux,
      messages: settings.messages,
      site: {
        afficherPrix: settings.site.afficherPrix,
        afficherAvis: settings.site.afficherAvis,
        couleurPrincipale: settings.site.couleurPrincipale,
        couleurSecondaire: settings.site.couleurSecondaire,
        couleurAccent: settings.site.couleurAccent
      },
      seo: settings.seo,
      devis: {
        messageConfirmation: settings.devis.messageConfirmation,
        cgv: settings.devis.cgv
      },
      // Paramètres de mise en page (nécessaires pour le rendu frontend)
      carousel: settings.carousel,
      homepage: settings.homepage,
      pages: settings.pages,
      // Page À propos (contenu public)
      aPropos: settings.aPropos
    };
    
    res.json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('❌ Erreur getSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres'
    });
  }
};

// @desc    Obtenir tous les paramètres (Admin)
// @route   GET /api/settings/admin
// @access  Private/Admin
exports.getSettingsAdmin = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Erreur getSettingsAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres'
    });
  }
};

// @desc    Mettre à jour les paramètres généraux
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const adminNom = req.body.adminNom || 'Admin';
    delete req.body.adminNom;
    
    const settings = await Settings.updateSettings(req.body, adminNom);
    
    res.json({
      success: true,
      message: '✅ Paramètres mis à jour avec succès',
      data: settings
    });
  } catch (error) {
    console.error('❌ Erreur updateSettings:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les infos entreprise
// @route   PUT /api/settings/entreprise
// @access  Private/Admin
exports.updateEntreprise = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.entreprise = { ...settings.entreprise, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Informations entreprise mises à jour',
      data: settings.entreprise
    });
  } catch (error) {
    console.error('❌ Erreur updateEntreprise:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les contact
// @route   PUT /api/settings/contact
// @access  Private/Admin
exports.updateContact = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.contact = { ...settings.contact, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Informations de contact mises à jour',
      data: settings.contact
    });
  } catch (error) {
    console.error('❌ Erreur updateContact:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les réseaux sociaux
// @route   PUT /api/settings/reseaux-sociaux
// @access  Private/Admin
exports.updateReseauxSociaux = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.reseauxSociaux = { ...settings.reseauxSociaux, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Réseaux sociaux mis à jour',
      data: settings.reseauxSociaux
    });
  } catch (error) {
    console.error('❌ Erreur updateReseauxSociaux:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les paramètres de devis
// @route   PUT /api/settings/devis
// @access  Private/Admin
exports.updateDevisSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.devis = { ...settings.devis, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Paramètres de devis mis à jour',
      data: settings.devis
    });
  } catch (error) {
    console.error('❌ Erreur updateDevisSettings:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les tarifs
// @route   PUT /api/settings/tarifs
// @access  Private/Admin
exports.updateTarifs = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.tarifs = { ...settings.tarifs, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Tarifs mis à jour',
      data: settings.tarifs
    });
  } catch (error) {
    console.error('❌ Erreur updateTarifs:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les messages
// @route   PUT /api/settings/messages
// @access  Private/Admin
exports.updateMessages = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.messages = { ...settings.messages, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Messages mis à jour',
      data: settings.messages
    });
  } catch (error) {
    console.error('❌ Erreur updateMessages:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour la config email
// @route   PUT /api/settings/email
// @access  Private/Admin
exports.updateEmailConfig = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.emailConfig = { ...settings.emailConfig, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Configuration email mise à jour',
      data: settings.emailConfig
    });
  } catch (error) {
    console.error('❌ Erreur updateEmailConfig:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les paramètres du planning
// @route   PUT /api/settings/planning
// @access  Private/Admin
exports.updatePlanningSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.planning = { ...settings.planning, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Paramètres du planning mis à jour',
      data: settings.planning
    });
  } catch (error) {
    console.error('❌ Erreur updatePlanningSettings:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour les paramètres du site
// @route   PUT /api/settings/site
// @access  Private/Admin
exports.updateSiteSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.site = { ...settings.site, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Paramètres du site mis à jour',
      data: settings.site
    });
  } catch (error) {
    console.error('❌ Erreur updateSiteSettings:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le SEO
// @route   PUT /api/settings/seo
// @access  Private/Admin
exports.updateSEO = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.seo = { ...settings.seo, ...req.body };
    settings.derniereMiseAJour = { date: new Date(), par: req.body.adminNom };
    await settings.save();
    
    res.json({
      success: true,
      message: '✅ Paramètres SEO mis à jour',
      data: settings.seo
    });
  } catch (error) {
    console.error('❌ Erreur updateSEO:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Réinitialiser les paramètres par défaut
// @route   POST /api/settings/reset
// @access  Private/Admin
exports.resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});
    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      message: '⚠️ Paramètres réinitialisés aux valeurs par défaut',
      data: settings
    });
  } catch (error) {
    console.error('❌ Erreur resetSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation'
    });
  }
};

// @desc    Obtenir les statistiques
// @route   GET /api/settings/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Mettre à jour les statistiques en temps réel
    const Devis = require('../models/Devis');
    const Reservation = require('../models/Reservation');
    
    const totalDevis = await Devis.countDocuments();
    const totalReservations = await Reservation.countDocuments({ statut: { $in: ['demandee', 'validee'] } });
    const totalClients = await Devis.distinct('client.email').then(emails => emails.length);
    
    settings.stats = {
      totalDevis,
      totalReservations,
      totalClients
    };
    await settings.save();
    
    res.json({ success: true, data: settings.stats });
  } catch (error) {
    console.error('❌ Erreur getStats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
};

// ============================================================
// 📸 UPLOAD À PROPOS — Photo de profil & Galerie réalisations
// ============================================================
const path = require('path');
const fs = require('fs');

exports.uploadPhotoProfil = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '❌ Aucun fichier reçu' });

    const url = `/uploads/apropos/photo/${req.file.filename}`;

    // Mettre à jour settings.aPropos.hero.photo
    const settings = await Settings.getSettings();
    if (!settings.aPropos) settings.aPropos = {};
    if (!settings.aPropos.hero) settings.aPropos.hero = {};

    // Supprimer l'ancienne photo si locale
    if (settings.aPropos.hero.photo && settings.aPropos.hero.photo.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../', settings.aPropos.hero.photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    settings.aPropos.hero.photo = url;
    settings.markModified('aPropos');
    await settings.save();

    console.log(`📸 Photo profil uploadée : ${url}`);
    res.json({ success: true, url, message: '✅ Photo de profil mise à jour !' });
  } catch (error) {
    console.error('❌ Erreur uploadPhotoProfil:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
  }
};

exports.uploadGalerieImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: '❌ Aucune image reçue' });

    const settings = await Settings.getSettings();
    if (!settings.aPropos) settings.aPropos = {};
    if (!settings.aPropos.galerie) settings.aPropos.galerie = [];

    const nouvellesImages = req.files.map((file, idx) => ({
      url: `/uploads/apropos/galerie/${file.filename}`,
      legende: '',
      ordre: (settings.aPropos.galerie.length || 0) + idx
    }));

    settings.aPropos.galerie.push(...nouvellesImages);
    settings.markModified('aPropos');
    await settings.save();

    console.log(`🖼️ ${req.files.length} image(s) ajoutée(s) à la galerie`);
    res.json({ success: true, images: nouvellesImages, message: `✅ ${req.files.length} image(s) ajoutée(s) à la galerie !` });
  } catch (error) {
    console.error('❌ Erreur uploadGalerieImages:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
  }
};

exports.updateGalerieLegende = async (req, res) => {
  try {
    const { index, legende } = req.body;
    const settings = await Settings.getSettings();
    if (settings.aPropos?.galerie?.[index] !== undefined) {
      settings.aPropos.galerie[index].legende = legende;
      settings.markModified('aPropos');
      await settings.save();
    }
    res.json({ success: true, message: '✅ Légende mise à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour légende' });
  }
};

// ============================================================
// 🎬 UPLOAD CAROUSEL — Image de fond de la Hero Section
// ============================================================

exports.uploadCarouselBanniere = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '❌ Aucun fichier reçu' });

    const url = `/uploads/carousel/${req.file.filename}`;

    const settings = await Settings.getSettings();
    if (!settings.entreprise) settings.entreprise = {};

    // Supprimer l'ancienne bannière si locale
    if (settings.entreprise.banniere && settings.entreprise.banniere.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../', settings.entreprise.banniere);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    settings.entreprise.banniere = url;
    settings.markModified('entreprise');
    await settings.save();

    console.log(`🎬 Bannière carousel uploadée : ${url}`);
    res.json({ success: true, url, message: '✅ Image du carousel mise à jour !' });
  } catch (error) {
    console.error('❌ Erreur uploadCarouselBanniere:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
  }
};

exports.deleteCarouselBanniere = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    // Supprimer le fichier physique si local
    if (settings.entreprise?.banniere && settings.entreprise.banniere.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', settings.entreprise.banniere);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    if (!settings.entreprise) settings.entreprise = {};
    settings.entreprise.banniere = '';
    settings.markModified('entreprise');
    await settings.save();

    console.log('🗑️ Bannière carousel supprimée');
    res.json({ success: true, message: '✅ Image du carousel supprimée' });
  } catch (error) {
    console.error('❌ Erreur deleteCarouselBanniere:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};

exports.deleteGalerieImage = async (req, res) => {
  try {
    const { index } = req.params;
    const settings = await Settings.getSettings();
    const galerie = settings.aPropos?.galerie || [];
    const image = galerie[parseInt(index)];

    if (!image) return res.status(404).json({ success: false, message: '❌ Image introuvable' });

    // Supprimer le fichier physique si local
    if (image.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', image.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    galerie.splice(parseInt(index), 1);
    // Réindexer
    galerie.forEach((img, i) => { img.ordre = i; });
    settings.aPropos.galerie = galerie;
    settings.markModified('aPropos');
    await settings.save();

    console.log(`🗑️ Image galerie supprimée (index ${index})`);
    res.json({ success: true, message: '✅ Image supprimée' });
  } catch (error) {
    console.error('❌ Erreur deleteGalerieImage:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};
