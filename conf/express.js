express = require('express');
load = require('express-load')
bodyParser = require('body-parser');
cookieParser = require('cookie-parser');
session = require('express-session');
methodOverride = require('method-override')
expressValidator = require('express-validator');
passport = require('passport');
flash = require('connect-flash');
morgan = require('morgan')
favicon = require('serve-favicon');
mongoose = require('mongoose');
moment = require("moment");
Handlebars = require('handlebars');
hbs = require('hbs');
require('dotenv').load();
require('./passport')(passport);


module.exports = () => {
    app = express();

    moment.locale('pt-br');

    mongoose.set('debug',true);
    mongoose.connect(process.env.MONGODB_URI + (process.env.NODE_ENV === 'test' ? '_test' : ''), { useNewUrlParser: true });

    hbs.registerHelper('json', function (content) {
        return JSON.stringify(content);
    });

    hbs.registerHelper('is_equal', function(a, b, opts) {
        if(a == b)
            return true;
        else
            return false;
    });

    // app.set('view engine', 'ejs');
    app.set('view engine', 'hbs');
    hbs.registerPartials('./app/views/layout');
    app.set('views', './app/views');

    

    app.use(morgan('dev'));
    app.use(express.static('./app/public'));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.use(session({ 
        secret: 'analyticstool2018app',
        resave: false,
        saveUninitialized: false

    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    app.use(function(req,res,next){
        res.locals.usuarioLogado = req.user;
        next();
    });

    app.use(methodOverride('_method'));
    app.use(expressValidator());
    app.use(favicon('app/public/favicon.ico'));

    load('routes', {cwd: 'app'})
    .into(app);

    app.use((req, res, next) => {
        res.status(404).redirect('/dashboard/');
    });

    app.use((error, req, res, next) => {
        if (process.env.NODE_ENV !== 'development') {
            res.status(500).render('erros/500');
            return;
        }
        next(error);
    });

    return app;
}