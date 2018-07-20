var LocalStrategy   = require('passport-local').Strategy;
var User = app.models.Usuario;
var UserDAO = app.infra.UsuariosDAO;

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
    function(req, usuario, done) {
        process.nextTick(function() {
            var a = true;
        });
    }));
}