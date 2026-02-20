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
    // Autoriser les requêtes sans origine (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origine bloquée par CORS: ${origin}`);
      callback(new Error(`Origine non autorisée par CORS: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
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
