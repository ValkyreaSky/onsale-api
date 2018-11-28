const cloudinary = require('cloudinary');
const { cloudinaryApiKey, cloudinaryApiSecret, cloudinaryCloudName } = require('./keys');

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

module.exports = cloudinary;
