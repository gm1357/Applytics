var request = require("request");
var fs = require('fs');
var Categoria = require('../models/Categoria');
var Aplicativo = require('../models/Aplicativo');
var Usuario = require('../models/Usuario');
const MongoClient = require('mongodb').MongoClient;
const { check, validationResult } = require('express-validator/check');

module.exports = function() {
    app.get('/dashboard', (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/usuarios/login');
            return;
        }

        if (req.user.app == null) {
            res.redirect('/dashboard/novo');
            return;
        }

        let message = req.flash('message');
        let dados = {};
        
        MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, async function(err, client) {
            if(err) { return console.dir(err); }

            const db = client.db(process.env.MONGODB_URI.split('/')[3]);
            const collection = db.collection('app_users'+req.user.app);

            dados.num_usuarios = {};

            // Todos usuários
            dados.num_usuarios.totais = await collection.find().toArray();

            // Usuários ativos nas últimas 24h
            dados.num_usuarios.dia = await collection.find({
                "visto_ultimo": {
                        $gte: new Date((new Date().getTime() - (1 * 24 * 60 * 60 * 1000)))
                }
            }).toArray();

            // Usuários ativos nos últimos 7 dias
            dados.num_usuarios.semana = await collection.find({
                "visto_ultimo": {
                    $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                }
            }).toArray();

            // Usuários ativos nos últimos 30 dias
            dados.num_usuarios.mes = await collection.find({
                "visto_ultimo": {
                    $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                }
            }).toArray();

            // Usuários ativos nos últimos 365 dias
            dados.num_usuarios.ano = await collection.find({
                "visto_ultimo": {
                    $gte: new Date((new Date().getTime() - (365 * 24 * 60 * 60 * 1000)))
                }
            }).toArray();

            // Usuários homens
            dados.num_usuarios.masculinos = await collection.find({
                "sexo": "Male"
            }).toArray();

            // Soma total da duração das sessões de todos usuários em segundos (Tempo total do app rodando)
            dados.tempo_total_sessoes = await collection.aggregate([ 
                { $group: { 
                    _id: null, 
                    sum: { $sum: '$total_duracao_sessao'} 
                } }, 
                { $project: { _id: 0, sum: 1} } 
            ]).toArray();
            
            // Soma de quantidade de novos usuários por mês
            dados.plot = {};
            let dados_novos_por_mes = await collection.aggregate([
                { $group: { 
                    _id:  { $month: '$visto_primeiro'}, 
                    count: { $sum: 1} }
                }, 
                {$sort: {_id: 1}}, 
                { $project: { _id: 0, count: 1}}
            ]);
            dados.plot.novos = [];
            await dados_novos_por_mes.forEach(row => {
                    dados.plot.novos.push(row.count);
            });

            // Soma de quantidade de usuários que não usaram mais o app por mês
            let dados_desistentes_por_mes = await collection.aggregate([
                { $group: { 
                    _id:  { $month: '$visto_ultimo'}, 
                    count: { $sum: 1} }
                }, 
                {$sort: {_id: 1}}, 
                { $project: { _id: 0, count: 1}}
            ]);
            dados.plot.velhos = [];
            await dados_desistentes_por_mes.forEach(row => {
                    dados.plot.velhos.push(row.count);
            });

            // Soma de quantidade de usuários por resolução de tela
            dados.resolucoes = [];
            let dados_res = await collection.aggregate([ 
                { $group: { _id: '$resolucao_tela', count: {$sum: 1} } },
                { $sort: { count: -1}}
            ]);
            await dados_res.forEach(row => {
                dados.resolucoes.push({name: row._id, y: row.count});
            });
            if (dados.resolucoes[0]) {
                dados.resolucoes[0].sliced = 'true';
                dados.resolucoes[0].selected = 'true';
            }

            // Dados de tempo médio de duração de sessão de cada usuário
            dados.bar = {};
            let dados_tempo_medio_sessao = await collection.aggregate([
                {$project: { 
                    nome: 1, 
                    tempo_medio_sessao: { $divide: ['$total_duracao_sessao', '$numero_sessoes']} 
                }}
            ]);
            dados.bar.tempo_medio_sessao = [];
            await dados_tempo_medio_sessao.forEach(row => {
                dados.bar.tempo_medio_sessao.push(row.tempo_medio_sessao);
            });

            // Soma de quantidade de usuários por país
            dados.mapGeo = JSON.parse(fs.readFileSync('app/public/world.geo.json', 'utf8'));
            dados.paises = [];
            let paises_sum = await collection.aggregate([
                { $group: { _id: '$pais', count: { $sum: 1}}}
            ]);
            await paises_sum.forEach(row => {
                dados.paises.push({pais: row._id, value: row.count});
            });

            // Soma de quantidade de usuários por idade
            dados.idades = {};
            let dados_idades = await collection.aggregate([
                {$group: { 
                    _id: { $subtract: [{$year: new Date()}, '$ano_nascimento']},
                    count: { $sum: 1}
                }},
                {$sort: {_id: 1}}
            ]);
            dados.idades.idadesArray = [];
            dados.idades.quantidade = []
            await dados_idades.forEach(row => {
                dados.idades.idadesArray.push(row._id);
                dados.idades.quantidade.push(row.count);
            });

            await res.render('dashboard/index', {appID: req.user.app, dados: dados, message: message});
        });
        
    });

    app.get('/dashboard/novo', (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/usuarios/login');
            return;
        }

        request({
            url: 'https://restcountries.eu/rest/v2/all?fields=translations;numericCode',
            json: true
        }, function (error, response, data) {
        
            if (!error && response.statusCode === 200) {

                Categoria.find(function(err, categorias) {
                    if (err) return console.error(err);
                    
                    var paises = [];
                    data.forEach(element => {
                        paises.push({id: element.numericCode, nome: element.translations.br});
                    });

                    res.render('dashboard/novoApp', {paises: paises, categorias: categorias, validationErrors: req.flash('validationErrors'), aplicativo: req.flash('aplicativo')});
                });
            }
        });
    });

    app.post('/dashboard',[
        check('nome').not().isEmpty().withMessage('Digite o nome do seu app'),
        check('pais').not().isEmpty().withMessage('Selecione o país base do seu app'),
        check('categoria').not().isEmpty().withMessage('Selecione uma categoria para seu app')
    ], (req, res) => {
        const errors = validationResult(req); 

        if (!errors.isEmpty()) { 
            res.format({ 
                html: () => { 
                    req.flash('validationErrors', errors.array());
                    req.flash('aplicativo', req.body);
                    res.redirect('/dashboard/novo'); 
                }, 
                json: () => { 
                    res.status(400); 
                    res.send(errors.array()); 
                } 
            }); 
            return; 
        } else {
            var app = new Aplicativo(req.body);
            
            app.id_usuario = req.user._id;

            app.save(err => {
                if (err)
                    console.log(err);

                Usuario.update({_id: req.user._id }, { $set: {app: app._id}}, err => {
                    if (err)
                        console.log(err);

                    req.flash('message', 'Novo app cadastrado com sucesso!')
                    res.redirect('/dashboard');
                });
            });
        }
    });
}