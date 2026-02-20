/**
 * 📸 MIDDLEWARE UPLOAD - Images/Vidéos pour profils prestataires
 * Gère l'upload de médias vers le serveur local
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, '../../uploads/prestataires');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `prestataire-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtre pour accepter uniquement images et vidéos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|webm/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  const isImage = allowedImageTypes.test(extname.slice(1)) && mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname.slice(1)) && mimetype.startsWith('video/');
  if (isImage || isVideo) cb(null, true);
  else cb(new Error('❌ Format non supporté. Images: jpg,png,gif,webp. Vidéos: mp4,mov,avi,webm'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const uploadMultiple = upload.array('mediaFiles', 12);

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: '❌ Fichier trop volumineux (max 50MB)' });
    }
    return res.status(400).json({ success: false, message: `❌ Erreur d'upload: ${err.message}` });
  }
  if (err) return res.status(400).json({ success: false, message: err.message });
  next();
};

module.exports = {
  uploadMultiple,
  handleUploadError,
  uploadDir
};
