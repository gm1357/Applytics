function UsuariosDAO(connection) {
    this._connection = connection;
}

// UsuariosDAO.prototype.lista = function(callback) {
//     this._connection.query('select * from usuarios', callback);
// }

UsuariosDAO.prototype.salva = function(usuario,callback) {
    this._connection.query('INSERT INTO usuarios SET ?', usuario, callback);
}

UsuariosDAO.prototype.confereEmail = function(usuario,callback) {
    this._connection.query('SELECT * FROM usuarios WHERE email = ?', usuario.email, callback);
}

module.exports = function() {
    return UsuariosDAO;
}