const fs = require('fs');
const logger = require('../config/winston');

module.exports = (filePath) => {
  return fs.unlink(filePath, (fileRemoveErr) => {
    if (fileRemoveErr) logger.error(fileRemoveErr.stack);
    else logger.info(`Removed ${filePath} file`);
  });
};
