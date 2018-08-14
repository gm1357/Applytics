const { check, validationResult } = require('express-validator/check');
var Usuario = require('../models/Usuario');
var Aplicativo = require('../models/Aplicativo');

module.exports = function(app) {
    app.get('/usuarios/cadastro', (req, res) => {
        res.render('usuarios/cadastro', {validationErrors:'',usuario:'', message: req.flash('signupMessage')});
    });
    
    app.get('/usuarios/login', (req, res) => {
        res.render('usuarios/login', {validationErrors:'',usuario:'', message: req.flash('loginMessage')});
    });

    app.get('/usuarios/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/usuarios/:id', (req, res) => {
        if (!req.isAuthenticated() || req.user._id != req.params.id) {
            res.redirect('/usuarios/login');
            return;
        }

        let validationErrors = req.flash('validationErrors');

        Aplicativo.find({ id_usuario: req.params.id}, (err, apps) => {
            Usuario.findById(req.params.id, (err, usuario) => {
                res.render('usuarios/perfil', {validationErrors: validationErrors, usuario: usuario, apps: apps});
            });
        });

    });

    app.post('/usuarios', [
        check('nome').not().isEmpty().withMessage('Nome deve ser preenchido'),
        check('email').not().isEmpty().withMessage('E-mail deve ser preenchido')
            .isEmail().withMessage('E-mail deve ser válido'),
        check('nivel').not().isEmpty().withMessage('O nível de conhecimento deve ser informado')
            .isIn(['', 'Iniciante', 'Avançado']).withMessage('Deve ser escolhido um dos níveis fornecidos'),
        check('senha').not().isEmpty().withMessage('Senha deve ser preenchida')
            .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
        check('senha-confirm').custom((value,{req}) => {
            if (!value || !req.body.senha || value !== req.body.senha) {
                throw new Error("Confirmação não confere com a senha");
            } else {
                return value;
            }
        })
    ], (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) { 
            res.status(400); 
            res.format({ 
                html: () => { 
                    res.render("usuarios/cadastro", {validationErrors:errors.array(), usuario: req.body, message: ''}); 
                }, 
                json: () => { 
                    res.send(errors.array()); 
                } 
            }); 
            return; 
        } else {
            passport.authenticate('local-signup', {
                successRedirect : '/',
                failureRedirect : '/usuarios/cadastro',
                failureFlash : true,
                successFlash: true
            })(req,res);
        }
    });

    app.post('/usuarios/login', [
        check('email').not().isEmpty().withMessage('Digite seu e-mail')
            .isEmail().withMessage('Forneça um e-mail válido'),
        check('senha').not().isEmpty().withMessage('Digite sua senha')
    ], (req, res) => {
        const errors = validationResult(req); 

        if (!errors.isEmpty()) { 
            res.status(400); 
            res.format({ 
                html: () => { 
                    res.render("usuarios/login", {validationErrors:errors.array(), usuario:req.body, message: ''}); 
                }, 
                json: () => { 
                    res.send(errors.array()); 
                } 
            }); 
            return; 
        } else {
            passport.authenticate('local-login', {
                successRedirect : '/dashboard',
                failureRedirect : '/usuarios/login',
                failureFlash : true
            })(req,res);
        }
    });

    app.put('/usuarios/:id', [
        check('nome').not().isEmpty().withMessage('Digite um nome'),
        check('nivel').not().isEmpty().withMessage('O nível de conhecimento deve ser informado')
            .isIn(['', 'Iniciante', 'Avançado']).withMessage('Deve ser escolhido um dos níveis fornecidos'),
        check('app').not().isEmpty().withMessage('Selecione um app')
    ], (req, res) => {
        const errors = validationResult(req); 

        if (!errors.isEmpty()) { 
            res.format({ 
                html: () => {
                    req.flash('validationErrors', errors.array());
                    let redirectUrl = '/usuarios/' + req.params.id;
                    res.redirect(redirectUrl); 
                }, 
                json: () => { 
                    res.status(400); 
                    res.send(errors.array()); 
                } 
            }); 
            return; 
        } else {
            Usuario.update({ _id: req.params.id }, { $set: {'local.nome': req.body.nome, 'nivel': req.body.nivel, 'app': req.body.app}}, err => {
                if (err)
                    console.log(err);

                req.flash('message', 'Dados alterados com sucesso!');
                res.redirect('/dashboard');
            });
        }
    });
}