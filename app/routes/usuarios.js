var usuarios_controller = require('../controllers/usuariosController');
var usuarios_validation = require('../validations/usuariosValidation');


module.exports = function(app) {
    // app.get('/usuarios/cadastro', usuarios_controller.cadastro);
    // app.get('/usuarios/login', usuarios_controller.login);
    // app.get('/usuarios/logout', usuarios_controller.logout);
    // app.get('/usuarios/:id', usuarios_controller.detalhes);
    // app.post('/usuarios', usuarios_validation.cadastro, usuarios_controller.cria_usuario);
    app.post('/usuarios/login', usuarios_validation.login, usuarios_controller.executa_login);
    // app.put('/usuarios/:id', usuarios_validation.alterar, usuarios_controller.altera_usuario);
}