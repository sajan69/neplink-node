const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,      
  api_key: process.env.CLOUDINARY_API_KEY,           
  api_secret: process.env.CLOUDINARY_API_SECRET,     
});

// Set up Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'neplink-node/posts',       // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov','webp','heic'], // File formats allowed
  },
});

module.exports = { cloudinary, storage };
