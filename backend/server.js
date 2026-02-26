require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// ========================================
// MIDDLEWARE
// ========================================

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://elijahgod.fr',
  'https://www.elijahgod.fr',
  'https://elijahgod-6nhp.vercel.app',
  'https://elijahgod.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (Postman, curl, mobile apps, etc.)
    if (!origin) return callback(null, true);
    // Autoriser tous les sous-domaines elijahgod.fr et elijahgod*.vercel.app
    const allowed =
      allowedOrigins.includes(origin) ||
      /^https?:\/\/([\w-]+\.)?elijahgod\.fr$/.test(origin) ||
      /^https:\/\/elijahgod[\w-]*\.vercel\.app$/.test(origin);
    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origine bloquée par CORS: ${origin}`);
      callback(new Error(`Origine non autorisée par CORS: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Traitement explicite des requêtes preflight OPTIONS
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Body Parser
app.use(express.json());

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));

// ========================================
// DATABASE CONNECTION
// ========================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté avec succès');

    // Migration : s'assurer que la bannière pointe vers une vraie image
    try {
      const Settings = require('./src/models/Settings');
      const settings = await Settings.findOne();
      const banniereCassee =
        !settings?.entreprise?.banniere ||
        settings.entreprise.banniere === '/images/banniere.jpg' ||
        settings.entreprise.banniere === '/images/banniere.svg';
      if (settings && banniereCassee) {
        const pexelsUrl = 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';
        settings.entreprise.banniere = pexelsUrl;
        settings.markModified('entreprise');
        await settings.save();
        console.log('🖼️  Migration bannière → Pexels URL');
      }
    } catch (migErr) {
      console.warn('⚠️  Migration bannière ignorée:', migErr.message);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    // Ne pas quitter - le serveur reste actif pour que Render détecte le port
  }
};

// ========================================
// ROUTES
// ========================================

// Health check
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = { 0: 'déconnecté', 1: 'connecté', 2: 'connexion...', 3: 'déconnexion...' };
  res.json({ 
    message: '✅ Backend ELIJAH\'GOD fonctionnel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: states[mongoState] || 'inconnu',
    mongoState
  });
});

// Test email
app.get('/api/test-email', async (req, res) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'elijahwebgod@gmail.com';
    const dest = process.env.ADMIN_EMAIL || emailFrom;

    const diag = {
      BREVO_API_KEY: apiKey ? `✅ (${apiKey.length} chars)` : '❌ MANQUANT',
      EMAIL_FROM: emailFrom,
      ADMIN_EMAIL: dest
    };

    if (!apiKey) return res.status(400).json({ success: false, diagnostic: diag, message: 'BREVO_API_KEY manquante sur Render' });

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        sender: { name: "ELIJAH'GOD Events", email: emailFrom },
        to: [{ email: dest }],
        subject: `✅ Test email ELIJAH'GOD — ${new Date().toLocaleString('fr-FR')}`,
        htmlContent: `<div style="font-family:Arial,sans-serif;padding:30px;background:#0d0d20;color:#fff;border-radius:12px;"><h2 style="color:#d4af37;">✅ Les emails fonctionnent !</h2><p>Configuration Brevo opérationnelle sur ELIJAH'GOD.</p></div>`
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ success: false, message: JSON.stringify(data), diagnostic: diag });
    res.json({ success: true, message: `📧 Email envoyé à ${dest}`, messageId: data.messageId, diagnostic: diag });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Routes API
app.use('/api/admin/auth', require('./src/routes/adminAuthRoutes')); // Authentification admin
app.use('/api/clients', require('./src/routes/clientRoutes'));
app.use('/api/settings', require('./src/routes/settingsRoutes'));
app.use('/api/prestations', require('./src/routes/prestationRoutes'));
app.use('/api/devis', require('./src/routes/devisRoutes'));
app.use('/api/planning', require('./src/routes/planningRoutes'));
app.use('/api/prestataires', require('./src/routes/prestataireRoutes'));
app.use('/api/materiel', require('./src/routes/materielRoutes'));
app.use('/api/users', require('./src/routes/userRoutes')); // Gestion utilisateurs (admin)
app.use('/api/temoignages', require('./src/routes/temoignageRoutes')); // Témoignages clients
app.use('/api/stats', require('./src/routes/statsRoutes')); // 📊 Statistiques admin

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    message: '🎵 Bienvenue sur l\'API ELIJAH\'GOD',
    version: '1.0.0'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route non trouvée' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ 
    message: '❌ Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`🚀 Serveur ELIJAH'GOD démarré sur le port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  // Connexion MongoDB après ouverture du port
  connectDB();
});

module.exports = app;
