const bcrypt = require('bcrypt');

var Usuario = function(properties){
    this.nome = properties.nome || '';
    this.email = properties.email;
    this.senha = properties.senha;
}

Usuario.prototype.geraHash = function() {
    this.senha = bcrypt.hashSync(this.senha, 10);
}

Usuario.prototype.validaSenha = function(senhaComHash, callback) {
    bcrypt.compare(this.senha, senhaComHash, callback);
};

module.exports = function() {
    return Usuario;
}