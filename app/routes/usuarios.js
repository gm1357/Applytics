module.exports = function() {
    app.get('/usuarios/cadastro', function(req, res) {
        res.render('usuarios/cadastro');
    });
}