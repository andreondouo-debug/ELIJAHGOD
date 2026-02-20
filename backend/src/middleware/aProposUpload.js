/**
 * 📸 MIDDLEWARE UPLOAD - Photos & Galerie "À propos"
 * Upload de la photo de profil et des images de réalisations
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossiers d'upload
const photoDir = path.join(__dirname, '../../uploads/apropos/photo');
const galerieDir = path.join(__dirname, '../../uploads/apropos/galerie');

[photoDir, galerieDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Filtre images uniquement
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;
  if (allowed.test(ext) && mime.startsWith('image/')) cb(null, true);
  else cb(new Error('❌ Format non supporté. Utilisez : jpg, png, gif, webp'));
};

// --- Upload photo de profil (1 seule image) ---
const storagePhoto = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photoDir),
  filename: (req, file, cb) => {
    cb(null, `profil-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadPhoto = multer({
  storage: storagePhoto,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
}).single('photo');

// --- Upload galerie (plusieurs images) ---
const storageGalerie = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galerieDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `realisation-${unique}${path.extname(file.originalname)}`);
  }
});

const uploadGalerie = multer({
  storage: storageGalerie,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB par image
}).array('images', 20); // max 20 images

// Middleware de gestion d'erreurs
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ success: false, message: '❌ Fichier trop volumineux' });
    return res.status(400).json({ success: false, message: `❌ Erreur upload: ${err.message}` });
  }
  if (err) return res.status(400).json({ success: false, message: err.message });
  next();
};

module.exports = { uploadPhoto, uploadGalerie, handleUploadError, photoDir, galerieDir };
