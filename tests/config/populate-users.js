const User = require('../../api/models/User');
const jwt = require('jsonwebtoken');
const { secretOrKey } = require('../../config/keys');

const userRegisterData = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@email.com',
  password: 'password00',
  passwordConfirmation: 'password00',
};

// This function clears Users collection, creates new user and returns its ID and JWT
const populateUsers = () => {
  return new Promise((resolve) => {
    User.deleteMany({}, (usersClearErr) => {
      if (usersClearErr) throw usersClearErr;
      const user = new User(userRegisterData);
      user.save((userSaveErr, createdUser) => {
        if (userSaveErr) throw userSaveErr;
        const userId = createdUser.id;
        jwt.sign({ id: userId }, secretOrKey, { expiresIn: '1h' }, (jwtSignErr, token) => {
          if (jwtSignErr) throw jwtSignErr;
          resolve({ token, id: createdUser.id });
        });
      });
    });
  });
};

module.exports = { populateUsers, existingUserRegisterData: userRegisterData };
