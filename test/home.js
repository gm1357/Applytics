process.env.NODE_ENV='test';

var app = require('../conf/express')();
var request = require('supertest')(app);

describe('#HomeController', function() {
    it('#teste de index', function(done) {
        request.get('/')
               .expect(200, done);
    });
});