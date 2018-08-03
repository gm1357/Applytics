var request = require("request");
var Categoria = require('../models/Categoria');
var Aplicativo = require('../models/Aplicativo');
var Usuario = require('../models/Usuario');
const { check, validationResult } = require('express-validator/check');

module.exports = function() {
    app.get('/dashboard', (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/usuarios/login');
            return;
        }

        if (req.user.app == null) {
            res.redirect('/dashboard/novo');
            return;
        }

        let message = req.flash('message');
        let dados = {};

        request({
            url: 'http://127.0.0.1:4000/'+req.user.app+'/usuarios',
            json: true
        }, function (error, response, dados_usuarios) {
            if (error) {
                throw error;
            }
            
            if (dados_usuarios.length) {
                dados.usuarios_totais = dados_usuarios.length;
                dados.usuarios_ativos_dia = [];
                dados.usuarios_ativos_semana = [];
                dados.usuarios_ativos_mes = [];
                dados.usuarios_ativos_ano = [];
                dados_usuarios.forEach(usuario => {
                    // console.log(moment().diff(usuario.visto_ultimo, 'hours'));
                    if (moment().diff(usuario.visto_ultimo, 'seconds') <= 24 * 60 * 60) {
                        dados.usuarios_ativos_dia.push(usuario); 
                    }

                    if (moment().diff(usuario.visto_ultimo, 'seconds') <= 7*24 * 60 * 60) {
                        dados.usuarios_ativos_semana.push(usuario); 
                    }

                    if (moment().diff(usuario.visto_ultimo, 'seconds') <= 30 * 24 * 60 * 60) {
                        dados.usuarios_ativos_mes.push(usuario); 
                    }

                    if (moment().diff(usuario.visto_ultimo, 'seconds') <= 365*24 * 60 * 60) {
                        dados.usuarios_ativos_ano.push(usuario); 
                    }
                });
            } else {
                dados.usuarios_totais = 0;
            }
            // console.log(dados_usuarios);
            
            res.render('dashboard/index', {appID: req.user.app, dados: dados, message: message});
        });
    });

    app.get('/dashboard/novo', (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/usuarios/login');
            return;
        }

        request({
            url: 'https://restcountries.eu/rest/v2/all?fields=translations;numericCode',
            json: true
        }, function (error, response, data) {
        
            if (!error && response.statusCode === 200) {

                Categoria.find(function(err, categorias) {
                    if (err) return console.error(err);
                    
                    var paises = [];
                    data.forEach(element => {
                        paises.push({id: element.numericCode, nome: element.translations.br});
                    });

                    res.render('dashboard/novoApp', {paises: paises, categorias: categorias, validationErrors: req.flash('validationErrors'), aplicativo: req.flash('aplicativo')});
                });
            }
        });
    });

    app.post('/dashboard',[
        check('nome').not().isEmpty().withMessage('Digite o nome do seu app'),
        check('pais').not().isEmpty().withMessage('Selecione o país base do seu app'),
        check('categoria').not().isEmpty().withMessage('Selecione uma categoria para seu app')
    ], (req, res) => {
        const errors = validationResult(req); 

        if (!errors.isEmpty()) { 
            res.format({ 
                html: () => { 
                    req.flash('validationErrors', errors.array());
                    req.flash('aplicativo', req.body);
                    res.redirect('/dashboard/novo'); 
                }, 
                json: () => { 
                    res.status(400); 
                    res.send(errors.array()); 
                } 
            }); 
            return; 
        } else {
            var app = new Aplicativo(req.body);
            
            app.id_usuario = req.user._id;

            app.save(err => {
                if (err)
                    console.log(err);

                Usuario.update({_id: req.user._id }, { $set: {app: app._id}}, err => {
                    if (err)
                        console.log(err);

                    req.flash('message', 'Novo app cadastrado com sucesso!')
                    res.redirect('/dashboard');
                });
            });
        }
    });
}