var request = require("request");
var Categoria = require('../models/Categoria');
var Aplicativo = require('../models/Aplicativo');
var Usuario = require('../models/Usuario');

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
        
        res.render('dashboard/index', {appID: req.user.app});
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

                    res.render('dashboard/novoApp', {paises: paises, categorias: categorias});
                });
            }
        });
    });

    app.post('/dashboard', (req, res) => {
        var app = new Aplicativo(req.body);
        
        app.id_usuario = req.user._id;

        app.save(err => {
            if (err)
                console.log(err);

            Usuario.update({_id: req.user._id }, { $set: {app: app._id}}, err => {
                if (err)
                    console.log(err);

                res.redirect('/dashboard');
            });
        });
    });
}