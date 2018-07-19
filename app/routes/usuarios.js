const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator/check');

module.exports = function(app) {
    app.get('/usuarios/cadastro', function(req, res) {
        res.render('usuarios/cadastro', {validationErrors:'',usuario:''});
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
        var usuario = req.body;

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

        delete usuario['senha-confirm'];

        connection = app.infra.connectionFactory();
        UsuariosDAO = new app.infra.UsuariosDAO(connection);

        UsuariosDAO.confereEmail(usuario, function(err, results) {
            console.log(results);
            if (!results[0]) {
                usuario.senha = bcrypt.hashSync(req.body['senha'], 10);
        
                UsuariosDAO.salva(usuario, function(err, results){
                    console.log(err);
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
}