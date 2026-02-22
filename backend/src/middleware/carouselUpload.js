/**
 * 📸 MIDDLEWARE UPLOAD - Image de fond du Carousel
 * Stockage sur Cloudinary (persistant même après redémarrage Render)
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Filtre images uniquement
const fileFilter = (req, file, cb) => {
  const mime = file.mimetype;
  if (mime.startsWith('image/')) cb(null, true);
  else cb(new Error('❌ Format non supporté. Utilisez : jpg, png, gif, webp'));
};

const storageCarousel = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'elijahgod/carousel',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1920, crop: 'limit', quality: 'auto' }]
  }
});

const uploadCarousel = multer({
  storage: storageCarousel,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
}).single('banniere');

// Middleware de gestion d'erreurs
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ success: false, message: '❌ Fichier trop volumineux (max 20 Mo)' });
    return res.status(400).json({ success: false, message: `❌ Erreur upload : ${err.message}` });
  }
  if (err) return res.status(400).json({ success: false, message: err.message });
  next();
};

module.exports = { uploadCarousel, handleUploadError };
