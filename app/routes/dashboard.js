var dashboard_controller = require('../controllers/dashboardController');
var dashboard_validation = require('../validations/dashboardValidation');

module.exports = function() {
    app.get('/dashboard', dashboard_controller.index);
    app.get('/dashboard/novo', dashboard_controller.novo_app);
    app.get('/dashboard/editar', dashboard_controller.editar_app);
    app.post('/dashboard', dashboard_validation.cadastro, dashboard_controller.criar_app);
    app.put('/dashboard',dashboard_validation.alterar, dashboard_controller.atualizar_app);
}