const BadRequestError = require('./errors/BadRequestError');

module.exports = ((err, req, res, next) => {
  if (err instanceof SyntaxError && err.message.indexOf('JSON')) {
    return res.status(400).json(new BadRequestError('Invalid JSON syntax'));
  }
  return next();
});
