const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig');

// Configure Multer with Cloudinary storage
const upload = multer({ storage });

module.exports = { upload };
