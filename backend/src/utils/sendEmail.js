const nodemailer = require('nodemailer');

/**
 * 📧 UTILITAIRE D'ENVOI D'EMAIL
 * Gmail via mot de passe d'application — port 465 (SSL) pour Render
 * Variables Render :
 *   EMAIL_USER     = elijahwebgod@gmail.com
 *   EMAIL_PASSWORD = mot de passe app Google (sans espaces)
 *   ADMIN_EMAIL    = email admin pour les notifs
 */

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.warn('⚠️ EMAIL_USER ou EMAIL_PASSWORD manquant — emails désactivés');
    return null;
  }

  // Port 465 + secure:true (SSL) — fonctionne sur Render contrairement au port 587
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 10000,  // 10s max pour la connexion
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

const sendEmail = async (options) => {
  const transporter = createTransporter();

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
    return null;
  }
};

module.exports = sendEmail;
