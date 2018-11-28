const ApplicationError = require('./ApplicationError');

module.exports = class UnauthorizedError extends ApplicationError {
  constructor(message) {
    super(message || 'Unauthorized', '401');
  }
};
