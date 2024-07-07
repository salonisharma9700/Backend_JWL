// backend/config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dahddkuei',
  api_key: '739925546548181',
  api_secret: '3Kah7aCCXOP7ThQHMeUxuA3lYcg'
});

module.exports = cloudinary;
