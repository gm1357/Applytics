const { check, validationResult } = require('express-validator/check');

module.exports = function(app) {
    app.get('/usuarios/cadastro', function(req, res) {
        res.render('usuarios/cadastro', {validationErrors:'',usuario:''});
    });

    app.get('/usuarios/login', function(req, res) {
        res.render('usuarios/login', {validationErrors:'',usuario:''});
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
    ], function(req, res) {
        var usuario = new app.models.Usuario(req.body);
        usuario.geraHash();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400);
            res.format({
                html: function(){
                    res.render("usuarios/cadastro", {validationErrors:errors.array(), usuario:usuario});
                },
                json: function(){
                    res.send(errors.array());
                }
            });
            return;
        }

        connection = app.infra.connectionFactory();
        UsuariosDAO = new app.infra.UsuariosDAO(connection);

        UsuariosDAO.confereEmail(usuario, function(err, results) {
            if (!results[0]) {
        
                UsuariosDAO.salva(usuario, function(err, results){
                    res.redirect('/');
                });

                connection.end();
            } else {
                error = [{
                    location: 'body',
                    param: 'email',
                    msg: 'Email já cadastrado no sistema',
                    value: usuario.email
                }];

                res.status(400);
                res.format({
                    html: function(){
                        res.render("usuarios/cadastro", {validationErrors:error, usuario:usuario});
                    },
                    json: function(){
                        res.send(error);
                    }
                });

                connection.end();
            }
        });
    });

    app.post('/usuarios/login', [
        check('email').not().isEmpty().withMessage('Digite seu e-mail')
            .isEmail().withMessage('Forneça um e-mail válido'),
        check('senha').not().isEmpty().withMessage('Digite sua senha')
    ], function(req, res) {
        var usuario = new app.models.Usuario(req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400);
            res.format({
                html: function(){
                    res.render("usuarios/login", {validationErrors:errors.array(), usuario:usuario});
                },
                json: function(){
                    res.send(errors.array());
                }
            });
            return;
        }

        connection = app.infra.connectionFactory();
        UsuariosDAO = new app.infra.UsuariosDAO(connection);
        
        UsuariosDAO.confereEmail(usuario, function(err, results) {
            if (results[0]) {
                usuario.validaSenha(results[0].senha, function(err, resp) {
                    if(resp) {
                        console.log('login feito');
                        res.redirect('/');
                    } else {
                        error = [{
                            location: 'body',
                            param: 'email',
                            msg: 'Email ou senha incorretos',
                            value: usuario.email
                        }];
                        res.status(400);
                        res.render('usuarios/login', {validationErrors: error, usuario: usuario});
                    } 
                });
            } else {
                error = [{
                    location: 'body',
                    param: 'email',
                    msg: 'Email não cadastrado no sistema',
                    value: usuario.email
                }];
                res.status(400);
                res.render('usuarios/login', {validationErrors: error, usuario: usuario});
            }
        });

        connection.end();
    });
}