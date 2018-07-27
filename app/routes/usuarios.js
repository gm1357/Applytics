const { check, validationResult } = require('express-validator/check');

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

    app.post('/usuarios', [
        check('nome').not().isEmpty().withMessage('Nome deve ser preenchido'),
        check('email').not().isEmpty().withMessage('E-mail deve ser preenchido')
            .isEmail().withMessage('E-mail deve ser válido'),
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
                failureFlash : true
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
}