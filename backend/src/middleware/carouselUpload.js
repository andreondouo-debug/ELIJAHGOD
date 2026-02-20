/**
 * 📸 MIDDLEWARE UPLOAD - Image de fond du Carousel
 * Upload de la bannière de la Hero Section
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossier d'upload
const carouselDir = path.join(__dirname, '../../uploads/carousel');

if (!fs.existsSync(carouselDir)) fs.mkdirSync(carouselDir, { recursive: true });

// Filtre images uniquement
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;
  if (allowed.test(ext) && mime.startsWith('image/')) cb(null, true);
  else cb(new Error('❌ Format non supporté. Utilisez : jpg, png, gif, webp'));
};

const storageCarousel = multer.diskStorage({
  destination: (req, file, cb) => cb(null, carouselDir),
  filename: (req, file, cb) => {
    cb(null, `banniere-${Date.now()}${path.extname(file.originalname)}`);
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
