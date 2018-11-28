const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../../config/cloudinary');
const logger = require('../../config/winston');
const upload = require('../../config/multer').single('image');
const User = require('../models/User');
const Ad = require('../models/Ad');
const { secretOrKey } = require('../../config/keys');
const validateRegister = require('../validation/register');
const validateLogin = require('../validation/login');
const validateUpdateUser = require('../validation/update-user');
const isEmpty = require('../validation/is-empty');
const BadRequestError = require('../../errors/BadRequestError');
const ApplicationError = require('../../errors/ApplicationError');
const removeFile = require('../../utils/remove-file');

const registerUser = (req, res) => {
  // Check if register data is valid
  const { errors, isValid } = validateRegister(req.body);
  // Return errors (400 Bad Request) if register data is not valid
  if (!isValid) return res.status(400).json(new BadRequestError('Invalid register data', errors));
  // Get data from request body
  const {
    firstName, lastName, email, password, phone,
  } = req.body;
  // Check if email is in use
  return User.findOne({ email }, (userSearchErr, userFoundByEmail) => {
    // Return error (500 Internal Server Error) if something gone wrong
    if (userSearchErr) return res.status(500).json(new ApplicationError());
    // Return errors (400 Bad Request) if email is in use
    if (userFoundByEmail) {
      errors.email = 'Email is in use';
      return res.status(400).json(new BadRequestError('Invalid register data', errors));
    }
    // Create user instance
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });
    // If phone was passed, add it to user instance
    if (!isEmpty(phone)) newUser.phone = phone;
    // Generate salt
    return bcrypt.genSalt(10, (saltErr, salt) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (saltErr) return res.status(500).json(new ApplicationError());
      // Encrypt password
      return bcrypt.hash(newUser.password, salt, (hashErr, hash) => {
        // Return error (500 Internal Server Error) if something gone wrong
        if (hashErr) return res.status(500).json(new ApplicationError());
        // Before saving user replace password with encrypted password
        newUser.password = hash;
        // Save user in database
        return newUser.save((userSaveErr, createdUser) => {
          // Return error (500 Internal Server Error) if something gone wrong
          if (userSaveErr) {
            return res.status(500).json(new ApplicationError());
          }
          // Return user data
          return res.json(createdUser);
        });
      });
    });
  });
};

const loginUser = (req, res) => {
  // Check if login data is valid
  const { errors, isValid } = validateLogin(req.body);
  // Return errors (400 Bad Request) if login data is not valid
  if (!isValid) return res.status(400).json(new BadRequestError('Invalid login data', errors));
  // Get data from request body
  const { email, password } = req.body;
  // Check if user exists
  return User.findOne({ email }, (userSearchErr, existingUser) => {
    // Return error (500 Internal Server Error) if something gone wrong
    if (userSearchErr) return res.status(500).json(new ApplicationError());
    // Return errors (400 Bad Request) if user not exists
    if (!existingUser) {
      errors.email = 'User not found';
      return res.status(404).json(new BadRequestError('Invalid login data', errors));
    }
    // Match found user password with password sent in request body
    return bcrypt.compare(password, existingUser.password, (compareErr, isMatch) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (compareErr) return res.status(500).json(new ApplicationError());
      // If passwords maches, create JWT payload (this data will be encrypted in token)
      if (isMatch) {
        const payload = {
          id: existingUser.id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          phone: existingUser.phone,
          image: existingUser.image,
        };
        // Create JWT token
        return jwt.sign(payload, secretOrKey, { expiresIn: '1h' }, (jwtSignErr, token) => {
          // Return error (500 Internal Server Error) if something gone wrong
          if (jwtSignErr) return res.status(500).json(new ApplicationError());
          // Return JTW token
          return res.json({ token: `Bearer ${token}` });
        });
      }
      // Return errors (400 Bad Request) if password is incorrect
      errors.password = 'Password incorrect';
      return res.status(400).json(new BadRequestError('Invalid login data', errors));
    });
  });
};

const updateUser = (req, res) => {
  upload(req, res, (fileErr) => {
    // Check if update data is valid
    let { isValid } = validateUpdateUser(req.body);
    const { errors } = validateUpdateUser(req.body);
    // Check if image is valid
    if (fileErr) {
      isValid = false;
      errors.image = fileErr.message;
    }
    // Return errors (400 Bad Request) if update data is not valid
    if (!isValid) {
      // Remove file from server
      if (req.file) removeFile(req.file.path);
      return res.status(400).json(new BadRequestError('Invalid update data', errors));
    }
    // Get data from request body
    const {
      firstName, lastName, phone,
    } = req.body;
    // Create object that contains new data
    const newData = {};
    if (!isEmpty(firstName)) newData.firstName = firstName;
    if (!isEmpty(lastName)) newData.lastName = lastName;
    if (!isEmpty(phone)) newData.phone = phone;
    // Remove phone from user data when empty string was passed
    if (phone === '') newData.phone = null;
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
        // Add image to user data
        newData.image = uploadResult.secure_url;
        // Find and update user
        return User.findByIdAndUpdate(req.user.id, { $set: newData }, { new: true }, (userUpdateErr, updatedUser) => {
          // Return error (500 Internal Server Error) if something gone wrong
          if (userUpdateErr) return res.status(500).json(new ApplicationError());
          // Return user data
          return res.json(updatedUser);
        });
      });
    }
    // Find and update user
    return User.findByIdAndUpdate(req.user.id, { $set: newData }, { new: true }, (userUpdateErr, updatedUser) => {
      // Return error (500 Internal Server Error) if something gone wrong
      if (userUpdateErr) return res.status(500).json(new ApplicationError());
      // Return user data
      return res.json(updatedUser);
    });
  });
};

const removeUser = (req, res) => {
  return User.findByIdAndRemove(req.user.id, (userRemoveErr, removedUser) => {
    // Return error (500 Internal Server Error) if something gone wrong
    if (userRemoveErr) return res.status(500).json(new ApplicationError());
    // Remove all user ads
    return Ad.find({ owner: req.user.id })
      .deleteMany()
      .exec((removeErr) => {
        // Return error (500 Internal Server Error) if something gone wrong
        if (removeErr) return res.status(500).json(new ApplicationError());
        // Return removed user data
        return res.json(removedUser);
      });
  });
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  removeUser,
};
