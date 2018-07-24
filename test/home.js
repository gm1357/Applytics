process.env.NODE_ENV='test';

var app = require('../conf/express')();
var request = require('supertest')(app);

describe('#HomeController', () => {
    it('#teste de index', done => {
        request.get('/')
               .expect(200, done);
    });
});