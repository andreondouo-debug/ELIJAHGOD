const Devis = require('../models/Devis');
const Prestataire = require('../models/Prestataire');
const Client = require('../models/Client');
const Prestation = require('../models/Prestation');
const Reservation = require('../models/Reservation');
const Temoignage = require('../models/Temoignage');

/**
 * 📊 GET /api/stats/admin
 * Toutes les statistiques du site (admin uniquement)
 */
exports.getStatsAdmin = async (req, res) => {
  try {
    const maintenant = new Date();
    const debutMoisActuel = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const debutMoisDernier = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
    const finMoisDernier = new Date(maintenant.getFullYear(), maintenant.getMonth(), 0, 23, 59, 59);
    const debutAnneeActuelle = new Date(maintenant.getFullYear(), 0, 1);

    // ─── DEVIS ─────────────────────────────────────────────────────────────
    const [
      totalDevis,
      devisParStatut,
      devisMoisActuel,
      devisMoisDernier,
      montantsDevis,
      devisParMois,
    ] = await Promise.all([
      Devis.countDocuments(),
      Devis.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Devis.countDocuments({ createdAt: { $gte: debutMoisActuel } }),
      Devis.countDocuments({ createdAt: { $gte: debutMoisDernier, $lte: finMoisDernier } }),
      Devis.aggregate([
        { $match: { statut: { $in: ['valide_final', 'contrat_signe', 'accepte', 'entretien_effectue', 'devis_final', 'transforme_contrat'] } } },
        { $group: {
          _id: null,
          totalTTC: { $sum: '$montants.totalTTC' },
          totalHT: { $sum: '$montants.totalFinal' },
          moyenneTTC: { $avg: '$montants.totalTTC' },
          count: { $sum: 1 }
        }}
      ]),
      Devis.aggregate([
        { $match: { createdAt: { $gte: debutAnneeActuelle } } },
        { $group: {
          _id: { mois: { $month: '$createdAt' }, annee: { $year: '$createdAt' } },
          count: { $sum: 1 },
          montantTotal: { $sum: '$montants.totalTTC' }
        }},
        { $sort: { '_id.annee': 1, '_id.mois': 1 } }
      ])
    ]);

    // Taux de conversion
    const devisAcceptes = devisParStatut.find(d => d._id === 'valide_final')?.count || 0
      + (devisParStatut.find(d => d._id === 'contrat_signe')?.count || 0);
    const devisSoumis = devisParStatut.filter(d =>
      !['brouillon'].includes(d._id)
    ).reduce((acc, d) => acc + d.count, 0);
    const tauxConversion = devisSoumis > 0 ? Math.round((devisAcceptes / devisSoumis) * 100) : 0;

    // Statuts groupés par catégorie
    const statutsMap = {};
    devisParStatut.forEach(d => { statutsMap[d._id] = d.count; });

    // ─── PRESTATAIRES ──────────────────────────────────────────────────────
    const [
      totalPrestataires,
      prestatairesActifs,
      prestatairesVerifies,
      prestatairesParCategorie,
      prestatairesParAbonnement,
      prestatairesNouveauxMois,
    ] = await Promise.all([
      Prestataire.countDocuments(),
      Prestataire.countDocuments({ estActif: true }),
      Prestataire.countDocuments({ estVerifie: true }),
      Prestataire.aggregate([
        { $group: { _id: '$categorie', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Prestataire.aggregate([
        { $group: { _id: '$typeAbonnement', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Prestataire.countDocuments({ createdAt: { $gte: debutMoisActuel } }),
    ]);

    // Top prestataires par note moyenne
    const topPrestataires = await Prestataire.aggregate([
      { $match: { 'avis.0': { $exists: true } } },
      { $addFields: { noteMoyenne: { $avg: '$avis.note' }, nombreAvis: { $size: '$avis' } } },
      { $sort: { noteMoyenne: -1, nombreAvis: -1 } },
      { $limit: 5 },
      { $project: { nomEntreprise: 1, categorie: 1, noteMoyenne: 1, nombreAvis: 1 } }
    ]);

    // ─── CLIENTS ───────────────────────────────────────────────────────────
    const [
      totalClients,
      clientsActifs,
      clientsParRole,
      clientsNouveauxMois,
      clientsNouveauxMoisDernier,
    ] = await Promise.all([
      Client.countDocuments(),
      Client.countDocuments({ estActif: true }),
      Client.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Client.countDocuments({ createdAt: { $gte: debutMoisActuel } }),
      Client.countDocuments({ createdAt: { $gte: debutMoisDernier, $lte: finMoisDernier } }),
    ]);

    // ─── PRESTATIONS ───────────────────────────────────────────────────────
    const [
      totalPrestations,
      prestationsActives,
      prestationsParCategorie,
      prestationPrixMoyen,
    ] = await Promise.all([
      Prestation.countDocuments(),
      Prestation.countDocuments({ estActive: true }),
      Prestation.aggregate([
        { $group: { _id: '$categorie', count: { $sum: 1 }, prixMoyen: { $avg: '$prixBase' } } },
        { $sort: { count: -1 } }
      ]),
      Prestation.aggregate([
        { $group: { _id: null, prixMoyen: { $avg: '$prixBase' }, prixMin: { $min: '$prixBase' }, prixMax: { $max: '$prixBase' } } }
      ])
    ]);

    // ─── RÉSERVATIONS ──────────────────────────────────────────────────────
    const [
      totalReservations,
      reservationsParStatut,
      reservationsMois,
    ] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } }
      ]),
      Reservation.countDocuments({ createdAt: { $gte: debutMoisActuel } }),
    ]);

    // ─── TÉMOIGNAGES ───────────────────────────────────────────────────────
    let totalTemoignages = 0;
    let temoignagesAffiches = 0;
    try {
      totalTemoignages = await Temoignage.countDocuments();
      temoignagesAffiches = await Temoignage.countDocuments({ afficher: true });
    } catch (e) {
      // Modèle optionnel
    }

    // ─── CHIFFRE D'AFFAIRES MENSUEL ────────────────────────────────────────
    const caMoisActuel = montantsDevis[0] ? Math.round(montantsDevis[0].totalTTC) : 0;

    // ─── RÉPONSE ───────────────────────────────────────────────────────────
    res.json({
      succes: true,
      genereLe: maintenant.toISOString(),
      devis: {
        total: totalDevis,
        parStatut: statutsMap,
        moisActuel: devisMoisActuel,
        moisDernier: devisMoisDernier,
        tauxConversion: tauxConversion,
        montantTotalTTC: caMoisActuel,
        montantTotal: montantsDevis[0] ? Math.round(montantsDevis[0].totalHT) : 0,
        montantMoyen: montantsDevis[0] ? Math.round(montantsDevis[0].moyenneTTC) : 0,
        parMois: devisParMois
      },
      prestataires: {
        total: totalPrestataires,
        actifs: prestatairesActifs,
        inactifs: totalPrestataires - prestatairesActifs,
        verifies: prestatairesVerifies,
        nonVerifies: totalPrestataires - prestatairesVerifies,
        parCategorie: prestatairesParCategorie,
        parAbonnement: prestatairesParAbonnement,
        nouveauxCeMois: prestatairesNouveauxMois,
        top5: topPrestataires
      },
      clients: {
        total: totalClients,
        actifs: clientsActifs,
        inactifs: totalClients - clientsActifs,
        parRole: clientsParRole,
        nouveauxCeMois: clientsNouveauxMois,
        nouveauxMoisDernier: clientsNouveauxMoisDernier,
        croissance: clientsNouveauxMoisDernier > 0
          ? Math.round(((clientsNouveauxMois - clientsNouveauxMoisDernier) / clientsNouveauxMoisDernier) * 100)
          : 0
      },
      prestations: {
        total: totalPrestations,
        actives: prestationsActives,
        inactives: totalPrestations - prestationsActives,
        parCategorie: prestationsParCategorie,
        prixMoyen: prestationPrixMoyen[0] ? Math.round(prestationPrixMoyen[0].prixMoyen) : 0,
        prixMin: prestationPrixMoyen[0] ? Math.round(prestationPrixMoyen[0].prixMin) : 0,
        prixMax: prestationPrixMoyen[0] ? Math.round(prestationPrixMoyen[0].prixMax) : 0,
      },
      reservations: {
        total: totalReservations,
        parStatut: (() => {
          const m = {};
          reservationsParStatut.forEach(r => { m[r._id] = r.count; });
          return m;
        })(),
        moisActuel: reservationsMois
      },
      temoignages: {
        total: totalTemoignages,
        affiches: temoignagesAffiches,
        enAttente: totalTemoignages - temoignagesAffiches
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur récupération statistiques :', erreur);
    res.status(500).json({
      succes: false,
      message: '❌ Erreur lors de la récupération des statistiques',
      erreur: erreur.message
    });
  }
};
