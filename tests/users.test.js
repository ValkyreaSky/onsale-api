const request = require('supertest');
const path = require('path');
const server = require('../server.js');
const cloudinary = require('../config/cloudinary');
const User = require('../api/models/User');
const Ad = require('../api/models/Ad');
const { populateUsers, existingUserRegisterData } = require('./config/populate-users');
const populateAds = require('./config/populate-ads');

let existingUserToken, existingUserId, imageId;
const correctUserRegisterData = {
  firstName: 'Test2',
  lastName: 'User2',
  email: 'test2@email.com',
  password: 'password00',
  passwordConfirmation: 'password00',
};
const correctLoginData = {
  email: correctUserRegisterData.email,
  password: correctUserRegisterData.password,
};

beforeAll((done) => {
  populateUsers().then(({ token, id }) => {
    existingUserToken = token;
    existingUserId = id;

    populateAds(existingUserId).then(() => {
      done();
    });
  });
});

afterAll(() => {
  server.close();
});

describe('POST /users/register', () => {
  it('should not register user when invalid data was passed', (done) => {
    request(server)
      .post('/users/register')
      .send({
        phone: 'invalid',
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.firstName).toBeDefined();
        expect(response.body.errors.lastName).toBeDefined();
        expect(response.body.errors.email).toBeDefined();
        expect(response.body.errors.password).toBeDefined();
        expect(response.body.errors.passwordConfirmation).toBeDefined();
        done();
      });
  });

  it('should not register user when invalid data was passed', (done) => {
    request(server)
      .post('/users/register')
      .send({
        email: 'invalidEmail',
        firstName: 'a',
        lastName: 'a',
        password: 'a',
        passwordConfirmation: 'b',
        phone: false,
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.firstName).toBeDefined();
        expect(response.body.errors.lastName).toBeDefined();
        expect(response.body.errors.email).toBeDefined();
        expect(response.body.errors.password).toBeDefined();
        expect(response.body.errors.passwordConfirmation).toBeDefined();
        done();
      });
  });

  it('should not register user when passed email is already in use', (done) => {
    request(server)
      .post('/users/register')
      .send(existingUserRegisterData)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.email).toBeDefined();
        done();
      });
  });

  it('should register user', (done) => {
    request(server)
      .post('/users/register')
      .send(correctUserRegisterData)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        User.find({}).then((users) => {
          expect(users.length).toBe(2);
          done();
        });
      });
  });
});

describe('POST /users/login', () => {
  it('should not login user when invalid data was passed', (done) => {
    request(server)
      .post('/users/login')
      .send({})
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.email).toBeDefined();
        expect(response.body.errors.password).toBeDefined();
        done();
      });
  });

  it('should not login user when invalid data was passed', (done) => {
    request(server)
      .post('/users/login')
      .send({
        email: 'invalidEmail',
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.email).toBeDefined();
        expect(response.body.errors.password).toBeDefined();
        done();
      });
  });

  it('should not login user when password of existing user is invalid', (done) => {
    request(server)
      .post('/users/login')
      .send({
        email: correctLoginData.email,
        password: 'wrongPassword',
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.password).toBeDefined();
        done();
      });
  });

  it('should not login user when user with passed email not exists', (done) => {
    request(server)
      .post('/users/login')
      .send({
        email: 'unexisting@user.com',
        password: correctLoginData.password,
      })
      .then((response) => {
        expect(response.statusCode).toBe(404);
        expect(response.body.errors.email).toBeDefined();
        done();
      });
  });

  it('should login user', (done) => {
    request(server)
      .post('/users/login')
      .send(correctLoginData)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toMatch(/Bearer [\w\d]+/);
        done();
      });
  });
});

describe('PATCH /users', () => {
  it('should not update user when request is not authenticated', (done) => {
    request(server)
      .patch('/users')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  it('should not update user when invalid data was passed', (done) => {
    request(server)
      .patch('/users')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .send({
        firstName: true,
        lastName: true,
        phone: true,
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.firstName).toBeDefined();
        expect(response.body.errors.lastName).toBeDefined();
        expect(response.body.errors.phone).toBeDefined();
        done();
      });
  });

  it('should not update user when invalid data was passed', (done) => {
    request(server)
      .patch('/users')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .send({
        firstName: 'a',
        lastName: 'a',
        phone: 'invalidPhone',
      })
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.firstName).toBeDefined();
        expect(response.body.errors.lastName).toBeDefined();
        expect(response.body.errors.phone).toBeDefined();
        done();
      });
  });

  it('should update user', (done) => {
    const lastName = 'changed';
    const firstName = 'changed';
    const phone = '600600600';
    request(server)
      .patch('/users')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .send({
        lastName,
        firstName,
        phone,
      })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.firstName).toBe(firstName);
        expect(response.body.lastName).toBe(lastName);
        expect(response.body.phone).toBe(phone);
        User.findOne({ email: existingUserRegisterData.email }).then((user) => {
          expect(user.firstName).toBe(firstName);
          expect(user.lastName).toBe(lastName);
          expect(user.phone).toBe(phone);
          done();
        });
      });
  });

  it('should not update user when invalid image was passed', (done) => {
    request(server)
      .patch('/users')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .attach('image', path.resolve('tests', 'config', 'invalid-image.jpg'))
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.image).toBeDefined();
        done();
      });
  });

  it('should update user with image', (done) => {
    request(server)
      .patch('/users')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .attach('image', path.resolve('tests', 'config', 'valid-image.png'))
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.image).toEqual(expect.not.stringContaining('user'));
        User.findOne({ email: existingUserRegisterData.email }).then((user) => {
          expect(user.image).toEqual(expect.not.stringContaining('user'));
          const r = /\d\/((.*)+)\.png/;
          imageId = r.exec(user.image)[1];
          cloudinary.v2.api.delete_resources(imageId, (imageRemoveErr) => {
            if (imageRemoveErr) console.log(imageRemoveErr);
            done();
          });
        });
      });
  });
});

describe('DELETE /users', () => {
  it('before delete there should be one user ad', (done) => {
    Ad.find({ owner: existingUserId }).then((ads) => {
      expect(ads.length).toBe(1);
      done();
    });
  });

  it('should not remove user when request is not authenticated', (done) => {
    request(server)
      .delete('/users')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  it('should remove user', (done) => {
    request(server)
      .delete('/users')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        User.findOne({ email: existingUserRegisterData.email }).then((user) => {
          expect(user).toBe(null);
          Ad.find({ owner: existingUserId }).then((ads) => {
            expect(ads.length).toBe(0);
            done();
          });
        });
      });
  });
});
