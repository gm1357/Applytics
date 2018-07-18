express = require('express');
load = require('express-load')
bodyParser = require('body-parser');
methodOverride = require('method-override')
expressValidator = require('express-validator');
favicon = require('serve-favicon');
require('dotenv').load();


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

    app.use(function(req, res, next) {
        res.status(404).render('erros/404');
    });

    app.use(function(error, req, res, next) {
        if (process.env.NODE_ENV !== 'development') {
            res.status(500).render('erros/500');
            return;
        }
        next(error);
    });

    return app;
}