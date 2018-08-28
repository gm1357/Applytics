var ss = require('simple-statistics');

// Gera uma array com os dados necessários para o gráfico box plot através de uma array de dados
exports.formaBoxPlot = (dados) => {
    array = [];

    array.push(ss.min(dados));
    array.push(ss.quantile(dados, 0.25));
    array.push(ss.median(dados));
    array.push(ss.quantile(dados, 0.75));
    array.push(ss.max(dados));

    return array;
}

exports.isAutenticado = (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/usuarios/login');
    }
}

exports.temApp = (req, res) => {
    if (req.user.app == null) {
        res.redirect('/dashboard/novo');
    }
}