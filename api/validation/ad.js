const validator = require('validator');
const isEmpty = require('./is-empty');
const categories = require('../categories');
const isString = require('./is-string');
const isBool = require('./is-bool');
const isNumber = require('./is-number');

module.exports = function validateRegisterInput({
  title, description, category, price, location, isUsed, phone,
}) {
  const errors = {};

  // If request is send as "multipart/form-data", all values will be
  // available as string so try to convert them into Boolean and Number
  try {
    isUsed = JSON.parse(isUsed);
  } catch (e) {
    // console.log(e);
  }
  try {
    price = JSON.parse(price);
  } catch (e) {
    // console.log(e);
  }
  try {
    category = JSON.parse(category);
  } catch (e) {
    // console.log(e);
  }

  // Check if title is a string
  if (!isString(title)) {
    errors.title = 'Title must be a string';
  }

  // Check if title length is valid
  if (isString(title) && !validator.isLength(title.trim(), { min: 5, max: 70 })) {
    errors.title = 'Title must be between 5 and 70 characters';
  }

  // Check if title exists
  if (isEmpty(title)) {
    errors.title = 'Title field is required';
  }

  // Check if description is a string
  if (!isString(description)) {
    errors.description = 'Description must be a string';
  }

  // Check if description length is valid
  if (isString(description) && !validator.isLength(description.trim(), { min: 20, max: 2000 })) {
    errors.description = 'Description must be between 20 and 2000 characters';
  }

  // Check if description exists
  if (isEmpty(description)) {
    errors.description = 'Description field is required';
  }

  // Check if location is a string
  if (!isString(location)) {
    errors.location = 'Location must be a string';
  }

  // Check if location length is valid
  if (isString(location) && !validator.isLength(location.trim(), { min: 2, max: 20 })) {
    errors.location = 'Location must be between 2 and 20 characters';
  }

  // Check if location exists
  if (isEmpty(location)) {
    errors.location = 'Location field is required';
  }

  // Check if price is an number
  if (!isNumber(price)) {
    errors.price = 'Price must be an number';
  }

  // Check if price is valid
  if (isNumber(price) && price <= 0) {
    errors.price = 'Price can not be less or equal 0';
  }

  // Check if price exists
  if (isEmpty(price)) {
    errors.price = 'Price field is required';
  }

  // Check if isUsed is an boolean
  if (!isBool(isUsed)) {
    errors.isUsed = 'Condition must be an boolean';
  }

  // Check if isUsed exists
  if (isEmpty(isUsed)) {
    errors.isUsed = 'Condition field is required';
  }

  // Check if phone is a string
  if (!isEmpty(phone) && !isString(phone)) {
    errors.phone = 'Phone must be a string';
  }

  // Check if phone is valid
  if (!isEmpty(phone) && isString(phone) && !validator.isMobilePhone(phone, 'pl-PL')) {
    errors.phone = 'Phone is invalid';
  }

  // Check if category is an number
  if (!isNumber(category)) {
    errors.category = 'Category must be an number';
  }

  // Check if category is valid
  if (isNumber(category) && !categories[category]) {
    errors.category = 'Category is invalid';
  }

  // Check if category exists
  if (isEmpty(category)) {
    errors.category = 'Category field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
