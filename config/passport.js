const passport = require('passport');
const JtwStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { secretOrKey } = require('../config/keys');
const User = require('../api/models/User');
const UnauthorizedError = require('../errors/UnauthorizedError');

const opts = {
  secretOrKey,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

// Passport extracts JWT in the "Bearer" scheme from "Authorization" header
// and searches for user with ID same as ID from JWT payload
passport.use(new JtwStrategy(opts, (jwtPayload, done) => {
  User.findById(jwtPayload.id, (userSearchErr, existingUser) => {
    if (userSearchErr) return done(userSearchErr);
    if (!existingUser) return done(null, false);
    return done(null, existingUser);
  });
}));

// Custom Passport callback to handle authorization success or failure
const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(new UnauthorizedError('Invalid JWT'));
    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = { passport, requireAuth };
