const request = require('supertest');
const server = require('../server.js');
const { populateUsers } = require('./config/populate-users');
const populateAds = require('./config/populate-ads');

let existingUserToken;
let existingUserId;
let existingAdId;

beforeAll((done) => {
  populateUsers().then(({ token, id }) => {
    existingUserToken = token;
    existingUserId = id;
    done();
  });
});

beforeAll((done) => {
  populateAds(existingUserId).then((id) => {
    existingAdId = id;
    done();
  });
});

afterAll(() => {
  server.close();
});

describe('POST /favourites/:id', () => {
  it('should not add favourite when invalid ID was passed', (done) => {
    request(server)
      .post('/favourites/wrongId')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
  });

  it('should not add favourite when ad with passed ID not exists', (done) => {
    request(server)
      .post('/favourites/5b903b85d6a6d5b77cfc804f')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  it('should not add favourite when request is not authorized', (done) => {
    request(server)
      .post(`/favourites/${existingAdId}`)
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  it('should add favourite', (done) => {
    request(server)
      .post(`/favourites/${existingAdId}`)
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        done();
      });
  });

  it('should not add favourite when ad with passed ID is already in favourites', (done) => {
    request(server)
      .post(`/favourites/${existingAdId}`)
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBeDefined();
        done();
      });
  });
});

describe('GET /favourites', () => {
  it('should not return favourites array when request is not authorized', (done) => {
    request(server)
      .get('/favourites')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  it('should return favourites array', (done) => {
    request(server)
      .get('/favourites')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].image).toBeDefined();
        expect(response.body[0].title).toBeDefined();
        expect(response.body[0].price).toBeDefined();
        done();
      });
  });
});

describe('DELETE /favourites/:id', () => {
  it('should not remove favourite when invalid ID was passed', (done) => {
    request(server)
      .delete('/favourites/wrongId')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
  });

  it('should not remove favourite when ad with passed ID not exists', (done) => {
    request(server)
      .delete('/favourites/5b903b85d6a6d5b77cfc804f')
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  it('should not remove favourite when request is not authorized', (done) => {
    request(server)
      .delete(`/favourites/${existingAdId}`)
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  it('should remove favourite', (done) => {
    request(server)
      .delete(`/favourites/${existingAdId}`)
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
        request(server)
          .get('/favourites')
          .set('Authorization', `Bearer ${existingUserToken}`)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(0);
            done();
          });
      });
  });

  it('should not remove favourite when ad is not in favourites', (done) => {
    request(server)
      .delete(`/favourites/${existingAdId}`)
      .set('Authorization', `Bearer ${existingUserToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBeDefined();
        done();
      });
  });
});
