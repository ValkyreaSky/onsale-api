const validator = require('validator');
const isEmpty = require('./is-empty');
const isString = require('./is-string');

module.exports = ({ firstName, lastName, phone }) => {
  const errors = {};

  // Check if first name is a string
  if (!isEmpty(firstName) && !isString(firstName)) {
    errors.firstName = 'First name must be a string';
  }

  // Check if first name length is valid
  if (!isEmpty(firstName) && isString(firstName) && !validator.isLength(firstName.trim(), { min: 2, max: 15 })) {
    errors.firstName = 'First name must be between 2 and 15 characters';
  }

  // Check if last name is a string
  if (!isEmpty(lastName) && !isString(lastName)) {
    errors.lastName = 'Last name must be a string';
  }

  // Check if last name length is valid
  if (!isEmpty(lastName) && isString(lastName) && !validator.isLength(lastName.trim(), { min: 2, max: 20 })) {
    errors.lastName = 'Last name must be between 2 and 20 characters';
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
