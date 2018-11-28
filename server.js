const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const morgan = require('morgan');
const errorHandler = require('./error-handler');
const usersRoute = require('./api/routes/users');
const adsRoute = require('./api/routes/ads');
const favouritesRoute = require('./api/routes/favourites');
const defaultRoute = require('./api/routes/default');
const logger = require('./config/winston');
require('./config/mongoose');
require('./config/passport');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(errorHandler);
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined', { stream: logger.stream }));

app.use('/users', usersRoute);
app.use('/ads', adsRoute);
app.use('/favourites', favouritesRoute);
app.use('/', defaultRoute);

const server = app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});

module.exports = server;
