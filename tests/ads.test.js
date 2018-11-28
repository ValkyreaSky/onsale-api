const request = require('supertest');
const path = require('path');
const server = require('../server.js');
const Ad = require('../api/models/Ad');
const { populateUsers } = require('./config/populate-users');
const clearAds = require('./config/clear-ads');
const populateAds = require('./config/populate-ads');
const cloudinary = require('../config/cloudinary');

let existingUserToken, existingUserId, existingAdId, imageId;
const correctAdCreateData = {
  title: 'In sagittis leo neque, sodales posuere enim luctus quis',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu vulputate nunc, quis molestie risus. Sed lacinia varius elit, vel fringilla mauris dignissim sed. Vivamus mauris arcu, tincidunt ac tortor sed, egestas faucibus purus. Pellentesque nulla odio, malesuada quis viverra a, porta sed odio. Maecenas sit amet nisl nulla. Nam tempus libero sem.',
  location: 'Consectetur',
  price: 100,
  isUsed: false,
  category: 2,
  phone: '601601601',
};

beforeAll((done) => {
  clearAds().then(() => {
    done();
  });
});

beforeAll((done) => {
  populateUsers().then(({ token, id }) => {
    existingUserToken = token;
    existingUserId = id;
    done();
  });
});

afterAll(() => {
  server.close();
});

describe('When database is not populated', () => {
  describe('GET /ads/last', () => {
    it('should return empty array', (done) => {
      request(server)
        .get('/ads/last')
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(0);
          done();
        });
    });
  });

  describe('GET /ads/category/:id', () => {
    it('should return empty array', (done) => {
      request(server)
        .get('/ads/category/2')
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(0);
          done();
        });
    });
  });

  describe('GET /ads/user/:id', () => {
    it('should return empty array', (done) => {
      request(server)
        .get(`/ads/user/${existingUserId}`)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(0);
          done();
        });
    });
  });

  describe('GET /ads/?title=:title&location=:location', () => {
    it('should return empty array', (done) => {
      request(server)
        .get('/ads')
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(0);
          done();
        });
    });
  });
});

describe('When database is populated', () => {
  beforeAll((done) => {
    populateAds(existingUserId).then((id) => {
      existingAdId = id;
      done();
    });
  });

  describe('GET /ads/last', () => {
    it('should return array of ads', (done) => {
      request(server)
        .get('/ads/last')
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(1);
          done();
        });
    });
  });

  describe('POST /ads', () => {
    it('should not create new ad when invalid data was passed', (done) => {
      request(server)
        .post('/ads')
        .set('Authorization', `Bearer ${existingUserToken}`)
        .send({
          phone: true,
        })
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body.errors.title).toBeDefined();
          expect(response.body.errors.description).toBeDefined();
          expect(response.body.errors.location).toBeDefined();
          expect(response.body.errors.price).toBeDefined();
          expect(response.body.errors.isUsed).toBeDefined();
          expect(response.body.errors.category).toBeDefined();
          expect(response.body.errors.phone).toBeDefined();
          done();
        });
    });

    it('should not create new ad when invalid data was passed', (done) => {
      request(server)
        .post('/ads')
        .set('Authorization', `Bearer ${existingUserToken}`)
        .send({
          title: 'a',
          description: 'a',
          location: 'a',
          price: -20,
          category: 9999,
          phone: 'invalid',
        })
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body.errors.title).toBeDefined();
          expect(response.body.errors.description).toBeDefined();
          expect(response.body.errors.location).toBeDefined();
          expect(response.body.errors.price).toBeDefined();
          expect(response.body.errors.isUsed).toBeDefined();
          expect(response.body.errors.category).toBeDefined();
          expect(response.body.errors.phone).toBeDefined();
          done();
        });
    });

    it('should not create new ad when request is not authorized', (done) => {
      request(server)
        .post('/ads')
        .send(correctAdCreateData)
        .then((response) => {
          expect(response.statusCode).toBe(401);
          done();
        });
    });

    it('should create new ad', (done) => {
      request(server)
        .post('/ads')
        .set('Authorization', `Bearer ${existingUserToken}`)
        .send(correctAdCreateData)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          Ad.find({}).then((ads) => {
            expect(ads.length).toBe(2);
            done();
          });
        });
    });

    it('should not create new ad when invalid image was passed', (done) => {
      request(server)
        .post('/ads')
        .set('Authorization', `Bearer ${existingUserToken}`)
        .field('title', correctAdCreateData.title)
        .field('description', correctAdCreateData.description)
        .field('location', correctAdCreateData.location)
        .field('price', correctAdCreateData.price)
        .field('category', correctAdCreateData.category)
        .field('phone', correctAdCreateData.phone)
        .field('isUsed', correctAdCreateData.isUsed)
        .attach('image', path.resolve('tests', 'config', 'invalid-image.jpg'))
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body.errors.image).toBeDefined();
          done();
        });
    });

    it('should create new ad with image', (done) => {
      request(server)
        .post('/ads')
        .set('Authorization', `Bearer ${existingUserToken}`)
        .field('title', correctAdCreateData.title)
        .field('description', correctAdCreateData.description)
        .field('location', correctAdCreateData.location)
        .field('price', correctAdCreateData.price)
        .field('category', correctAdCreateData.category)
        .field('phone', correctAdCreateData.phone)
        .field('isUsed', correctAdCreateData.isUsed)
        .attach('image', path.resolve('tests', 'config', 'valid-image.png'))
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.image).toEqual(expect.not.stringContaining('placeholder'));
          const r = /\d\/((.*)+)\.png/;
          imageId = r.exec(response.body.image)[1];
          Ad.find({}).then((ads) => {
            expect(ads.length).toBe(3);
            cloudinary.v2.api.delete_resources(imageId, (imageRemoveErr) => {
              if (imageRemoveErr) console.log(imageRemoveErr);
              done();
            });
          });
        });
    });
  });

  describe('GET /ads/:id', () => {
    it('should not return ad when invalid ID was passed', (done) => {
      request(server)
        .get('/ads/wrongId')
        .then((response) => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });

    it('should not return ad when ad with passed ID not exists', (done) => {
      request(server)
        .get('/ads/9b903b85d6a6d5b77cfc804f')
        .then((response) => {
          expect(response.statusCode).toBe(404);
          done();
        });
    });

    it('should return ad', (done) => {
      request(server)
        .get(`/ads/${existingAdId}`)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.image).toBeDefined();
          expect(response.body.title).toBeDefined();
          expect(response.body.description).toBeDefined();
          expect(response.body.location).toBeDefined();
          expect(response.body.price).toBeDefined();
          expect(response.body.isUsed).toBeDefined();
          expect(response.body.category).toBeDefined();
          expect(response.body.phone).toBeDefined();
          done();
        });
    });
  });

  describe('GET /ads/user/:id', () => {
    it('should not return ads when invalid ID was passed', (done) => {
      request(server)
        .get('/ads/user/wrongId')
        .then((response) => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });

    it('should not return ads when user with passed ID not exists', (done) => {
      request(server)
        .get('/ads/user/5b903b85d6a6d5b77cfc804f')
        .then((response) => {
          expect(response.statusCode).toBe(404);
          done();
        });
    });

    it('should return ads', (done) => {
      request(server)
        .get(`/ads/user/${existingUserId}`)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(3);
          done();
        });
    });
  });

  describe('GET /ads/category/:id', () => {
    it('should not return ads when invalid ID was passed', (done) => {
      request(server)
        .get('/ads/category/invalidId')
        .then((response) => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });

    it('should return ads', (done) => {
      request(server)
        .get('/ads/category/2')
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(3);
          done();
        });
    });
  });

  describe('GET /ads/?title=:title&location=:location...', () => {
    it('should response with 400 Bad Request when query parameters are not valid', (done) => {
      request(server)
        .get('/ads?minPrice=notANumber&category=invalidCategory&maxPrice=notANumber')
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body.errors).toBeDefined();
          done();
        });
    });

    it('should response with 400 Bad Request when query parameters are not valid', (done) => {
      request(server)
        .get('/ads?minPrice=-100&maxPrice=-100')
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body.errors).toBeDefined();
          done();
        });
    });

    it('should return all ads when no parameter was passed', (done) => {
      request(server)
        .get('/ads')
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(3);
          done();
        });
    });

    it('should return found ad', (done) => {
      request(server)
        .get(`/ads?category=${correctAdCreateData.category}&maxPrice=${correctAdCreateData.price}&minPrice=${correctAdCreateData.price}`)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(2);
          done();
        });
    });

    it('should search ads by location', (done) => {
      request(server)
        .get(`/ads?location=${correctAdCreateData.location}`)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(2);
          done();
        });
    });

    it('should search ads by title', (done) => {
      request(server)
        .get(`/ads?title=${correctAdCreateData.title}`)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(2);
          done();
        });
    });
  });

  describe('DELETE /ads/:id', () => {
    it('should not remove ad when invalid ID was passed', (done) => {
      request(server)
        .delete('/ads/wrongId')
        .set('Authorization', `Bearer ${existingUserToken}`)
        .then((response) => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });

    it('should not remove ad when ad with passed ID not exists', (done) => {
      request(server)
        .delete('/ads/9b903b85d6a6d5b77cfc804f')
        .set('Authorization', `Bearer ${existingUserToken}`)
        .then((response) => {
          expect(response.statusCode).toBe(404);
          done();
        });
    });

    it('should not remove ad when request is not authorized', (done) => {
      request(server)
        .delete(`/ads/${existingAdId}`)
        .then((response) => {
          expect(response.statusCode).toBe(401);
          done();
        });
    });

    it('should remove ad', (done) => {
      request(server)
        .delete(`/ads/${existingAdId}`)
        .set('Authorization', `Bearer ${existingUserToken}`)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          Ad.find({}).then((ads) => {
            expect(ads.length).toBe(2);
            done();
          });
        });
    });
  });
});
