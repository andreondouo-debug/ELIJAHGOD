const nodemailer = require('nodemailer');

/**
 * 📧 UTILITAIRE D'ENVOI D'EMAIL
 * Configuration Nodemailer pour les emails transactionnels
 */

// Créer le transporteur selon l'environnement
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Configuration production (ex: SendGrid, Mailgun, etc.)
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Configuration développement (Ethereal)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'test@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'test'
      }
    });
  }
};

/**
 * Envoyer un email
 * @param {Object} options - Options de l'email
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet
 * @param {string} options.text - Texte brut (optionnel)
 * @param {string} options.html - HTML (optionnel)
 * @returns {Promise<Object>} Info de l'email envoyé
 */
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.COMPANY_NAME || 'ElijahGod Events'} <${process.env.SMTP_FROM || 'noreply@elijahgod.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    console.log('📧 Email envoyé:', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId
    });

    // En dev, afficher le lien de prévisualisation Ethereal
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔗 Prévisualiser:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw error;
  }
};

module.exports = sendEmail;
