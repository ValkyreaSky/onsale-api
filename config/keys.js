let keys;

switch (process.env.NODE_ENV) {
  case 'production':
  case 'travis':
    keys = require('./keys-prod');
    break;
  case 'test':
    keys = require('./keys-test');
    break;
  default:
    keys = require('./keys-dev');
    break;
}

module.exports = keys;
