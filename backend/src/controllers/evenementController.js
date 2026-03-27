const Evenement = require('../models/Evenement');
const Prestataire = require('../models/Prestataire');
const jwt = require('jsonwebtoken');
const path = require('path');
const pdfService = require('../utils/pdfService');

// Helper: vérifie si un prestataire est collaborateur et retourne son rôle
function getRoleCollaborateur(evenement, prestataireId) {
  if (!prestataireId || !evenement.collaborateurs) return null;
  const collab = evenement.collaborateurs.find(
    c => c.prestataireId.toString() === prestataireId
  );
  return collab ? collab.role : null;
}

// Helper: vérifie l'accès prestataire (propriétaire ou collaborateur)
function verifierAcces(evenement, req, niveauRequis) {
  // Admin a toujours accès
  if (req.adminId) return { autorise: true, role: 'admin' };
  if (!req.prestataireId) return { autorise: false };

  // Propriétaire
  if (evenement.creePar.type === 'prestataire' && evenement.creePar.id.toString() === req.prestataireId) {
    return { autorise: true, role: 'proprietaire' };
  }

  // Collaborateur
  const roleCollab = getRoleCollaborateur(evenement, req.prestataireId);
  if (!roleCollab) return { autorise: false };

  if (niveauRequis === 'consultation') {
    return { autorise: true, role: roleCollab };
  }
  if (niveauRequis === 'modification' && roleCollab === 'modification') {
    return { autorise: true, role: roleCollab };
  }

  return { autorise: false, role: roleCollab };
}

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

    // Admin voit tout, prestataire voit les siens + ceux où il est collaborateur
    if (req.prestataireId && !req.adminId) {
      filtre.$or = [
        { 'creePar.type': 'prestataire', 'creePar.id': req.prestataireId },
        { 'collaborateurs.prestataireId': req.prestataireId }
      ];
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

    // Vérifier l'accès prestataire (propriétaire ou collaborateur)
    const acces = verifierAcces(evenement, req, 'consultation');
    if (!acces.autorise) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
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

    // Vérifier l'accès (propriétaire ou collaborateur modification)
    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
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

    // Seul le propriétaire ou l'admin peut supprimer
    if (req.prestataireId && !req.adminId) {
      if (evenement.creePar.type !== 'prestataire' || evenement.creePar.id.toString() !== req.prestataireId) {
        return res.status(403).json({ success: false, message: 'Seul le propriétaire peut supprimer' });
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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

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

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

    evenement.boiteAOutils.pull({ _id: req.params.outilId });
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur supprimerOutil:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Lier une prestation à un événement
// @route   POST /api/evenements/:id/prestations
exports.lierPrestation = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

    const { prestationId, nom, prestataire, prestataireId } = req.body;
    if (!prestationId || !nom) {
      return res.status(400).json({ success: false, message: 'prestationId et nom sont requis' });
    }

    // Éviter les doublons
    const dejaLiee = evenement.prestationsLiees.some(p => p.prestationId?.toString() === prestationId);
    if (dejaLiee) {
      return res.status(400).json({ success: false, message: 'Prestation déjà liée' });
    }

    evenement.prestationsLiees.push({ prestationId, nom, prestataire, prestataireId });
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur lierPrestation:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Délier une prestation d'un événement
// @route   DELETE /api/evenements/:id/prestations/:prestationId
exports.delierPrestation = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

    evenement.prestationsLiees = evenement.prestationsLiees.filter(
      p => p.prestationId?.toString() !== req.params.prestationId
    );
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur delierPrestation:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// ==============================
// GESTION DES COLLABORATEURS
// ==============================

// @desc    Rechercher des prestataires pour ajout comme collaborateur
// @route   GET /api/evenements/prestataires/recherche?q=...
exports.rechercherPrestataires = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const prestataires = await Prestataire.find({
      $or: [
        { nomEntreprise: regex },
        { email: regex },
        { telephone: regex }
      ]
    }).select('_id nomEntreprise email telephone logo').limit(10);

    res.json({ success: true, data: prestataires });
  } catch (error) {
    console.error('❌ Erreur rechercherPrestataires:', error);
    res.status(500).json({ success: false, message: 'Erreur recherche' });
  }
};

// @desc    Ajouter un collaborateur à un événement
// @route   POST /api/evenements/:id/collaborateurs
exports.ajouterCollaborateur = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    // Seul le propriétaire ou l'admin peut ajouter des collaborateurs
    if (req.prestataireId && !req.adminId) {
      if (evenement.creePar.type !== 'prestataire' || evenement.creePar.id.toString() !== req.prestataireId) {
        return res.status(403).json({ success: false, message: 'Seul le propriétaire peut gérer les collaborateurs' });
      }
    }

    const { prestataireId, role } = req.body;
    if (!prestataireId) {
      return res.status(400).json({ success: false, message: 'prestataireId requis' });
    }

    // Vérifier que le prestataire existe
    const prestataire = await Prestataire.findById(prestataireId).select('nomEntreprise email');
    if (!prestataire) {
      return res.status(404).json({ success: false, message: 'Prestataire non trouvé' });
    }

    // Ne pas ajouter le propriétaire comme collaborateur
    if (evenement.creePar.type === 'prestataire' && evenement.creePar.id.toString() === prestataireId) {
      return res.status(400).json({ success: false, message: 'Le propriétaire ne peut pas être collaborateur' });
    }

    // Éviter les doublons
    const dejaCollab = evenement.collaborateurs.some(c => c.prestataireId.toString() === prestataireId);
    if (dejaCollab) {
      return res.status(400).json({ success: false, message: 'Ce prestataire est déjà collaborateur' });
    }

    const nom = prestataire.nomEntreprise || 'Prestataire';
    evenement.collaborateurs.push({
      prestataireId,
      nom,
      role: role || 'consultation'
    });
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur ajouterCollaborateur:', error);
    res.status(500).json({ success: false, message: 'Erreur ajout collaborateur' });
  }
};

// @desc    Modifier le rôle d'un collaborateur
// @route   PUT /api/evenements/:id/collaborateurs/:prestataireId
exports.majCollaborateur = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    // Seul le propriétaire ou l'admin
    if (req.prestataireId && !req.adminId) {
      if (evenement.creePar.type !== 'prestataire' || evenement.creePar.id.toString() !== req.prestataireId) {
        return res.status(403).json({ success: false, message: 'Seul le propriétaire peut gérer les collaborateurs' });
      }
    }

    const collab = evenement.collaborateurs.find(c => c.prestataireId.toString() === req.params.prestataireId);
    if (!collab) {
      return res.status(404).json({ success: false, message: 'Collaborateur non trouvé' });
    }

    if (req.body.role) collab.role = req.body.role;
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur majCollaborateur:', error);
    res.status(500).json({ success: false, message: 'Erreur modification collaborateur' });
  }
};

// @desc    Supprimer un collaborateur
// @route   DELETE /api/evenements/:id/collaborateurs/:prestataireId
exports.supprimerCollaborateur = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    // Seul le propriétaire ou l'admin
    if (req.prestataireId && !req.adminId) {
      if (evenement.creePar.type !== 'prestataire' || evenement.creePar.id.toString() !== req.prestataireId) {
        return res.status(403).json({ success: false, message: 'Seul le propriétaire peut gérer les collaborateurs' });
      }
    }

    evenement.collaborateurs = evenement.collaborateurs.filter(
      c => c.prestataireId.toString() !== req.params.prestataireId
    );
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur supprimerCollaborateur:', error);
    res.status(500).json({ success: false, message: 'Erreur suppression collaborateur' });
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

// ==============================
// RÉORDONNER PROGRAMME & TODOS
// ==============================

// @desc    Réordonner les étapes du programme
// @route   PUT /api/evenements/:id/programme/reorder
exports.reorderProgramme = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

    const { ordreIds } = req.body; // Array d'IDs dans le nouvel ordre
    if (!Array.isArray(ordreIds)) return res.status(400).json({ success: false, message: 'ordreIds requis (array)' });

    ordreIds.forEach((id, index) => {
      const etape = evenement.programme.id(id);
      if (etape) etape.ordre = index;
    });
    evenement.programme.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur reorderProgramme:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// @desc    Réordonner les todos
// @route   PUT /api/evenements/:id/todos/reorder
exports.reorderTodos = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    const acces = verifierAcces(evenement, req, 'modification');
    if (!acces.autorise) return res.status(403).json({ success: false, message: 'Accès non autorisé' });

    const { ordreIds } = req.body;
    if (!Array.isArray(ordreIds)) return res.status(400).json({ success: false, message: 'ordreIds requis (array)' });

    ordreIds.forEach((id, index) => {
      const todo = evenement.todos.id(id);
      if (todo) todo.ordre = index;
    });
    evenement.todos.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    await evenement.save();

    res.json({ success: true, data: evenement });
  } catch (error) {
    console.error('❌ Erreur reorderTodos:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
};

// ===========================================
// 📤 EXPORT iCAL (.ics)
// ===========================================

function formatICalDate(dateStr, heureStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (heureStr) {
    const [h, m] = heureStr.split(':');
    return `${year}${month}${day}T${h.padStart(2, '0')}${(m || '00').padStart(2, '0')}00`;
  }
  return `${year}${month}${day}`;
}

function escapeICalText(text) {
  if (!text) return '';
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

// Génère les lignes VALARM pour les rappels ICS
function genererVALARM(rappelJours, nombreRappels) {
  const jours = parseInt(rappelJours) || 1;
  const nb = Math.min(parseInt(nombreRappels) || 1, 5);
  const alarms = [];
  for (let i = 0; i < nb; i++) {
    // Espacement: rappel principal = jours, puis jours*2, jours*3...
    const delai = jours * (i + 1);
    alarms.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Rappel ELIJAH'GOD - ${delai} jour(s) avant`,
      `TRIGGER:-P${delai}D`,
      'END:VALARM'
    );
  }
  return alarms;
}

function genererICS(evt, options = {}) {
  const uid = `evt-${evt._id}@elijahgod`;
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dtstart = formatICalDate(evt.dateDebut, evt.heureDebut);
  const dtend = evt.dateFin
    ? formatICalDate(evt.dateFin, evt.heureFin || evt.heureDebut)
    : formatICalDate(evt.dateDebut, evt.heureFin);

  let location = '';
  if (evt.lieu) {
    const parts = [evt.lieu.nom, evt.lieu.adresse, evt.lieu.codePostal, evt.lieu.ville].filter(Boolean);
    location = parts.join(', ');
  }

  const description = [
    evt.description || '',
    evt.type ? `Type: ${evt.type}` : '',
    evt.nbInvites ? `Invités: ${evt.nbInvites}` : '',
    evt.statut ? `Statut: ${evt.statut}` : '',
  ].filter(Boolean).join('\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ELIJAHGOD//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICalText(evt.titre)}`,
  ];

  if (description) lines.push(`DESCRIPTION:${escapeICalText(description)}`);
  if (location) lines.push(`LOCATION:${escapeICalText(location)}`);

  // Rappels
  const rappelJours = options.rappelJours || 1;
  const nombreRappels = options.nombreRappels || 1;
  lines.push(...genererVALARM(rappelJours, nombreRappels));

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

// @desc    Exporter un événement en .ics
// @route   GET /api/evenements/:id/ical
exports.exportIcal = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ success: false, message: 'Événement non trouvé' });

    const ics = genererICS(evenement, {
      rappelJours: req.query.rappelJours,
      nombreRappels: req.query.nombreRappels,
    });
    const filename = `evenement-${evenement.titre.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(ics);
  } catch (error) {
    console.error('❌ Erreur exportIcal:', error);
    res.status(500).json({ success: false, message: 'Erreur export' });
  }
};

// @desc    Exporter tous les événements en .ics
// @route   GET /api/evenements/export/ical-all
exports.exportIcalAll = async (req, res) => {
  try {
    let filtre = {};
    if (req.prestataireId) {
      filtre.$or = [
        { 'creePar.id': req.prestataireId },
        { 'collaborateurs.prestataireId': req.prestataireId }
      ];
    }

    const evenements = await Evenement.find(filtre).sort({ dateDebut: 1 });

    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const vevents = evenements.map(evt => {
      const uid = `evt-${evt._id}@elijahgod`;
      const dtstart = formatICalDate(evt.dateDebut, evt.heureDebut);
      const dtend = evt.dateFin
        ? formatICalDate(evt.dateFin, evt.heureFin || evt.heureDebut)
        : formatICalDate(evt.dateDebut, evt.heureFin);

      let location = '';
      if (evt.lieu) {
        const parts = [evt.lieu.nom, evt.lieu.adresse, evt.lieu.codePostal, evt.lieu.ville].filter(Boolean);
        location = parts.join(', ');
      }

      const rappelJours = parseInt(req.query.rappelJours) || 1;
      const nombreRappels = parseInt(req.query.nombreRappels) || 1;

      const lines = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeICalText(evt.titre)}`,
      ];
      if (location) lines.push(`LOCATION:${escapeICalText(location)}`);
      if (evt.description) lines.push(`DESCRIPTION:${escapeICalText(evt.description)}`);
      lines.push(...genererVALARM(rappelJours, nombreRappels));
      lines.push('END:VEVENT');
      return lines.join('\r\n');
    });

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ELIJAHGOD//Agenda//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...vevents,
      'END:VCALENDAR',
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="elijahgod-agenda.ics"');
    res.send(ics);
  } catch (error) {
    console.error('❌ Erreur exportIcalAll:', error);
    res.status(500).json({ success: false, message: 'Erreur export' });
  }
};

// ===========================================
// 🔗 ABONNEMENT ICS (URL publique pour apps externes)
// ===========================================

// @desc    Générer un token d'abonnement ICS (longue durée, usage URL)
// @route   POST /api/evenements/ical-token
exports.genererIcalToken = async (req, res) => {
  try {
    const payload = {};
    if (req.adminId) {
      payload.type = 'admin';
      payload.adminId = req.adminId;
    } else if (req.prestataireId) {
      payload.type = 'prestataire';
      payload.prestataireId = req.prestataireId;
    }
    payload.usage = 'ical-feed';

    // Token valable 2 ans
    const feedToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '730d' });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const feedUrl = `${baseUrl}/api/evenements/feed/${feedToken}`;

    res.json({ success: true, feedUrl, token: feedToken });
  } catch (error) {
    console.error('❌ Erreur genererIcalToken:', error);
    res.status(500).json({ success: false, message: 'Erreur génération token' });
  }
};

// @desc    Flux ICS public (pas de header auth — le token est dans l'URL)
// @route   GET /api/evenements/feed/:token
exports.feedIcal = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (decoded.usage !== 'ical-feed') {
      return res.status(403).send('Token invalide');
    }

    let filtre = {};
    if (decoded.type === 'prestataire' && decoded.prestataireId) {
      filtre.$or = [
        { 'creePar.id': decoded.prestataireId },
        { 'collaborateurs.prestataireId': decoded.prestataireId }
      ];
    }

    const evenements = await Evenement.find(filtre).sort({ dateDebut: 1 });

    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const vevents = evenements.map(evt => {
      const uid = `evt-${evt._id}@elijahgod`;
      const dtstart = formatICalDate(evt.dateDebut, evt.heureDebut);
      const dtend = evt.dateFin
        ? formatICalDate(evt.dateFin, evt.heureFin || evt.heureDebut)
        : formatICalDate(evt.dateDebut, evt.heureFin);

      let location = '';
      if (evt.lieu) {
        const parts = [evt.lieu.nom, evt.lieu.adresse, evt.lieu.codePostal, evt.lieu.ville].filter(Boolean);
        location = parts.join(', ');
      }

      const lines = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeICalText(evt.titre)}`,
      ];
      if (location) lines.push(`LOCATION:${escapeICalText(location)}`);
      if (evt.description) lines.push(`DESCRIPTION:${escapeICalText(evt.description)}`);
      lines.push(...genererVALARM(1, 1));
      lines.push('END:VEVENT');
      return lines.join('\r\n');
    });

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ELIJAHGOD//Agenda//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      "X-WR-CALNAME:ELIJAH'GOD Agenda",
      'X-WR-TIMEZONE:Europe/Paris',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      ...vevents,
      'END:VCALENDAR',
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(ics);
  } catch (error) {
    console.error('❌ Erreur feedIcal:', error);
    res.status(403).send('Token expiré ou invalide');
  }
};

// ===========================================
// 🔔 RAPPELS EMAIL - Configuration globale
// ===========================================

// @desc    Mettre à jour la config rappels pour tous les événements futurs
// @route   PUT /api/evenements/rappels/config
exports.majRappelsConfig = async (req, res) => {
  try {
    const { actif, delaiJours, nombreRappels } = req.body;

    let filtre = {
      dateDebut: { $gte: new Date() },
      statut: { $nin: ['annule', 'termine'] }
    };

    // Prestataire ne modifie que ses propres événements
    if (req.prestataireId && !req.adminId) {
      filtre['creePar.type'] = 'prestataire';
      filtre['creePar.id'] = req.prestataireId;
    }

    const update = {
      'rappels.actif': actif !== undefined ? actif : true,
      'rappels.delaiJours': parseInt(delaiJours) || 1,
      'rappels.nombreRappels': Math.min(parseInt(nombreRappels) || 1, 5)
    };

    const result = await Evenement.updateMany(filtre, { $set: update });

    res.json({
      success: true,
      message: `Rappels mis à jour pour ${result.modifiedCount} événement(s)`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Erreur majRappelsConfig:', error);
    res.status(500).json({ success: false, message: 'Erreur mise à jour rappels' });
  }
};

// ===========================================
// 📄 EXPORT PDF PROGRAMME
// ===========================================

// @desc    Générer le PDF du programme d'un événement
// @route   GET /api/evenements/:id/programme-pdf
exports.exportProgrammePDF = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) {
      return res.status(404).json({ success: false, message: 'Événement non trouvé' });
    }

    // Récupérer les settings pour l'en-tête
    let settings = {};
    try {
      const Settings = require('../models/Settings');
      settings = await Settings.findOne() || {};
    } catch (e) { /* pas de settings */ }

    const safeTitle = evenement.titre.replace(/[^a-zA-Z0-9à-ü]/gi, '_');
    const filename = `programme-${safeTitle}.pdf`;
    const outputPath = path.join(__dirname, '../../uploads/programmes', filename);

    await pdfService.genererProgrammePDF(evenement, outputPath, settings);

    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('❌ Erreur téléchargement PDF programme:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Erreur téléchargement' });
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur exportProgrammePDF:', error);
    res.status(500).json({ success: false, message: 'Erreur génération PDF programme' });
  }
};
