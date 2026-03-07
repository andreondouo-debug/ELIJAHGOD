/**
 * 📧 ENVOI D'EMAIL VIA BREVO API (HTTP port 443)
 * Fonctionne sur Render (SMTP bloqué, API HTTP non bloquée)
 * Variables Render :
 *   BREVO_API_KEY = clé API depuis brevo.com → Settings → SMTP & API → API Keys
 *   EMAIL_FROM    = contact@elijahgod.fr (domaine vérifié dans Brevo avec SPF+DKIM → évite les spams)
 *   ADMIN_EMAIL   = email admin pour les notifs
 */

const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'elijahwebgod@gmail.com';
  const senderName = "ELIJAH'GOD Events";

  if (!apiKey) {
    console.warn(`📭 Email non envoyé (BREVO_API_KEY manquante) : "${options.subject}" → ${options.to}`);
    return null;
  }

  const payload = {
    sender: { name: senderName, email: emailFrom },
    to: [{ email: options.to }],
    replyTo: { email: emailFrom, name: senderName },
    subject: options.subject,
    htmlContent: options.html || `<p>${options.text}</p>`,
    textContent: options.text || options.subject,
    headers: {
      'X-Mailer': 'ElijahGod-Mailer/1.0'
    }
  };

  // Pièces jointes (format Brevo : { content: base64, name: 'fichier.pdf' })
  if (options.attachments && options.attachments.length > 0) {
    payload.attachment = options.attachments.map(a => ({
      content: a.content, // base64 string
      name: a.name
    }));
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur Brevo API:', data);
      return null;
    }

    console.log(`📧 Email envoyé → ${options.to} | ${options.subject} | id: ${data.messageId}`);
    return data;
  } catch (error) {
    console.error('❌ Erreur sendEmail:', error.message);
    return null;
  }
};

module.exports = sendEmail;
