const mongoose = require('mongoose');
const { mongodbUri } = require('./keys');
const logger = require('./winston');

mongoose.connect(mongodbUri, { useNewUrlParser: true }, (mongodbConnectErr) => {
  if (mongodbConnectErr) {
    logger.error(mongodbConnectErr.stack);
  }
  logger.info('Connected to MongoDB');
});

// Get rid of "DeprecationWarning" error
// https://github.com/Automattic/mongoose/issues/6922#issue-354147871
mongoose.set('useFindAndModify', false);
