var appSchema = mongoose.Schema({
    nome: {type: String, required: true, trim: true },
    chave: {type: String, required: true, trim: true },
    pais: {type: String, required: true, trim: true },
    categoria: {type: String, required: true, trim: true },
    id_usuario: {type: String, required: true},
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Aplicativos', appSchema);