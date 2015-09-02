'use strict';

var app = require('../..');
var request = require('supertest');

describe('Osm API:', function() {

  describe('GET /api/osms', function() {
    var osms;

    beforeEach(function(done) {
      request(app)
        .get('/api/osms')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          osms = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      osms.should.be.instanceOf(Array);
    });

  });

});
