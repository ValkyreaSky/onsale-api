const multer = require('multer');
const path = require('path');
const fs = require('fs');

const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, next) => {
      const destinationDir = path.resolve(__dirname, '..', 'storage');
      // Create destination directory if it not exists
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir);
      }
      return next(null, destinationDir);
    },
    filename: (req, file, next) => {
      const extension = file.mimetype.split('/')[1];
      next(null, `${file.fieldname}-${Date.now()}.${extension}`);
    },
  }),
  fileFilter: (req, file, next) => {
    // Skip process if file not exists
    if (!file) {
      return next();
    }
    // Check if file to upload is supported ("jpg", "jpeg" or "png")
    const isImage = file.mimetype.startsWith('image/jpeg') || file.mimetype.startsWith('image/png');
    // Reject upload if file is not supported
    if (!isImage) {
      return next(new Error('Invalid file format'));
    }
    // Accept file
    return next(null, true);
  },
  limits: {
    // Set max file size to 500 kb
    fileSize: 500000,
  },
};

module.exports = multer(multerConfig);
