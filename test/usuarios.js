process.env.NODE_ENV='test';

var app = require('../conf/express')();
var request = require('supertest')(app);
var Usuarios = require('../app/models/Usuario');

describe('#UsuariosController', function() {
    this.timeout(15000);

    before(function() {
        Usuarios.collection.drop();
    });    

    it('#teste de cadastro sem nome', function(done) {
        request.post('/usuarios').send({
                'nome': '',
                'email': 'test@test.com',
                'senha': 'test1234',
                'senha-confirm': 'test1234'
        }).expect(400, done);
    });

    it('#teste de cadastro com email inválido', function(done) {
        request.post('/usuarios').send({
                'nome': 'TESTER',
                'email': 'test',
                'senha': 'test1234',
                'senha-confirm': 'test1234'
        }).expect(400, done);
    });

    it('#teste de cadastro com senhas diferentes', function(done) {
        request.post('/usuarios').send({
                'nome': 'TESTER',
                'email': 'test@test.com',
                'senha': 'test1234',
                'senha-confirm': 'test'
        }).expect(400, done);
    });

    it('#teste de cadastro com dados válidos', function(done) {
        request.post('/usuarios').send({
                'nome': 'TESTER',
                'email': 'test@test.com',
                'senha': 'test1234',
                'senha-confirm': 'test1234'
        }).expect(302)
        .expect('Location', '/')
        .end(done);
    });

    it('#teste de cadastro com email já cadastrado', function(done) {
        request.post('/usuarios').send({
                'nome': 'TESTER',
                'email': 'test@test.com',
                'senha': 'test1234',
                'senha-confirm': 'test1234'
        }).expect(302)
        .expect('Location', '/usuarios/cadastro')
        .end(done);
    });

    it('#teste de login sem email', function(done) {
        request.post('/usuarios/login').send({
                'email': '',
                'senha': 'test1234'
        }).expect(400)
        .end(done);
    });

    it('#teste de login sem senha', function(done) {
        request.post('/usuarios/login').send({
                'email': 'test@test.com',
                'senha': ''
        }).expect(400)
        .end(done);
    });
    
    it('#teste de login com senha errada', function(done) {
        request.post('/usuarios/login').send({
                'email': 'test@test.com',
                'senha': 'test123'
        }).expect(302)
        .expect('Location', '/usuarios/login')
        .end(done);
    });

    it('#teste de login com email inexistente', function(done) {
        request.post('/usuarios/login').send({
                'email': 'test2@test.com',
                'senha': 'test1234'
        }).expect(302)
        .expect('Location', '/usuarios/login')
        .end(done);
    });

    it('#teste de login com dados válidos', function(done) {
        request.post('/usuarios/login').send({
                'email': 'test@test.com',
                'senha': 'test1234'
        }).expect(302)
        .expect('Location', '/dashboard')
        .end(done);
    });
});