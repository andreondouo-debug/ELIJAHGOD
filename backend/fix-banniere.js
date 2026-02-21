/**
 * Script rapide : met à jour la bannière hero avec une vraie image Pexels
 * Usage: MONGODB_URI="..." node fix-banniere.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://elijahgod-admin:cMabLtQSPgyEi2Ro@cluster0.ndhnhyc.mongodb.net/elijahgod?retryWrites=true&w=majority&appName=Cluster0';

// Belle image de soirée musicale / DJ (Pexels, libre de droits)
const BANNIERE_URL = 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';

async function fixBanniere() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connecté');

    const db = mongoose.connection.db;
    const result = await db.collection('settings').updateOne(
      {},
      {
        $set: {
          'entreprise.banniere': BANNIERE_URL,
          'entreprise.logo': '/images/logo.png'
        }
      },
      { upsert: false }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Bannière mise à jour :', BANNIERE_URL);
    } else {
      console.log('ℹ️  Aucun document modifié (settings existe ?)');
    }

  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté');
  }
}

fixBanniere();
