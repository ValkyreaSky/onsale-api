const validator = require('validator');
const isEmpty = require('./is-empty');
const isString = require('./is-string');

module.exports = ({ email, password }) => {
  const errors = {};

  // Check if email is a string
  if (!isString(email)) {
    errors.email = 'Email must be a string';
  }

  // Check if email is valid
  if (isString(email) && !validator.isEmail(email)) {
    errors.email = 'Email is invalid';
  }

  // Check if email exists
  if (isEmpty(email)) {
    errors.email = 'Email field is required';
  }

  // Check if password is a string
  if (!isString(password)) {
    errors.password = 'Password must be a string';
  }

  // Check if password exists
  if (isEmpty(password)) {
    errors.password = 'Password field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
