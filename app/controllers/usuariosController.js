var Usuario = require('../models/Usuario');
var Aplicativo = require('../models/Aplicativo');
const { validationResult } = require('express-validator/check');

exports.cadastro = (req, res) => {
    let erroMsg = '';
    const flashMsg = req.flash('signupMessage');
    
    if (flashMsg != '') {
        erroMsg = [{msg: flashMsg}];
    }

    res.render('usuarios/cadastro', {validationErrors: erroMsg,usuario:''});
};

exports.login = (req, res) => {
    let erroMsg = '';
    const flashMsg = req.flash('loginMessage');
    
    if (flashMsg != '') {
        erroMsg = [{msg: flashMsg}];
    }

    res.render('usuarios/login', {validationErrors: erroMsg,usuario:''});
};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

exports.detalhes = (req, res) => {
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

};

exports.cria_usuario = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) { 
        res.status(400); 
        res.format({ 
            html: () => { 
                res.render("usuarios/cadastro", {validationErrors:errors.array(), usuario: req.body}); 
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
};

exports.executa_login = (req, res) => {
    const errors = validationResult(req); 

    if (!errors.isEmpty()) { 
        res.status(400); 
        res.format({ 
            html: () => { 
                res.render("usuarios/login", {validationErrors:errors.array(), usuario:req.body}); 
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
};

exports.altera_usuario = (req, res) => {
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
};