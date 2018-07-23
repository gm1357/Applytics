var LocalStrategy   = require('passport-local').Strategy;
var User = require('../app/models/Usuario');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'senha',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        process.nextTick(function() {


            User.findOne({ 'local.email' :  email }, function(err, user) {

                if (err)
                    return done(err);

                if (user) {
                    return done(null, false, req.flash('signupMessage', 'Esse email já está cadastrado'));
                } else {
                    var newUser = new User();

                    newUser.local.nome = req.body.nome;
                    newUser.local.email = email;
                    newUser.local.senha = newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });    
        });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'senha',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err)
                return done(err);

            if (!user)
                return done(null, false, req.flash('loginMessage', 'Nenhum usuário com esse email foi encontrado.'));

            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Senha incorreta.'));

            return done(null, user);
        });

    }));

};