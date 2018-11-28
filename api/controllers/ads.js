const cloudinary = require('../../config/cloudinary');
const logger = require('../../config/winston');
const upload = require('../../config/multer').single('image');
const Ad = require('../models/Ad');
const User = require('../models/User');
const validateAd = require('../validation/ad');
const validateAdSearch = require('../validation/ad-search');
const isEmpty = require('../validation/is-empty');
const categories = require('../categories');
const ObjectId = require('mongoose').Types.ObjectId;
const BadRequestError = require('../../errors/BadRequestError');
const ApplicationError = require('../../errors/ApplicationError');
const NotFoundError = require('../../errors/NotFoundError');
const UnauthorizedError = require('../../errors/UnauthorizedError');
const removeFile = require('../../utils/remove-file');

const createAd = (req, res) => {
  upload(req, res, (fileErr) => {
    // Check if ad data is valid
    let { isValid } = validateAd(req.body);
    const { errors } = validateAd(req.body);
    // Check if image is valid
    if (fileErr) {
      isValid = false;
      errors.image = fileErr.message;
    }
    // Return errors (400 Bad Request) if ad data is not valid
    if (!isValid) {
      // Remove file from server
      if (req.file) removeFile(req.file.path);
      return res.status(400).json(new BadRequestError('Invalid ad data', errors));
    }
    // Get data from request body
    const {
      isUsed, title, category, description, price, location, phone,
    } = req.body;
    // Create ad instance
    const newAd = new Ad({
      owner: req.user.id,
      isUsed,
      title,
      category,
      description,
      price,
      location,
    });
    // If phone was passed, add it to ad instance
    if (!isEmpty(phone)) newAd.phone = phone;
    // Check if user send image
    if (req.file) {
      // Upload image to Cloudinary
      return cloudinary.v2.uploader.upload(req.file.path, (uploadErr, uploadResult) => {
        // Remove file from server
        removeFile(req.file.path);
        // Return error (500 Internal Server Error) if something gone wrong
        if (uploadErr) {
          logger.error(`Cloudinary: ${uploadErr.message}`);
          return res.status(500).json(new ApplicationError());
        }
        // Add image to ad instance
        newAd.image = uploadResult.secure_url;
        // Save ad in database
        return newAd.save((adSaveErr, createdAd) => {
          // Return error (500 Internal Server Error) if something gone wrong
          if (adSaveErr) return res.status(500).json(new ApplicationError());
          // Return ad data
          return res.json(createdAd);
        });
      });
    }
    // Save ad in database
    return newAd.save((adSaveErr, createdAd) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (adSaveErr) return res.status(500).json(new ApplicationError());
      // Return ad data
      return res.json(createdAd);
    });
  });
};

const showUserAds = (req, res) => {
  // Return error (400 Bad Request) if passed ID is not valid MongoDB ObjectID
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json(new BadRequestError('Invalid user ID'));
  // Search for user
  return User.findById(req.params.id, (userSearchErr, existingUser) => {
    // Return error (500 Internal Server Error) if something gone wrong
    if (userSearchErr) return res.status(500).json(new ApplicationError());
    // Return error (404 Not Found) if there is not user with passed ID
    if (!existingUser) return res.status(404).json(new NotFoundError('User not found'));
    // Search for user ads
    return Ad.find({ owner: req.params.id })
      .sort([['creationDate', -1]])
      // Select only title, image and price
      .select('title price image')
      .exec((adSearchErr, existingAds) => {
        // Return error (500 Internal Server Error) if something gone wrong
        if (adSearchErr) return res.status(500).json(new ApplicationError());
        // Return user ads
        return res.json(existingAds);
      });
  });
};

const showAd = (req, res) => {
  // Return error (400 Bad Request) if passed ID is not valid MongoDB ObjectID
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json(new BadRequestError('Invalid ad ID'));
  // Search for ad
  return Ad.findById(req.params.id)
    // Populate owner property by email, register date, image and first name
    .populate('owner', ['email', 'registerDate', 'firstName', 'image'])
    .exec((adSearchErr, existingAd) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (adSearchErr) return res.status(500).json(new ApplicationError());
      // Return error (404 Not Found) if there is not ad with passed ID
      if (!existingAd) return res.status(404).json(new NotFoundError('Ad not found'));
      // Increment ad views by one
      existingAd.views++;
      // Save ad
      return existingAd.save((adSaveErr, updatedAd) => {
        // Return error (500 Internal Server Error) if something gone wrong
        if (adSaveErr) return res.status(500).json(new ApplicationError());
        // Return ad
        return res.json(updatedAd);
      });
    });
};

const removeAd = (req, res) => {
  // Return error (400 Bad Request) if passed ID is not valid MongoDB ObjectID
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json(new BadRequestError('Invalid ad ID'));
  // Search for ad
  return Ad.findById(req.params.id, (adSearchErr, existingAd) => {
    // Return error (500 Internal Server Error) if something gone wrong
    if (adSearchErr) return res.status(500).json(new ApplicationError());
    // Return error (404 Not Found) if there is not ad with passed ID
    if (!existingAd) return res.status(404).json(new NotFoundError('Ad not found'));
    // Return error (401 Unauthorized) if ad owner ID is not equal to current user ID
    if (existingAd.owner.toString() !== req.user.id) return res.status(401).json(new UnauthorizedError('You can only remove your ad'));
    // Remove ad
    return existingAd.remove((adRemoveErr, removedAd) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (adRemoveErr) return res.status(500).json(new ApplicationError());
      // Return removed ad
      return res.json(removedAd);
    });
  });
};

const showLastAds = (req, res) => {
  // Search for ads
  return Ad.find({})
    // Limit to 25 ads
    .limit(25)
    // Sort by date from most recent
    .sort({ creationDate: -1 })
    // Select only title, image and price
    .select('title price image')
    .exec((adSearchErr, existingAds) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (adSearchErr) return res.status(500).json(new ApplicationError());
      // Return last ads
      return res.json(existingAds);
    });
};

const showCategoryAds = (req, res) => {
  // Return error (400 Bad Request) if category ID is not valid
  if (!categories[req.params.id]) return res.status(400).json(new BadRequestError('Invalid category ID'));
  // Search for category ads
  return Ad.find({ category: req.params.id })
    // Select only title, image and price
    .select('title price image')
    .exec((adSearchErr, existingAds) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (adSearchErr) return res.status(500).json(new ApplicationError());
      // Return category ads
      return res.json(existingAds);
    });
};

const searchAd = (req, res) => {
  // Check if search data is valid
  const { isValid, errors } = validateAdSearch(req.query);
  // Return errors (400 Bad Request) if search data is not valid
  if (!isValid) return res.status(400).json(new BadRequestError('Invalid search data', errors));
  // Get query parameters
  const { location, title, category, maxPrice, minPrice } = req.query;
  // Create query (case insensitive)
  const query = { price: { $gte: 0 } };
  if (!isEmpty(title)) query.title = { $regex: title, $options: 'i' };
  if (!isEmpty(location)) query.location = { $regex: location, $options: 'i' };
  if (!isEmpty(category)) query.category = category;
  if (!isEmpty(maxPrice)) query.price.$lte = parseInt(maxPrice);
  if (!isEmpty(minPrice)) query.price.$gte = parseInt(minPrice);
  // Search for ads
  return Ad.find(query)
    // Select only title, image and price
    .select('title price image')
    .exec((adSearchErr, existingAds) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (adSearchErr) return res.status(500).json(new ApplicationError());
      // Return found ads
      return res.json(existingAds);
    });
};

module.exports = {
  createAd,
  showUserAds,
  showAd,
  removeAd,
  showLastAds,
  showCategoryAds,
  searchAd,
};
