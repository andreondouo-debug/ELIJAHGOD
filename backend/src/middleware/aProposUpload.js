/**
 * 📸 MIDDLEWARE UPLOAD - Photos & Galerie "À propos"
 * Stockage sur Cloudinary (persistant même après redémarrage Render)
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Filtre images uniquement
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const mime = file.mimetype;
  if (allowed.test(file.originalname.split('.').pop().toLowerCase()) && mime.startsWith('image/'))
    cb(null, true);
  else
    cb(new Error('❌ Format non supporté. Utilisez : jpg, png, gif, webp'));
};

// --- Stockage Cloudinary : photo de profil ---
const storagePhoto = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'elijahgod/apropos/profil',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto' }]
  }
});

const uploadPhoto = multer({
  storage: storagePhoto,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
}).single('photo');

// --- Stockage Cloudinary : galerie réalisations ---
const storageGalerie = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'elijahgod/apropos/galerie',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
  }
});

const uploadGalerie = multer({
  storage: storageGalerie,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB par image
}).array('images', 20);

// Middleware de gestion d'erreurs
const handleUploadError = (err, req, res, next) => {
  console.error('❌ [aProposUpload] Erreur upload:', err?.message || err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ success: false, message: '❌ Fichier trop volumineux (max 15 Mo)' });
    return res.status(400).json({ success: false, message: `❌ Erreur upload : ${err.message}` });
  }
  if (err) return res.status(400).json({ success: false, message: err.message });
  next();
};

module.exports = { uploadPhoto, uploadGalerie, handleUploadError };
