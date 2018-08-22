const bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
    local: {
        nome: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        senha: { type: String, required: true},
    },
    nivel: { type: String, required: true, trim: true },
    novo: Number,
    app: String
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.senha);
};

module.exports = mongoose.model('Usuarios', userSchema);