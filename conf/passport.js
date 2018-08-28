var LocalStrategy   = require('passport-local').Strategy;
var User = require('../app/models/Usuario');

module.exports = passport => {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'senha',
        passReqToCallback : true
    },
    (req, email, password, done) => {

        process.nextTick(() => {


            User.findOne({ 'local.email' :  email }, (err, user) => {

                if (err)
                    return done(err);

                if (user) {
                    return done(null, false, req.flash('signupMessage', 'Esse email já está cadastrado'));
                } else {
                    var newUser = new User();

                    newUser.local.nome = req.body.nome;
                    newUser.local.email = email;
                    newUser.nivel = req.body.nivel;
                    newUser.novoD = 2;
                    newUser.novoC = 2;
                    newUser.novoU = 2;
                    newUser.local.senha = newUser.generateHash(password);

                    newUser.save(err => {
                        if (err)
                            throw err;
                        return done(null, newUser, req.flash('message', 'Cadastro feito com sucesso!'));
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
    (req, email, password, done) => {

        User.findOne({ 'local.email' :  email }, (err, user) => {
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