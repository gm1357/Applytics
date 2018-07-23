const bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
    local: {
        nome: String,
        email: String,
        senha: String,
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.senha);
};

module.exports = mongoose.model('Usuarios', userSchema);