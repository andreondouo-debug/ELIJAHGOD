const Devis = require('../models/Devis');
const Client = require('../models/Client');
const Prestation = require('../models/Prestation');
const Materiel = require('../models/Materiel');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { calculerFraisKilometriques } = require('../utils/distanceService');
const pdfService = require('../utils/pdfService');
const path = require('path');

/**
 * 📋 CONTRÔLEUR DEVIS WORKFLOW
 * Gestion complète du cycle de vie des devis
 */

// ============================================
// 1. CRÉER UN BROUILLON
// ============================================
exports.creerBrouillon = async (req, res) => {
  try {
    console.log('📥 Brouillon reçu:', JSON.stringify(req.body, null, 2));
    console.log('📞 Téléphone client:', req.body.client?.telephone);
    
    let clientId = req.clientId; // Peut être undefined si pas connecté

    // Si pas de clientId, créer un compte automatiquement
    if (!clientId && req.body.client) {
      const { prenom, nom, email, telephone, password } = req.body.client;

      console.log('👤 Création client:', { prenom, nom, email, telephone });

      // Vérifier si l'email existe déjà
      let client = await Client.findOne({ email: email.toLowerCase() });
      
      if (!client) {
        // Créer le nouveau client
        client = new Client({
          prenom,
          nom,
          email: email.toLowerCase(),
          password: password || `temp${Date.now()}`, // Mot de passe temporaire si non fourni
          telephone
        });
        await client.save();

        // Générer token de vérification et envoyer email
        const verificationToken = await client.generateEmailVerificationToken();
        await client.save();

        const urlVerification = `${process.env.FRONTEND_URL}/client/verifier-email/${verificationToken}`;
        
        try {
          await sendEmail({
            to: client.email,
            subject: '✅ Votre compte a été créé',
            html: `
              <h2>Bienvenue ${client.prenom}!</h2>
              <p>Votre compte a été créé automatiquement lors de votre demande de devis.</p>
              <p>Veuillez vérifier votre email en cliquant ci-dessous:</p>
              <a href="${urlVerification}">Vérifier mon email</a>
            `
          });
        } catch (emailError) {
          console.error('❌ Erreur envoi email:', emailError);
        }
      }

      clientId = client._id;
    }

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: '❌ Informations client requises'
      });
    }

    // Récupérer les infos client pour historique
    const client = await Client.findById(clientId);
    
    // Normaliser le type d'événement (première lettre en majuscule)
    const normaliserType = (type) => {
      if (!type) return 'Autre';
      return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    };

    // Parser le nombre d'invités (gérer "Non précisé")
    const parseNbInvites = (nb) => {
      if (!nb || nb === 'Non précisé' || isNaN(parseInt(nb))) {
        return 50; // Valeur par défaut
      }
      return parseInt(nb);
    };

    // Créer le devis en brouillon
    const devis = new Devis({
      clientId,
      client: {
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
        adresse: client.adresse,
        entreprise: client.entreprise
      },
      evenement: {
        type: normaliserType(req.body.typeEvenement),
        date: req.body.dateEvenement || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours par défaut
        titre: req.body.titre,
        description: req.body.commentaires,
        lieu: {
          nom: req.body.lieu || 'À définir',
          adresse: req.body.lieuAdresse,
          ville: req.body.lieuVille
        },
        nbInvites: parseNbInvites(req.body.nombreInvites),
        nbInvitesEstime: req.body.nombreInvites || 'Non précisé'
      },
      statut: 'brouillon',
      etapeActuelle: 'informations',
      progressionPourcentage: 10,
      metadata: {
        source: req.body.source || 'web',
        navigateur: req.headers['user-agent']
      }
    });

    // 🚗 Calculer les frais kilométriques si une adresse est fournie
    if (req.body.lieuAdresse && req.body.lieuVille) {
      try {
        const adresseComplete = `${req.body.lieuAdresse}, ${req.body.lieuVille}`;
        const adresseEntreprise = process.env.ADRESSE_ENTREPRISE || 'Paris, France';
        
        console.log('🚗 Calcul distance:', adresseEntreprise, '→', adresseComplete);
        
        const fraisKm = await calculerFraisKilometriques(adresseEntreprise, adresseComplete);
        
        if (fraisKm && fraisKm.fraisTotal > 0) {
          devis.montants.fraisKilometriques = {
            distanceSimple: fraisKm.distanceSimple,
            distanceAllerRetour: fraisKm.distanceAllerRetour,
            kmGratuits: fraisKm.kmGratuits,
            kmFacturables: fraisKm.kmFacturables,
            tarifParKm: fraisKm.tarifParKm,
            montant: fraisKm.fraisTotal,
            adresseDepart: adresseEntreprise,
            adresseArrivee: adresseComplete,
            calculeAt: new Date()
          };
          
          console.log(`✅ Frais kilométriques: ${fraisKm.distanceAllerRetour}km A/R → ${fraisKm.fraisTotal}€`);
        } else {
          console.log('ℹ️ Pas de frais kilométriques (distance < 30km ou erreur de géocodage)');
        }
      } catch (kmError) {
        console.error('⚠️ Erreur calcul frais km:', kmError.message);
        // Ne pas bloquer la création du devis si le calcul échoue
      }
    }

    await devis.save();

    // Ajouter dans l'historique
    devis.ajouterHistorique('creation', 'client', clientId, 'Création du brouillon');
    devis.ajouterConversation('validation', 'system', `Bonjour ${client.prenom}! Commençons la construction de votre devis.`);
    await devis.save();

    res.status(201).json({
      success: true,
      message: '✅ Brouillon créé',
      devis: {
        _id: devis._id,
        numeroDevis: devis.numeroDevis,
        statut: devis.statut,
        etapeActuelle: devis.etapeActuelle,
        progressionPourcentage: devis.progressionPourcentage
      }
    });

  } catch (error) {
    console.error('❌ Erreur création brouillon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du brouillon',
      error: error.message
    });
  }
};

// ============================================
// 2. SAUVEGARDER UNE ÉTAPE (Workflow guidé)
// ============================================
exports.sauvegarderEtape = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { etape, data } = req.body;

    const devis = await Devis.findById(devisId);
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    // Vérifier que c'est bien le client propriétaire
    if (devis.clientId.toString() !== req.clientId) {
      return res.status(403).json({
        success: false,
        message: '❌ Non autorisé'
      });
    }

    // Mettre à jour selon l'étape
    switch(etape) {
      case 'type_evenement':
        devis.evenement.type = data.type;
        devis.evenement.titre = data.titre;
        devis.evenement.description = data.description;
        devis.evenement.thematique = data.thematique;
        devis.evenement.ambiance = data.ambiance;
        devis.ajouterConversation('reponse', 'client', `Type d'événement: ${data.type}`);
        break;

      case 'date_lieu':
        devis.evenement.date = data.date;
        devis.evenement.heureDebut = data.heureDebut;
        devis.evenement.heureFin = data.heureFin;
        devis.evenement.dureeEstimee = data.dureeEstimee;
        devis.evenement.lieu = data.lieu;
        devis.ajouterConversation('reponse', 'client', `Date: ${data.date}, Lieu: ${data.lieu?.ville}`);
        break;

      case 'invites':
        devis.evenement.nbInvites = data.nbInvites;
        devis.evenement.nbInvitesEstime = data.nbInvitesEstime;
        devis.ajouterConversation('reponse', 'client', `Nombre d'invités: ${data.nbInvites || data.nbInvitesEstime}`);
        break;

      case 'prestations':
        // Charger les détails des prestations sélectionnées
        if (data.prestations && data.prestations.length > 0) {
          devis.prestations = [];
          
          for (const p of data.prestations) {
            const prestation = await Prestation.findById(p.prestationId);
            if (prestation) {
              devis.prestations.push({
                prestation: prestation._id,
                prestataire: prestation.prestataire,
                nom: prestation.titre,
                categorie: prestation.categorie,
                quantite: p.quantite || 1,
                duree: p.duree,
                prixUnitaire: prestation.tarif,
                prixTotal: prestation.tarif * (p.quantite || 1),
                options: p.options || {},
                commentaire: p.commentaire
              });
            }
          }
          
          devis.ajouterConversation('reponse', 'client', `${data.prestations.length} prestation(s) sélectionnée(s)`);
        }
        break;

      case 'materiels':
        // Charger les détails des matériels sélectionnés
        if (data.materiels && data.materiels.length > 0) {
          devis.materiels = [];
          
          for (const m of data.materiels) {
            const materiel = await Materiel.findById(m.materielId);
            if (materiel) {
              // Calculer le prix de location
              const prixCalcule = materiel.calculerPrix(m.dateDebut, m.dateFin);
              
              devis.materiels.push({
                materiel: materiel._id,
                prestataire: materiel.prestataire,
                nom: materiel.nom,
                categorie: materiel.categorie,
                quantite: m.quantite || 1,
                dateDebut: m.dateDebut,
                dateFin: m.dateFin,
                prixLocation: {
                  jour: materiel.prixLocation.jour,
                  total: prixCalcule.total * (m.quantite || 1),
                  caution: materiel.prixLocation.caution * (m.quantite || 1)
                },
                options: {
                  livraison: m.livraison || false,
                  installation: m.installation || false,
                  fraisLivraison: m.livraison ? materiel.fraisLivraison : 0,
                  fraisInstallation: m.installation ? materiel.fraisInstallation : 0
                },
                commentaire: m.commentaire
              });
            }
          }
          
          devis.ajouterConversation('reponse', 'client', `${data.materiels.length} matériel(s) sélectionné(s)`);
        }
        break;

      case 'demandes_speciales':
        devis.demandesClient = {
          description: data.description,
          besoinsSpecifiques: data.besoinsSpecifiques || [],
          budget: data.budget,
          priorites: data.priorites || [],
          references: data.references || [],
          restrictions: data.restrictions
        };
        
        // Demande d'entretien
        if (data.entretien) {
          devis.entretien.demande = true;
          devis.entretien.type = data.entretien.type;
          devis.entretien.statut = 'a_planifier';
        }
        
        devis.ajouterConversation('reponse', 'client', 'Demandes spéciales enregistrées');
        break;

      default:
        break;
    }

    // Passer à l'étape suivante
    devis.etapeSuivante();

    // Recalculer les montants
    devis.calculerMontants();

    // Ajouter dans l'historique
    devis.ajouterHistorique('modification', 'client', req.clientId, `Étape "${etape}" complétée`);

    await devis.save();

    res.json({
      success: true,
      message: '✅ Étape sauvegardée',
      devis: {
        _id: devis._id,
        numeroDevis: devis.numeroDevis,
        statut: devis.statut,
        etapeActuelle: devis.etapeActuelle,
        progressionPourcentage: devis.progressionPourcentage,
        montants: devis.montants,
        conversation: devis.conversation
      }
    });

  } catch (error) {
    console.error('❌ Erreur sauvegarde étape:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde',
      error: error.message
    });
  }
};

// ============================================
// 3. SOUMETTRE LE DEVIS (Finaliser)
// ============================================
exports.soumettre = async (req, res) => {
  try {
    const { devisId } = req.params;

    const devis = await Devis.findById(devisId);
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    if (devis.clientId.toString() !== req.clientId) {
      return res.status(403).json({
        success: false,
        message: '❌ Non autorisé'
      });
    }

    // Vérifier que le devis est complet
    if (!devis.evenement.type || !devis.evenement.date) {
      return res.status(400).json({
        success: false,
        message: '❌ Devis incomplet. Veuillez remplir toutes les étapes obligatoires.'
      });
    }

    // Changer le statut
    devis.statut = 'soumis';
    devis.etapeActuelle = 'termine';
    devis.progressionPourcentage = 100;
    devis.dates.soumission = new Date();

    // Recalculer une dernière fois
    devis.calculerMontants();

    // Historique
    devis.ajouterHistorique('soumission', 'client', req.clientId, 'Devis soumis pour validation admin');
    devis.ajouterConversation('validation', 'system', 'Votre devis a été soumis! Notre équipe va l\'étudier sous 48h.');

    await devis.save();

    // Incrémenter le compteur du client
    await Client.findByIdAndUpdate(req.clientId, {
      $inc: { nombreDevis: 1 }
    });

    // Envoyer email de confirmation au client
    const client = await Client.findById(req.clientId);
    try {
      await sendEmail({
        to: client.email,
        subject: `📋 Devis ${devis.numeroDevis} soumis`,
        html: `
          <h2>Votre devis a été soumis!</h2>
          <p>Bonjour ${client.prenom},</p>
          <p>Votre devis <strong>${devis.numeroDevis}</strong> a bien été enregistré.</p>
          <p><strong>Événement:</strong> ${devis.evenement.type} - ${devis.evenement.titre}</p>
          <p><strong>Date:</strong> ${new Date(devis.evenement.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Montant estimé:</strong> ${devis.montants.totalTTC.toFixed(2)} €</p>
          <p>Notre équipe va étudier votre demande et vous recontacter sous 48h.</p>
          <a href="${process.env.FRONTEND_URL}/client/devis/${devis._id}">Voir mon devis</a>
        `
      });
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    res.json({
      success: true,
      message: '✅ Devis soumis avec succès!',
      devis: {
        _id: devis._id,
        numeroDevis: devis.numeroDevis,
        statut: devis.statut,
        montants: devis.montants
      }
    });

  } catch (error) {
    console.error('❌ Erreur soumission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la soumission',
      error: error.message
    });
  }
};

// ============================================
// 4. LISTER MES DEVIS (Client)
// ============================================
exports.mesDevis = async (req, res) => {
  try {
    const { statut, page = 1, limit = 100 } = req.query; // Augmenter la limite pour voir tous les devis

    console.log('📋 Récupération devis pour client:', req.clientId);

    const query = { clientId: req.clientId };
    if (statut) {
      query.statut = statut;
    }

    const devis = await Devis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('prestations.prestation', 'nom prix categorie')
      .select('numeroDevis evenement statut montants prestations dateCreation createdAt progressionPourcentage etapeActuelle');

    console.log(`✅ ${devis.length} devis trouvés`);

    const total = await Devis.countDocuments(query);

    res.json({
      success: true,
      devis,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur liste devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devis',
      error: error.message
    });
  }
};

// ============================================
// 5. DÉTAILS D'UN DEVIS (Client)
// ============================================
exports.detailsDevis = async (req, res) => {
  try {
    const { devisId } = req.params;

    const devis = await Devis.findById(devisId)
      .populate('prestations.prestation')
      .populate('prestations.prestataire')
      .populate('materiels.materiel')
      .populate('materiels.prestataire');

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    // Vérifier les droits (client propriétaire ou admin)
    if (devis.clientId.toString() !== req.clientId && !req.adminId) {
      return res.status(403).json({
        success: false,
        message: '❌ Non autorisé'
      });
    }

    res.json({
      success: true,
      devis
    });

  } catch (error) {
    console.error('❌ Erreur détails devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du devis',
      error: error.message
    });
  }
};

// ============================================
// 6. ADMIN: LISTER TOUS LES DEVIS
// ============================================
exports.listerTous = async (req, res) => {
  try {
    const { statut, page = 1, limit = 20, search } = req.query;

    const query = {};
    
    if (statut) {
      query.statut = statut;
    }

    if (search) {
      query.$or = [
        { numeroDevis: new RegExp(search, 'i') },
        { 'client.nom': new RegExp(search, 'i') },
        { 'client.prenom': new RegExp(search, 'i') },
        { 'client.email': new RegExp(search, 'i') }
      ];
    }

    const devis = await Devis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('clientId', 'prenom nom email');

    const total = await Devis.countDocuments(query);

    res.json({
      success: true,
      devis,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erreur liste admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message
    });
  }
};

// ============================================
// 7. ADMIN: CHANGER STATUT D'UN DEVIS
// ============================================
exports.changerStatut = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { statut } = req.body;

    console.log(`🔄 Changement statut devis ${devisId} → ${statut}`);

    const devisValides = [
      'brouillon', 'soumis', 'en_etude', 'modifie_admin',
      'attente_validation_client', 'valide_client', 'accepte',
      'entretien_prevu', 'entretien_effectue', 'devis_final',
      'transforme_contrat', 'contrat_signe', 'valide_final',
      'refuse', 'expire', 'annule'
    ];
    
    if (!statut || !devisValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `❌ Statut invalide. Doit être: ${devisValides.join(', ')}`
      });
    }

    const devis = await Devis.findById(devisId);

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    const ancienStatut = devis.statut;
    devis.statut = statut;

    // Mettre à jour les dates selon le statut
    if (statut === 'accepte' && !devis.dates.validationAdmin) {
      devis.dates.validationAdmin = new Date();
    }

    // Ajouter dans l'historique
    if (devis.ajouterHistorique) {
      devis.ajouterHistorique(
        'changement_statut',
        'admin',
        req.adminId,
        `Statut changé: ${ancienStatut} → ${statut}`
      );
    }

    await devis.save();

    console.log(`✅ Statut changé: ${ancienStatut} → ${statut}`);

    res.json({
      success: true,
      message: `✅ Statut changé en "${statut}"`,
      devis: {
        _id: devis._id,
        numeroDevis: devis.numeroDevis,
        ancienStatut,
        nouveauStatut: statut
      }
    });

  } catch (error) {
    console.error('❌ Erreur changement statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
};

// ============================================
// 8. ADMIN: VALIDER/MODIFIER UN DEVIS
// ============================================
exports.validerModifier = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { action, message, modifications, nouveauMontant, justification } = req.body;

    const devis = await Devis.findById(devisId).populate('clientId');

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    // Ajouter la réponse admin
    devis.reponsesAdmin.push({
      adminId: req.adminId,
      message,
      type: action,
      modificationsProposees: modifications,
      nouveauMontant,
      justification
    });

    // Changer le statut selon l'action
    switch(action) {
      case 'validation':
        devis.statut = 'accepte';
        devis.dates.validationAdmin = new Date();
        
        // 🎯 AUTO-PROMOTION: Prospect → Client quand devis validé
        const client = await Client.findById(devis.clientId._id || devis.clientId);
        if (client && client.role === 'prospect') {
          const wasPromoted = await client.promoteToClient();
          if (wasPromoted) {
            console.log(`✅ Client promu: ${client.email} (prospect → client)`);
            devis.ajouterHistorique(
              'promotion_client',
              'system',
              req.adminId,
              `🎉 Promotion automatique: prospect → client suite à validation du devis`
            );
          }
        }
        break;

      case 'proposition':
        devis.statut = 'modifie_admin';
        
        // Si nouveau montant proposé
        if (nouveauMontant) {
          devis.montants.totalFinal = nouveauMontant;
          devis.calculerMontants();
        }
        break;

      case 'refus':
        devis.statut = 'refuse';
        break;

      default:
        devis.statut = 'en_etude';
    }

    devis.ajouterHistorique('reponse_admin', 'admin', req.adminId, `Admin: ${action} - ${message}`);

    await devis.save();

    // Envoyer email au client
    try {
      await sendEmail({
        to: devis.clientId.email,
        subject: `📋 Mise à jour de votre devis ${devis.numeroDevis}`,
        html: `
          <h2>Votre devis a été étudié</h2>
          <p>Bonjour ${devis.client.prenom},</p>
          <p>${message}</p>
          ${modifications ? `<p><strong>Modifications proposées:</strong><br>${modifications}</p>` : ''}
          ${nouveauMontant ? `<p><strong>Nouveau montant:</strong> ${nouveauMontant.toFixed(2)} €</p>` : ''}
          <a href="${process.env.FRONTEND_URL}/client/devis/${devis._id}">Voir les détails</a>
        `
      });
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    res.json({
      success: true,
      message: '✅ Devis mis à jour',
      devis
    });

  } catch (error) {
    console.error('❌ Erreur validation admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation',
      error: error.message
    });
  }
};

// ============================================
// 8. CLIENT: VALIDER LES MODIFICATIONS
// ============================================
exports.validerModifications = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { accepte } = req.body;

    const devis = await Devis.findById(devisId);

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    if (devis.clientId.toString() !== req.clientId) {
      return res.status(403).json({
        success: false,
        message: '❌ Non autorisé'
      });
    }

    if (accepte) {
      devis.statut = 'valide_client';
      devis.dates.validationClient = new Date();
      devis.ajouterHistorique('validation_client', 'client', req.clientId, 'Client a validé les modifications');
    } else {
      devis.statut = 'refuse';
      devis.ajouterHistorique('refus_client', 'client', req.clientId, 'Client a refusé les modifications');
    }

    await devis.save();

    res.json({
      success: true,
      message: accepte ? '✅ Modifications validées' : '❌ Devis refusé',
      devis
    });

  } catch (error) {
    console.error('❌ Erreur validation client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation',
      error: error.message
    });
  }
};

// ============================================
// 9. TRANSFORMER EN CONTRAT
// ============================================
exports.transformerEnContrat = async (req, res) => {
  try {
    const { devisId } = req.params;

    const devis = await Devis.findById(devisId);

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    // Transformer
    const numeroContrat = await devis.transformerEnContrat();
    await devis.save();

    res.json({
      success: true,
      message: '✅ Devis transformé en contrat',
      numeroContrat,
      devis
    });

  } catch (error) {
    console.error('❌ Erreur transformation:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
};

// ============================================
// 10. SIGNER LE CONTRAT
// ============================================
exports.signer = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { signatureData, partie, signataire, consentement } = req.body;

    const devis = await Devis.findById(devisId);

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    // Vérifier que c'est un contrat
    if (!devis.numeroContrat) {
      return res.status(400).json({
        success: false,
        message: '❌ Ce devis n\'a pas encore été transformé en contrat'
      });
    }

    // Enregistrer la signature
    devis.signer(partie, signatureData, signataire);

    // Si client, enregistrer le consentement
    if (partie === 'client' && consentement) {
      devis.signatures.client.consentement = consentement;
    }

    await devis.save();

    res.json({
      success: true,
      message: `✅ Signature ${partie} enregistrée`,
      devis
    });

  } catch (error) {
    console.error('❌ Erreur signature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la signature',
      error: error.message
    });
  }
};

// ============================================
// 11. PLANIFIER ENTRETIEN
// ============================================
exports.planifierEntretien = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { date, lieu, lienVisio, dureeEstimee } = req.body;

    const devis = await Devis.findById(devisId).populate('clientId');

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    devis.entretien.dateConfirmee = date;
    devis.entretien.statut = 'planifie';
    devis.entretien.lieu = lieu;
    devis.entretien.lienVisio = lienVisio;
    devis.entretien.dureeEstimee = dureeEstimee;

    devis.ajouterHistorique('entretien_planifie', 'admin', req.adminId, `Entretien planifié le ${date}`);

    await devis.save();

    // Email au client
    try {
      await sendEmail({
        to: devis.clientId.email,
        subject: `📅 Entretien planifié - ${devis.numeroDevis}`,
        html: `
          <h2>Votre entretien a été planifié</h2>
          <p>Bonjour ${devis.client.prenom},</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleString('fr-FR')}</p>
          ${lieu ? `<p><strong>Lieu:</strong> ${lieu}</p>` : ''}
          ${lienVisio ? `<p><strong>Lien visio:</strong> <a href="${lienVisio}">${lienVisio}</a></p>` : ''}
          <p><strong>Durée estimée:</strong> ${dureeEstimee} minutes</p>
        `
      });
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    res.json({
      success: true,
      message: '✅ Entretien planifié',
      devis
    });

  } catch (error) {
    console.error('❌ Erreur planification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la planification',
      error: error.message
    });
  }
};

// ============================================
// 12. GÉNÉRER PDF DU DEVIS
// ============================================
exports.genererPDF = async (req, res) => {
  try {
    const { devisId } = req.params;
    
    // Récupérer le devis complet avec toutes les données
    const devis = await Devis.findById(devisId)
      .populate('prestations.prestation')
      .populate('materiels.materiel');
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }
    
    // Vérifier les droits d'accès (client propriétaire ou admin)
    if (req.clientId && devis.clientId.toString() !== req.clientId) {
      return res.status(403).json({
        success: false,
        message: '❌ Non autorisé'
      });
    }
    
    // Récupérer les paramètres du site
    const settings = await Settings.findOne() || {};
    
    // Générer le nom du fichier
    const filename = `devis-${devis.numeroDevis}.pdf`;
    const outputPath = path.join(__dirname, '../../uploads/devis', filename);
    
    console.log('📄 Génération PDF:', filename);
    
    // Générer le PDF avec les settings
    await pdfService.genererDevisPDF(devis, outputPath, settings);
    
    // Mettre à jour le devis avec l'URL du PDF
    devis.pdfUrl = `/uploads/devis/${filename}`;
    devis.pdfGenereAt = new Date();
    await devis.save();
    
    // Envoyer le fichier en téléchargement
    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('❌ Erreur téléchargement PDF:', err);
        res.status(500).json({
          success: false,
          message: 'Erreur lors du téléchargement du PDF',
          error: err.message
        });
      } else {
        console.log('✅ PDF téléchargé:', filename);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF',
      error: error.message
    });
  }
};

// ============================================
// 13. OBTENIR L'URL DU PDF (sans télécharger)
// ============================================
exports.obtenirUrlPDF = async (req, res) => {
  try {
    const { devisId } = req.params;
    
    const devis = await Devis.findById(devisId)
      .populate('prestations.prestation')
      .populate('materiels.materiel');
    
    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }
    
    // Vérifier les droits
    if (req.clientId && devis.clientId.toString() !== req.clientId) {
      return res.status(403).json({
        success: false,
        message: '❌ Non autorisé'
      });
    }
    
    // Si le PDF n'existe pas encore ou est obsolète, le générer
    if (!devis.pdfUrl || !devis.pdfGenereAt || 
        devis.updatedAt > devis.pdfGenereAt) {
      
      const filename = `devis-${devis.numeroDevis}.pdf`;
      const outputPath = path.join(__dirname, '../../uploads/devis', filename);
      
      await pdfService.genererDevisPDF(devis, outputPath);
      
      devis.pdfUrl = `/uploads/devis/${filename}`;
      devis.pdfGenereAt = new Date();
      await devis.save();
    }
    
    res.json({
      success: true,
      message: '✅ URL PDF générée',
      pdfUrl: devis.pdfUrl,
      numeroDevis: devis.numeroDevis
    });
    
  } catch (error) {
    console.error('❌ Erreur obtention URL PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'obtention de l\'URL du PDF',
      error: error.message
    });
  }
};

// ============================================
// ADMIN: MODIFIER UN DEVIS (PRESTATIONS + MONTANTS)
// ============================================
exports.modifierDevis = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { prestations, montants } = req.body;

    console.log(`✏️ Modification devis ${devisId}`);

    const devis = await Devis.findById(devisId);

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    // Mettre à jour les prestations
    if (prestations && Array.isArray(prestations)) {
      devis.prestations = prestations.map(p => ({
        designation: p.designation || '',
        quantite: parseFloat(p.quantite) || 1,
        prixUnitaireHT: parseFloat(p.prixUnitaireHT) || 0,
        remise: parseFloat(p.remise) || 0,
        tva: parseFloat(p.tva) || 20,
        montantHT: (parseFloat(p.prixUnitaireHT) || 0) * (parseFloat(p.quantite) || 1) * (1 - (parseFloat(p.remise) || 0) / 100),
        montantTTC: (parseFloat(p.prixUnitaireHT) || 0) * (parseFloat(p.quantite) || 1) * (1 - (parseFloat(p.remise) || 0) / 100) * (1 + (parseFloat(p.tva) || 20) / 100)
      }));
    }

    // Mettre à jour les montants
    if (montants) {
      devis.montants = {
        totalHT: parseFloat(montants.totalHT) || 0,
        totalTVA: parseFloat(montants.totalTVA) || 0,
        totalTTC: parseFloat(montants.totalTTC) || 0
      };
    }

    // Mettre le statut en brouillon si c'était un brouillon, sinon en_attente
    if (devis.statut === 'brouillon') {
      devis.statut = 'brouillon';
    } else {
      devis.statut = 'en_attente';
    }

    // Ajouter dans l'historique
    if (devis.ajouterHistorique) {
      devis.ajouterHistorique(
        'modification',
        'admin',
        req.adminId,
        `Devis modifié par l'admin - ${prestations?.length || 0} prestations`
      );
    }

    await devis.save();

    console.log(`✅ Devis ${devisId} modifié avec succès`);

    res.json({
      success: true,
      message: '✅ Devis modifié avec succès',
      devis: {
        _id: devis._id,
        numeroDevis: devis.numeroDevis,
        statut: devis.statut,
        prestations: devis.prestations,
        montants: devis.montants
      }
    });

  } catch (error) {
    console.error('❌ Erreur modification devis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du devis',
      error: error.message
    });
  }
};

// ============================================
// ADMIN: VALIDER ET ENVOYER LE DEVIS AU CLIENT
// ============================================
exports.validerEtEnvoyer = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { prestations, montants } = req.body;

    console.log(`✅ Validation et envoi devis ${devisId}`);

    const devis = await Devis.findById(devisId).populate('clientId', 'prenom nom email');

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    // Mettre à jour les prestations et montants si fournis
    if (prestations && Array.isArray(prestations)) {
      devis.prestations = prestations.map(p => ({
        designation: p.designation || '',
        quantite: parseFloat(p.quantite) || 1,
        prixUnitaireHT: parseFloat(p.prixUnitaireHT) || 0,
        remise: parseFloat(p.remise) || 0,
        tva: parseFloat(p.tva) || 20,
        montantHT: (parseFloat(p.prixUnitaireHT) || 0) * (parseFloat(p.quantite) || 1) * (1 - (parseFloat(p.remise) || 0) / 100),
        montantTTC: (parseFloat(p.prixUnitaireHT) || 0) * (parseFloat(p.quantite) || 1) * (1 - (parseFloat(p.remise) || 0) / 100) * (1 + (parseFloat(p.tva) || 20) / 100)
      }));
    }

    if (montants) {
      devis.montants = {
        totalHT: parseFloat(montants.totalHT) || 0,
        totalTVA: parseFloat(montants.totalTVA) || 0,
        totalTTC: parseFloat(montants.totalTTC) || 0
      };
    }

    // Changer le statut en "en_attente" (en attente de validation client)
    devis.statut = 'en_attente';
    devis.dates.validationAdmin = new Date();

    // Ajouter dans l'historique
    if (devis.ajouterHistorique) {
      devis.ajouterHistorique(
        'validation_admin',
        'admin',
        req.adminId,
        `Devis validé par l'admin et envoyé au client`
      );
    }

    await devis.save();

    // TODO: Envoyer email au client avec le devis PDF
    /* 
    const emailService = require('../config/email-brevo-api');
    await emailService.sendDevisValidePDF(
      devis.clientId.email,
      devis.clientId.prenom,
      devis.numeroDevis,
      devis.montants.totalTTC,
      devis._id
    );
    */

    console.log(`✅ Devis ${devisId} validé et envoyé au client ${devis.clientId?.email}`);

    res.json({
      success: true,
      message: '✅ Devis validé et envoyé au client',
      devis: {
        _id: devis._id,
        numeroDevis: devis.numeroDevis,
        statut: devis.statut,
        montants: devis.montants,
        clientEmail: devis.clientId?.email
      }
    });

  } catch (error) {
    console.error('❌ Erreur validation et envoi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du devis',
      error: error.message
    });
  }
};

// ============================================
// CLIENT: VALIDER OU RETOURNER UN DEVIS
// ============================================
exports.actionClient = async (req, res) => {
  try {
    const { devisId } = req.params;
    const { action, commentaire } = req.body; // action: 'valider' ou 'retourner'

    console.log(`🎯 Action client sur devis ${devisId}: ${action}`);

    const devis = await Devis.findById(devisId);

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: '❌ Devis non trouvé'
      });
    }

    // Vérifier que le devis appartient au client connecté
    if (devis.clientId.toString() !== req.clientId) {
      return res.status(403).json({
        success: false,
        message: '❌ Accès refusé'
      });
    }

    // Vérifier que le devis est en attente
    if (devis.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: '❌ Ce devis n\'est pas en attente de validation'
      });
    }

    if (action === 'valider') {
      // Client accepte le devis
      devis.statut = 'accepte';
      devis.dates.acceptationClient = new Date();
      
      if (devis.ajouterHistorique) {
        devis.ajouterHistorique(
          'acceptation_client',
          'client',
          req.clientId,
          'Devis accepté par le client'
        );
      }

      await devis.save();

      res.json({
        success: true,
        message: '✅ Devis accepté',
        devis: {
          _id: devis._id,
          numeroDevis: devis.numeroDevis,
          statut: devis.statut
        }
      });

    } else if (action === 'retourner') {
      // Client retourne le devis pour négociation
      devis.statut = 'retourne';
      devis.commentaireClient = commentaire || '';
      
      if (devis.ajouterHistorique) {
        devis.ajouterHistorique(
          'retour_client',
          'client',
          req.clientId,
          `Devis retourné par le client${commentaire ? ': ' + commentaire : ''}`
        );
      }

      await devis.save();

      res.json({
        success: true,
        message: '📤 Devis retourné pour négociation',
        devis: {
          _id: devis._id,
          numeroDevis: devis.numeroDevis,
          statut: devis.statut,
          commentaireClient: devis.commentaireClient
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        message: '❌ Action invalide. Utilisez "valider" ou "retourner"'
      });
    }

  } catch (error) {
    console.error('❌ Erreur action client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'action sur le devis',
      error: error.message
    });
  }
};

