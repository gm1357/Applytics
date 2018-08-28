var ss = require('simple-statistics');
var Usuario = require('../models/Usuario');

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

exports.verificaNovoUsuario = (req, pagina) => {
    let userState = -1;

    if (req.user[pagina] == 2) {
        userState = 1;
    } else if (req.user[pagina] == 1) {
        userState = 0;
    }
    
    if (userState != -1) {
        Usuario.update({ _id: req.user._id }, { $set: { [pagina] : userState}}, err => {
            if(err) { return console.dir(err); }   
        });
        return userState;
    }
    return 0;
}