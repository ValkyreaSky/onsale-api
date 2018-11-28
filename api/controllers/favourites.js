const User = require('../models/User');
const Ad = require('../models/Ad');
const ObjectId = require('mongoose').Types.ObjectId;
const BadRequestError = require('../../errors/BadRequestError');
const ApplicationError = require('../../errors/ApplicationError');
const NotFoundError = require('../../errors/ApplicationError');

const getFavourites = (req, res) => {
  return User.findById(req.user.id)
    // Select only favourites
    .select('favourites -_id')
    // Populate favourites property by title, image and price
    .populate('favourites', ['title', 'image', 'price'])
    .exec((userSearchErr, existingUser) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (userSearchErr) return res.status(500).json(new ApplicationError());
      // Return favourites
      return res.json(existingUser.favourites);
    });
};

const addFavourite = (req, res) => {
  // Return error (400 Bad Request) if passed ID is not valid MongoDB ObjectID
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json(new BadRequestError('Invalid ad ID'));
  // Search for ad
  return Ad.findById(req.params.id)
    .exec((adSearchErr, existingAd) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (adSearchErr) return res.status(500).json(new ApplicationError());
      // Return error (404 Not Found) if ad with passed ID not exists
      if (!existingAd) return res.status(404).json(new NotFoundError('Ad not found'));
      // Search for user
      return User.findById(req.user.id)
        // Select only favourites
        .exec((userSearchErr, existingUser) => {
          // Return error (500 Internal Server Error) if something gone wrong
          if (userSearchErr) return res.status(500).json(new ApplicationError());
          // Return error (400 Bad Request) if ad already exists in favourites array
          if (existingUser.favourites.indexOf(existingAd.id) !== -1) {
            return res.status(400).json(new BadRequestError('Ad is already in favourites'));
          }
          // Add ad to favourites array
          existingUser.favourites.unshift(existingAd.id);
          // Save user in database
          return existingUser.save((userSaveErr, updatedUser) => {
            // Return error (500 Internal Server Error) if something gone wrong
            if (userSaveErr) return res.status(500).json(new ApplicationError());
            // Populate favourites property by title, image and price
            return updatedUser.populate('favourites', ['title', 'image', 'price'], (userPopulateErr, populatedUser) => {
              if (userPopulateErr) return res.status(500).json(new ApplicationError());
              // Return favourites
              return res.json(populatedUser.favourites);
            });
          });
        });
    });
};

const removeFavourite = (req, res) => {
  // Return error (400 Bad Request) if passed ID is not valid MongoDB ObjectID
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json(new BadRequestError('Invalid ad ID'));
  // Search for ad
  return Ad.findById(req.params.id)
    .exec((adSearchErr, existingAd) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (adSearchErr) return res.status(500).json(new ApplicationError());
      // Return error (404 Not Found) if there is not ad with passed ID
      if (!existingAd) return res.status(404).json(new NotFoundError('Ad not found'));
      // Search for user
      return User.findById(req.user.id)
        .exec((userSearchErr, existingUser) => {
          // Return error (500 Internal Server Error) if something gone wrong
          if (userSearchErr) return res.status(500).json(new ApplicationError());
          // Get favourite index
          const favouriteIndex = existingUser.favourites.indexOf(existingAd.id);
          // Return error (400 Bad Request) if ad not exists in favourites array
          if (favouriteIndex === -1) return res.status(400).json(new BadRequestError('Ad is not in favourites'));
          // Remove ad from favourites array
          existingUser.favourites.splice(favouriteIndex, 1);
          // Save user in database
          return existingUser.save((userSaveErr, updatedUser) => {
            // Return error (500 Internal Server Error) if something gone wrong
            if (userSaveErr) return res.status(500).json(new ApplicationError());
            // Populate favourites property by title, image and price
            return updatedUser.populate('favourites', ['title', 'image', 'price'], (userPopulateErr, populatedUser) => {
              // Return error (500 Internal Server Error) if something gone wrong
              if (userPopulateErr) return res.status(500).json(new ApplicationError());
              // Return favourites
              return res.json(populatedUser.favourites);
            });
          });
        });
    });
};

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
};
