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

        // TODO: pegar dados da api
        
        res.render('dashboard/index', {appID: req.user.app, dados: null, message: message});
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