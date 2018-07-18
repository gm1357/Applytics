express = require('express');
load = require('express-load')
bodyParser = require('body-parser');
methodOverride = require('method-override')
expressValidator = require('express-validator');
favicon = require('serve-favicon');


module.exports = function() {
    app = express();
    
    app.set('view engine', 'ejs');
    app.set('views', './app/views');
    
    app.use(express.static('./app/public'));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(methodOverride('_method'));
    app.use(expressValidator());
    app.use(favicon('app/public/favicon.ico'));

    load('routes', {cwd: 'app'})
        .then('infra')
        .into(app);

    return app;
}