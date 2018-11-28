const request = require('supertest');
const server = require('../server.js');

it('should response with 404 Not Found when when the request is not supported by any route', (done) => {
  request(server)
    .get(`/${Math.random().toString(16).substring(7)}`)
    .then((response) => {
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBeDefined();
      done();
    });
});
