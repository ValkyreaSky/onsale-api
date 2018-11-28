const isEmpty = require('./is-empty');
const categories = require('../categories');

module.exports = ({ category, maxPrice, minPrice }) => {
  const errors = {};

  // Check if category is valid
  if (!isEmpty(category) && isEmpty(categories[category])) {
    errors.category = 'Category is invalid';
  }

  // Check if minimal price is an number
  if (!isEmpty(minPrice) && isNaN(parseInt(minPrice))) {
    errors.minPrice = 'Minimal price must be an number';
  }

  // Check if minimal price is valid
  if (!isEmpty(minPrice) && !isNaN(parseInt(minPrice)) && (parseInt(minPrice) < 0)) {
    errors.minPrice = 'Minimal price can not be less than 0';
  }

  // Check if maxiumum price is an number
  if (!isEmpty(maxPrice) && isNaN(parseInt(maxPrice))) {
    errors.maxPrice = 'Maximum price must be an number';
  }

  // Check if maxiumum price is valid
  if (!isEmpty(maxPrice) && !isNaN(parseInt(maxPrice)) && (parseInt(maxPrice) < 0)) {
    errors.maxPrice = 'Maximum price can not be less than 0';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
