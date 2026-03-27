/**
 * ⏰ CRON - Rappels email événements
 * Vérifie toutes les heures les événements à venir
 * et envoie des emails de rappel selon la configuration
 */

const cron = require('node-cron');
const Evenement = require('../models/Evenement');
const Admin = require('../models/Admin');
const Prestataire = require('../models/Prestataire');
const sendEmail = require('../utils/sendEmail');

// Template HTML pour les rappels
function genererEmailRappel(evt, delaiJours) {
  const dateEvt = new Date(evt.dateDebut).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const lieu = evt.lieu
    ? [evt.lieu.nom, evt.lieu.adresse, evt.lieu.ville].filter(Boolean).join(', ')
    : 'Non défini';

  return {
    subject: `🔔 Rappel : "${evt.titre}" dans ${delaiJours} jour${delaiJours > 1 ? 's' : ''}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d20;border-radius:16px;overflow:hidden;border:1px solid rgba(212,175,55,0.2);">
        <div style="background:linear-gradient(135deg,${evt.couleur || '#667eea'},${evt.couleur || '#667eea'}88);padding:24px 30px;">
          <h1 style="color:#fff;margin:0;font-size:22px;">🔔 Rappel événement</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Dans ${delaiJours} jour${delaiJours > 1 ? 's' : ''}</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#d4af37;margin:0 0 16px;font-size:20px;">${evt.titre}</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#b0b0c8;font-size:14px;width:100px;">📅 Date</td>
              <td style="padding:8px 0;color:#f5f4fa;font-size:14px;">${dateEvt}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#b0b0c8;font-size:14px;">🕐 Horaire</td>
              <td style="padding:8px 0;color:#f5f4fa;font-size:14px;">${evt.heureDebut} – ${evt.heureFin}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#b0b0c8;font-size:14px;">📍 Lieu</td>
              <td style="padding:8px 0;color:#f5f4fa;font-size:14px;">${lieu}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#b0b0c8;font-size:14px;">📊 Statut</td>
              <td style="padding:8px 0;color:#f5f4fa;font-size:14px;">${evt.statut.replace('_', ' ')}</td>
            </tr>
            ${evt.nbInvites ? `<tr><td style="padding:8px 0;color:#b0b0c8;font-size:14px;">👥 Invités</td><td style="padding:8px 0;color:#f5f4fa;font-size:14px;">${evt.nbInvites}</td></tr>` : ''}
          </table>
          ${evt.description ? `<p style="margin:16px 0 0;padding:12px;background:rgba(255,255,255,0.04);border-radius:8px;color:#c0c0d8;font-size:13px;">${evt.description}</p>` : ''}
        </div>
        <div style="padding:16px 30px;background:rgba(212,175,55,0.05);border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
          <p style="color:#b0b0c8;font-size:12px;margin:0;">ELIJAH'GOD Events — Rappel automatique</p>
        </div>
      </div>
    `
  };
}

// Récupérer l'email du créateur de l'événement
async function getCreateurEmail(creePar) {
  try {
    if (creePar.type === 'admin') {
      const admin = await Admin.findById(creePar.id).select('email');
      return admin?.email;
    } else if (creePar.type === 'prestataire') {
      const presta = await Prestataire.findById(creePar.id).select('email');
      return presta?.email;
    }
  } catch (e) {
    console.error('❌ Erreur récupération email créateur:', e.message);
  }
  return null;
}

// Logique principale de vérification et envoi
async function verifierEtEnvoyerRappels() {
  try {
    const maintenant = new Date();
    // Chercher les événements futurs non annulés/terminés
    const evenements = await Evenement.find({
      dateDebut: { $gte: maintenant },
      statut: { $nin: ['annule', 'termine'] }
    });

    let envois = 0;

    for (const evt of evenements) {
      const rappels = evt.rappels || { actif: true, delaiJours: 1, nombreRappels: 1, emailsEnvoyes: [] };
      if (!rappels.actif) continue;

      const delaiJours = rappels.delaiJours || 1;
      const nombreRappels = Math.min(rappels.nombreRappels || 1, 5);
      const emailsEnvoyes = rappels.emailsEnvoyes || [];

      // Calculer les jours de rappel : delai*1, delai*2, delai*3...
      for (let i = 0; i < nombreRappels; i++) {
        const jourRappel = delaiJours * (i + 1);

        // Vérifier si ce rappel a déjà été envoyé
        const dejaEnvoye = emailsEnvoyes.some(e => e.delaiJours === jourRappel);
        if (dejaEnvoye) continue;

        // Calculer la date seuil : l'événement est dans jourRappel jours ou moins
        const dateRappel = new Date(evt.dateDebut);
        dateRappel.setDate(dateRappel.getDate() - jourRappel);

        if (maintenant >= dateRappel) {
          // C'est le moment d'envoyer ce rappel
          const email = await getCreateurEmail(evt.creePar);
          if (!email) continue;

          const joursRestants = Math.ceil((new Date(evt.dateDebut) - maintenant) / (1000 * 60 * 60 * 24));
          const contenu = genererEmailRappel(evt, joursRestants > 0 ? joursRestants : jourRappel);

          const result = await sendEmail({
            to: email,
            subject: contenu.subject,
            html: contenu.html
          });

          if (result) {
            // Marquer ce rappel comme envoyé
            await Evenement.findByIdAndUpdate(evt._id, {
              $push: {
                'rappels.emailsEnvoyes': {
                  date: maintenant,
                  delaiJours: jourRappel,
                  destinataire: email
                }
              }
            });
            envois++;
            console.log(`🔔 Rappel envoyé → ${email} | "${evt.titre}" (J-${jourRappel})`);
          }
        }
      }
    }

    if (envois > 0) {
      console.log(`📬 ${envois} rappel(s) email envoyé(s)`);
    }
  } catch (error) {
    console.error('❌ Erreur cron rappels:', error.message);
  }
}

// Démarrer le cron (toutes les heures à :05)
function demarrerCronRappels() {
  cron.schedule('5 * * * *', () => {
    console.log('⏰ Vérification des rappels email...');
    verifierEtEnvoyerRappels();
  });

  console.log('✅ Cron rappels email activé (toutes les heures)');

  // Exécuter une première fois 30s après le démarrage
  setTimeout(() => {
    console.log('⏰ Première vérification des rappels...');
    verifierEtEnvoyerRappels();
  }, 30000);
}

module.exports = { demarrerCronRappels, verifierEtEnvoyerRappels };
