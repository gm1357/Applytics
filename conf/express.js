express = require('express');
load = require('express-load')
bodyParser = require('body-parser');
methodOverride = require('method-override')
expressValidator = require('express-validator');

module.exports = function() {
    app = express();
    
    app.set('view engine', 'ejs');
    app.set('views', './app/views');

    app.use(express.static('./app/public'));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(methodOverride('_method'));
    app.use(expressValidator());

    load('routes', {cwd: 'app'})
        .then('infra')
        .into(app);

    return app;
}