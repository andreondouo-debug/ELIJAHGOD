/**
 * 📸 MIDDLEWARE UPLOAD - Images/Vidéos pour prestations
 * Stockage sur Cloudinary (persistant même après redémarrage Render)
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Filtre pour accepter uniquement images et vidéos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|webm/;
  const extname = file.originalname.split('.').pop().toLowerCase();
  const mimetype = file.mimetype;
  const isImage = allowedImageTypes.test(extname) && mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname) && mimetype.startsWith('video/');
  if (isImage || isVideo) cb(null, true);
  else cb(new Error('❌ Format non supporté. Images: jpg, png, gif, webp. Vidéos: mp4, mov, avi, webm'));
};

// Stockage Cloudinary — image principale
const storageImage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'elijahgod/prestations/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
  }
});

// Stockage Cloudinary — galerie (images + vidéos)
const storageGalerie = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'elijahgod/prestations/galerie',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'],
      transformation: isVideo ? [] : [{ width: 1200, crop: 'limit', quality: 'auto' }]
    };
  }
});

const uploadSingleImage = multer({
  storage: storageImage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
}).single('imagePrestation');

const uploadMultipleImages = multer({
  storage: storageGalerie,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
}).array('galerieImages', 10);

// Middleware de gestion d'erreurs
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ success: false, message: '❌ Fichier trop volumineux (max 50MB)' });
    if (err.code === 'LIMIT_FILE_COUNT')
      return res.status(400).json({ success: false, message: '❌ Trop de fichiers (max 10)' });
    return res.status(400).json({ success: false, message: `❌ Erreur d'upload: ${err.message}` });
  }
  if (err) return res.status(400).json({ success: false, message: err.message });
  next();
};

module.exports = { uploadSingleImage, uploadMultipleImages, handleUploadError };
