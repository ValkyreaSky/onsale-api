module.exports = class ApplicationError extends Error {
  constructor(message, status) {
    super();
    this.status = status || '500';
    this.code = this.constructor.name;
    this.message = message || 'An unexpected error occurred';
  }
};
