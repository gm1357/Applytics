process.env.NODE_ENV='test';

var app = require('../conf/express')();
var request = require('supertest')(app);
var Usuarios = require('../app/models/Usuario');
var Aplicativos = require('../app/models/Aplicativo');

describe('#DashboardController', function() {
    this.timeout(15000);
    var loginCookie;

    before(function() {
        Aplicativos.collection.drop();
        Usuarios.collection.drop();
    }); 

    it('#teste de index sem login', function(done) {
        request.get('/dashboard')
               .expect(302)
               .expect('Location', '/usuarios/login', done);
    });

    it('#teste de cadastro com dados válidos', function(done) {
        request.post('/usuarios').send({
                'nome': 'TESTER',
                'email': 'test@test.com',
                'nivel': 'Iniciante',
                'senha': 'test1234',
                'senha-confirm': 'test1234'
        }).expect(302)
        .expect('Location', '/', done);
    });

    it('#teste de login com dados válidos', function(done) {
        request.post('/usuarios/login').send({
                'email': 'test@test.com',
                'senha': 'test1234'
        }).expect(302)
        .expect('Location', '/dashboard')
        .end(function(err, res) {
            if (err) {
                throw err;
            }
            loginCookie = res.headers['set-cookie'];
            done();
        });
    });

    it('#teste de index com login e sem app cadastrado', function(done) {
        request.get('/dashboard')
               .set('cookie', loginCookie)
               .expect(302)
               .expect('Location', '/dashboard/novo', done);
    });

    it('#teste de cadastro de app sem nome', function(done) {
        request.post('/dashboard').send({
            'nome': '',
            'pais': 'Brasil',
            'views': 'teste',
            'categoria': 'E-commerce',
        })
        .set('cookie', loginCookie)
        .expect(302)
        .expect('Location', '/dashboard/novo', done);
    });

    it('#teste de cadastro de app sem pais', function(done) {
        request.post('/dashboard').send({
            'nome': 'TESTE-APP',
            'pais': '',
            'views': 'teste',
            'categoria': 'E-commerce',
        })
        .set('cookie', loginCookie)
        .expect(302)
        .expect('Location', '/dashboard/novo', done);
    });

    it('#teste de cadastro de app sem views', function(done) {
        request.post('/dashboard').send({
            'nome': 'TESTE-APP',
            'pais': '',
            'views': '',
            'categoria': 'E-commerce',
        })
        .set('cookie', loginCookie)
        .expect(302)
        .expect('Location', '/dashboard/novo', done);
    });

    it('#teste de cadastro de app sem categoria', function(done) {
        request.post('/dashboard').send({
            'nome': 'TESTE-APP',
            'pais': 'Brasil',
            'views': 'teste',
            'categoria': '',
        })
        .set('cookie', loginCookie)
        .expect(302)
        .expect('Location', '/dashboard/novo', done);
    });

    it('#teste de cadastro de app com dados válidos', function(done) {
        request.post('/dashboard').send({
            'nome': 'TESTE-APP',
            'pais': 'Brasil',
            'views': 'teste',
            'categoria': 'E-commerce',
        })
        .set('cookie', loginCookie)
        .expect(302)
        .expect('Location', '/dashboard', done);
    });

    it('#teste de index com login e com app cadastrado', function(done) {
        request.get('/dashboard')
               .set('cookie', loginCookie)
               .expect(200, done);
    });
});