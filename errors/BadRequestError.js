const ApplicationError = require('./ApplicationError');

module.exports = class BadRequestError extends ApplicationError {
  constructor(message, errors) {
    super(message || 'Bad request', '400');
    if (errors) this.errors = errors;
  }
};
