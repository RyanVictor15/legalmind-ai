// server/config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta uploads existe
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Salva na pasta uploads
  },
  filename: (req, file, cb) => {
    // Cria um nome único para o arquivo não sobrescrever outros
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;