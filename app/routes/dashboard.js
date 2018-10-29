var dashboard_controller = require('../controllers/dashboardController');
var dashboard_validation = require('../validations/dashboardValidation');

module.exports = function() {
    app.get('/dashboard', dashboard_controller.index);
    // app.get('/dashboard/novo', (req,res,next) => {res.locals.isNovo = 1;next()}, dashboard_controller.monta_form);
    // app.get('/dashboard/editar', (req,res,next) => {res.locals.isNovo = 0;next()}, dashboard_controller.monta_form);
    // app.post('/dashboard', dashboard_validation.cadastro, dashboard_controller.criar_app);
    // app.put('/dashboard',dashboard_validation.alterar, dashboard_controller.atualizar_app);
    app.get('/dashboard/crashes', dashboard_controller.lista_crashes);
    app.get('/dashboard/usuarios', dashboard_controller.lista_usuarios);
}