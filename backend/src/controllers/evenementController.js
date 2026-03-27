const Evenement = require('../models/Evenement');

/**
 * 📅 CONTROLLER ÉVÉNEMENTS / AGENDA
 * Gestion complète des événements liés aux prestations et commandes
 */

// @desc    Créer un événement
// @route   POST /api/evenements
// @access  Private (Admin ou Prestataire)
exports.creerEvenement = async (req, res) => {
  try {
    const { titre, description, type, couleur, dateDebut, dateFin, heureDebut, heureFin, journeeEntiere, lieu, commandesLiees, prestationsLiees, programme, boiteAOutils, todos, notes, nbInvites } = req.body;

    // Déterminer le créateur
    let creePar;
    if (req.adminId) {
      creePar = { type: 'admin', id: req.adminId, nom: req.adminNom || 'Admin' };
    } else if (req.prestataireId) {
      creePar = { type: 'prestataire', id: req.prestataireId, nom: req.prestataireNom || 'Prestataire' };
    } else {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    const evenement = await Evenement.create({
      titre, description, type, couleur,
      dateDebut, dateFin, heureDebut, heureFin, journeeEntiere,
      lieu, creePar,
      commandesLiees: commandesLiees || [],
      prestationsLiees: prestationsLiees || [],
      programme: programme || [],
      boiteAOutils: boiteAOutils || [],
      todos: todos || [],
      notes, nbInvites
    });

    res.status(201).json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur creerEvenement:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création', error: error.message });
  }
};

// @desc    Lister tous les événements (filtrés par rôle)
// @route   GET /api/evenements
// @access  Private (Admin ou Prestataire)
exports.listerEvenements = async (req, res) => {
  try {
    const { mois, annee, statut, type } = req.query;
    let filtre = {};

    // Admin voit tout, prestataire voit les siens
    if (req.prestataireId && !req.adminId) {
      filtre['creePar.type'] = 'prestataire';
      filtre['creePar.id'] = req.prestataireId;
    }

    if (statut) filtre.statut = statut;
    if (type) filtre.type = type;

    if (mois && annee) {
      const dateDebut = new Date(parseInt(annee), parseInt(mois) - 1, 1);
      const dateFin = new Date(parseInt(annee), parseInt(mois), 0, 23, 59, 59);
      filtre.dateDebut = { $gte: dateDebut, $lte: dateFin };
    }

    const evenements = await Evenement.find(filtre).sort({ dateDebut: 1 });

    res.json({ success: true, count: evenements.length, data: evenements });
  } catch (error) {
    console.error('❌ Erreur listerEvenements:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération' });
  }
};

// @desc    Obtenir un événement par ID
// @route   GET /api/evenements/:id
// @access  Private (Admin ou Prestataire propriétaire)
exports.getEvenement = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) {
      return res.status(404).json({ success: false, message: 'Événement non trouvé' });
    }

    // Vérifier l'accès prestataire
    if (req.prestataireId && !req.adminId) {
      if (evenement.creePar.type !== 'prestataire' || evenement.creePar.id.toString() !== req.prestataireId) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
    }

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur getEvenement:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération' });
  }
};

// @desc    Mettre à jour un événement
// @route   PUT /api/evenements/:id
// @access  Private (Admin ou Prestataire propriétaire)
exports.majEvenement = async (req, res) => {
  try {
    let evenement = await Evenement.findById(req.params.id);
    if (!evenement) {
      return res.status(404).json({ success: false, message: 'Événement non trouvé' });
    }

    // Vérifier l'accès
    if (req.prestataireId && !req.adminId) {
      if (evenement.creePar.type !== 'prestataire' || evenement.creePar.id.toString() !== req.prestataireId) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
    }

    evenement = await Evenement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur majEvenement:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
  }
};

// @desc    Supprimer un événement
// @route   DELETE /api/evenements/:id
// @access  Private (Admin ou Prestataire propriétaire)
exports.supprimerEvenement = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) {
      return res.status(404).json({ success: false, message: 'Événement non trouvé' });
    }

    if (req.prestataireId && !req.adminId) {
      if (evenement.creePar.type !== 'prestataire' || evenement.creePar.id.toString() !== req.prestataireId) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
    }

    await evenement.deleteOne();
    res.json({ success: true, message: 'Événement supprimé' });
  } catch (error) {
    console.error('❌ Erreur supprimerEvenement:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};

// ==============================
// GESTION DU PROGRAMME (Étapes)
// ==============================

// @desc    Ajouter une étape au programme
// @route   POST /api/evenements/:id/programme
exports.ajouterEtape = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    evenement.programme.push(req.body);
    evenement.programme.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur ajouterEtape:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Mettre à jour une étape
// @route   PUT /api/evenements/:id/programme/:etapeId
exports.majEtape = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    const etape = evenement.programme.id(req.params.etapeId);
    if (!etape) return res.status(404).json({ success: false, message: 'Étape non trouvée' });

    Object.assign(etape, req.body);
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur majEtape:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Supprimer une étape
// @route   DELETE /api/evenements/:id/programme/:etapeId
exports.supprimerEtape = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    evenement.programme.pull({ _id: req.params.etapeId });
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur supprimerEtape:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// ==============================
// GESTION DES TODOS
// ==============================

// @desc    Ajouter un todo
// @route   POST /api/evenements/:id/todos
exports.ajouterTodo = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    evenement.todos.push(req.body);
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur ajouterTodo:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Mettre à jour un todo (toggle fait, etc.)
// @route   PUT /api/evenements/:id/todos/:todoId
exports.majTodo = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    const todo = evenement.todos.id(req.params.todoId);
    if (!todo) return res.status(404).json({ success: false, message: 'Todo non trouvé' });

    Object.assign(todo, req.body);
    if (req.body.fait && !todo.completeLe) {
      todo.completeLe = new Date();
    }
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur majTodo:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Supprimer un todo
// @route   DELETE /api/evenements/:id/todos/:todoId
exports.supprimerTodo = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    evenement.todos.pull({ _id: req.params.todoId });
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur supprimerTodo:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// ==============================
// GESTION BOÎTE À OUTILS
// ==============================

// @desc    Ajouter un outil
// @route   POST /api/evenements/:id/outils
exports.ajouterOutil = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    evenement.boiteAOutils.push(req.body);
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur ajouterOutil:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Mettre à jour un outil
// @route   PUT /api/evenements/:id/outils/:outilId
exports.majOutil = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    const outil = evenement.boiteAOutils.id(req.params.outilId);
    if (!outil) return res.status(404).json({ success: false, message: 'Outil non trouvé' });

    Object.assign(outil, req.body);
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur majOutil:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Supprimer un outil
// @route   DELETE /api/evenements/:id/outils/:outilId
exports.supprimerOutil = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    evenement.boiteAOutils.pull({ _id: req.params.outilId });
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur supprimerOutil:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Changer le statut d'un événement
// @route   PATCH /api/evenements/:id/statut
exports.changerStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const evenement = await Evenement.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    );
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur changerStatut:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};
