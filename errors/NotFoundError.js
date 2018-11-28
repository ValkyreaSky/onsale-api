const ApplicationError = require('./ApplicationError');

module.exports = class NotFoundError extends ApplicationError {
  constructor(message) {
    super(message || 'Not found', '404');
  }
};
