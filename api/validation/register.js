const validator = require('validator');
const isEmpty = require('./is-empty');
const isString = require('./is-string');

module.exports = ({
  firstName, lastName, email, password, passwordConfirmation, phone,
}) => {
  const errors = {};

  // Check if first name is a string
  if (!isString(firstName)) {
    errors.firstName = 'First name must be a string';
  }

  // Check if first name length is valid
  if (isString(firstName) && !validator.isLength(firstName.trim(), { min: 2, max: 15 })) {
    errors.firstName = 'First name must be between 2 and 15 characters';
  }

  // Check if first name exists
  if (isEmpty(firstName)) {
    errors.firstName = 'First name field is required';
  }

  // Check if last name is a string
  if (!isString(lastName)) {
    errors.lastName = 'Last name must be a string';
  }

  // Check if last name length is valid
  if (isString(lastName) && !validator.isLength(lastName.trim(), { min: 2, max: 20 })) {
    errors.lastName = 'Last name must be between 2 and 20 characters';
  }

  // Check if last name exists
  if (isEmpty(lastName)) {
    errors.lastName = 'Last name field is required';
  }

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

  // Check if password length is valid
  if (isString(password) && !validator.isLength(password.trim(), { min: 4, max: 32 })) {
    errors.password = 'Password must be between 4 and 32 characters';
  }

  // Check if password exists
  if (isEmpty(password)) {
    errors.password = 'Password field is required';
  }

  // Check if password confirmation is a string
  if (!isString(passwordConfirmation)) {
    errors.passwordConfirmation = 'Password confirmation must be a string';
  }

  // Check if password confirmation exists
  if (isEmpty(passwordConfirmation)) {
    errors.passwordConfirmation = 'Password confirmation field is required';
  }

  // Check if password is equal to password confirmation
  if (!isEmpty(passwordConfirmation)
      && isString(passwordConfirmation)
      && isString(password)
      && !validator.equals(password, passwordConfirmation)) {
    errors.passwordConfirmation = 'Passwords must match';
  }

  // Check if phone is a string
  if (!isEmpty(phone) && !isString(phone)) {
    errors.phone = 'Phone must be a string';
  }

  // Check if phone is valid
  if (!isEmpty(phone) && isString(phone) && !validator.isMobilePhone(phone, 'pl-PL')) {
    errors.phone = 'Phone is invalid';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
