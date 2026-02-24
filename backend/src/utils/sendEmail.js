const nodemailer = require('nodemailer');

/**
 * 📧 UTILITAIRE D'ENVOI D'EMAIL
 * Gmail via mot de passe d'application (fonctionne sur Render/Vercel)
 * Variables Render à configurer :
 *   EMAIL_USER     = elijahwebgod@gmail.com
 *   EMAIL_PASSWORD = aoechtvcycuuejos   (mot de passe app Google sans espaces)
 *   ADMIN_EMAIL    = ton email admin pour les notifs
 */

// Créer le transporteur Gmail
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.warn('⚠️ EMAIL_USER ou EMAIL_PASSWORD manquant — emails désactivés');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

/**
 * Envoyer un email
 * @param {Object} options
 * @param {string} options.to       - Destinataire
 * @param {string} options.subject  - Sujet
 * @param {string} [options.text]   - Texte brut
 * @param {string} [options.html]   - HTML
 */
const sendEmail = async (options) => {
  const transporter = createTransporter();

  // Si pas de transporteur configuré, on log et on abandonne silencieusement
  if (!transporter) {
    console.warn(`📭 Email non envoyé (pas de config) : "${options.subject}" → ${options.to}`);
    return null;
  }

  const from = `ELIJAH'GOD Events <${process.env.EMAIL_USER}>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    });

    console.log(`📧 Email envoyé → ${options.to} | ${options.subject} | id: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message);
    // Ne pas throw — une erreur email ne doit jamais planter une action métier
    return null;
  }
};

module.exports = sendEmail;
