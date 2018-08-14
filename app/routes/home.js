var home_controller = require('../controllers/homeController');

module.exports = function() {
    app.get('/', home_controller.index);
}