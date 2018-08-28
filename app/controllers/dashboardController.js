var request = require("request");
var fs = require('fs');
var Categoria = require('../models/Categoria');
var Aplicativo = require('../models/Aplicativo');
var Usuario = require('../models/Usuario');
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const { validationResult } = require('express-validator/check');
var Helper = require('../helpers/dashboardHelper');

exports.index = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/usuarios/login');
    }
    if (req.user.app == null) {
        return res.redirect('/dashboard/novo');
    }

    let message = req.flash('message');
    let dados = {};
    dados.stats = {};
    dados.graphs = {};
    
    MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, async function(err, client) {
        if(err) { return console.dir(err); }

        const db = client.db(process.env.MONGODB_URI.split('/')[3]);
        const collection = db.collection('app_users'+req.user.app);

        // Todos usuários
        dados.stats.num_usuarios_totais = await collection.find().toArray();
        if (dados.stats.num_usuarios_totais.length <= 0) {
            return res.render('dashboard/index', {appID: req.user.app, dados: dados, message: message});
        }
        
        // Para identificar se é o primeiro acesso de um usuário à dashboard
        req.user.novoD = Helper.verificaNovoUsuario(req, 'novoD');

        // Usuários ativos nas últimas 24h
        dados.stats.num_usuarios_dia = await collection.find({
            "visto_ultimo": {
                    $gte: new Date((new Date().getTime() - (1 * 24 * 60 * 60 * 1000)))
            }
        }).count();

        // Usuários ativos nos últimos 7 dias
        dados.stats.num_usuarios_semana = await collection.find({
            "visto_ultimo": {
                $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
            }
        }).count();

        // Usuários ativos nos últimos 30 dias
        dados.stats.num_usuarios_mes = await collection.find({
            "visto_ultimo": {
                $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
            }
        }).count();

        // Usuários ativos nos últimos 365 dias
        dados.stats.num_usuarios_ano = await collection.find({
            "visto_ultimo": {
                $gte: new Date((new Date().getTime() - (365 * 24 * 60 * 60 * 1000)))
            }
        }).count();

        // Usuários homens
        dados.stats.num_usuarios_masculinos = await collection.find({
            "sexo": "Male"
        }).count();

        // Soma total da duração das sessões de todos usuários em segundos (Tempo total do app rodando)
        dados.stats.tempo_total_sessoes = await collection.aggregate([ 
            { $group: { 
                _id: null, 
                sum: { $sum: '$total_duracao_sessao'} 
            } }, 
            { $project: { _id: 0, sum: 1} } 
        ]).toArray();

        let num_sessoes = await collection.aggregate([ 
            { $group: { 
                _id: null, 
                sum: { $sum: '$numero_sessoes'} 
            } }, 
            { $project: { _id: 0, sum: 1} } 
        ]).toArray();
        dados.stats.media_sessao = dados.stats.tempo_total_sessoes[0].sum / num_sessoes[0].sum;

        // Média de tempo de sessão por usuário
        dados.stats.media_tempo_total = dados.stats.tempo_total_sessoes[0].sum / dados.stats.num_usuarios_totais.length;

        // Variância do tempo total de sessões
        dados.stats.variancia_tempo_total = (dados.stats.num_usuarios_totais.map((num) => {
            return Math.pow(num.total_duracao_sessao - dados.stats.media_tempo_total, 2);
        }).reduce((a,b) => a + b, 0)) / dados.stats.num_usuarios_totais.length;

        // Desvio padrão do tempo total de sessões
        dados.stats.desvio_tempo_total = Math.sqrt(dados.stats.variancia_tempo_total);

        // Soma total de quanto foi gasto no app
        dados.stats.total_gasto = await collection.aggregate([ 
            { $group: { 
                _id: null, 
                sum: { $sum: '$total_gasto'} 
            } }, 
            { $project: { _id: 0, sum: 1} } 
        ]).toArray();

        // Média de quanto foi gasto
        dados.stats.media_gasto_total = dados.stats.total_gasto[0].sum / dados.stats.num_usuarios_totais.length;

        // Variância de quanto foi gasto
        dados.stats.variancia_gasto_total = (dados.stats.num_usuarios_totais.map((num) => {
            return Math.pow(num.total_gasto - dados.stats.media_gasto_total, 2);
        }).reduce((a,b) => a + b, 0)) / dados.stats.num_usuarios_totais.length;

        // Desvio padrão de quanto foi gasto
        dados.stats.desvio_gasto_total = Math.sqrt(dados.stats.variancia_gasto_total);
        
        // Soma de quantidade de novos usuários por mês
        dados.graphs.usuarios_mes = {};
        let dados_novos_por_mes = await collection.aggregate([
            { $group: { 
                _id:  { $month: '$visto_primeiro'}, 
                count: { $sum: 1} }
            }, 
            { $sort: {_id: 1}}, 
            { $project: { _id: 0, count: 1}}
        ]);
        dados.graphs.usuarios_mes.novos = [];
        await dados_novos_por_mes.forEach(row => {
            dados.graphs.usuarios_mes.novos.push(row.count);
        });

        // Soma de quantidade de usuários que não usaram mais o app por mês
        let dados_desistentes_por_mes = await collection.aggregate([
            { $group: { 
                _id:  { $month: '$visto_ultimo'}, 
                count: { $sum: 1} }
            }, 
            { $sort: {_id: 1}}, 
            { $project: { _id: 0, count: 1}}
        ]);
        dados.graphs.usuarios_mes.velhos = [];
        await dados_desistentes_por_mes.forEach(row => {
            dados.graphs.usuarios_mes.velhos.push(row.count);
        });

        // Soma de quantidade de usuários por resolução de tela
        dados.graphs.resolucoes = [];
        let dados_res = await collection.aggregate([ 
            { $group: { _id: '$resolucao_tela', count: {$sum: 1} } },
            { $sort: { count: -1}}
        ]);
        await dados_res.forEach(row => {
            dados.graphs.resolucoes.push({name: row._id, y: row.count});
        });
        if (dados.graphs.resolucoes[0]) {
            dados.graphs.resolucoes[0].sliced = 'true';
            dados.graphs.resolucoes[0].selected = 'true';
        }

        // Dados de tempo médio de duração de sessão de cada usuário
        let dados_tempo_medio_sessao = await collection.aggregate([
            {$project: { 
                nome: 1, 
                tempo_medio_sessao: { $divide: ['$total_duracao_sessao', '$numero_sessoes']} 
            }}
        ]);
        dados.graphs.sessao_media_usuario = [];
        await dados_tempo_medio_sessao.forEach(row => {
            dados.graphs.sessao_media_usuario.push(row.tempo_medio_sessao);
        });

        // Soma de quantidade de usuários por país
        dados.mapGeo = JSON.parse(fs.readFileSync('app/public/world.geo.json', 'utf8'));
        dados.graphs.paises = [];
        let paises_sum = await collection.aggregate([
            { $group: { _id: '$pais', count: { $sum: 1}}}
        ]);
        await paises_sum.forEach(row => {
            dados.graphs.paises.push({pais: row._id, value: row.count});
        });

        // Soma de quantidade de usuários por idade
        dados.graphs.idades = {};
        let dados_idades = await collection.aggregate([
            {$group: { 
                _id: { $subtract: [{$year: new Date()}, '$ano_nascimento']},
                count: { $sum: 1}
            }},
            {$sort: {_id: 1}}
        ]);
        dados.graphs.idades.idadesArray = [];
        dados.graphs.idades.quantidade = []
        await dados_idades.forEach(row => {
            dados.graphs.idades.idadesArray.push(row._id);
            dados.graphs.idades.quantidade.push(row.count);
        });

        // Arrays e contas para fazer boxplot de duração de sessão
        // Menor ou igual a 20
        let array20 = [];
        let menor20 = await collection.find(
            { $expr: { 
                $lte: [{ $subtract: [{$year: new Date()}, '$ano_nascimento']}, 20]
            }}
        ).project({total_duracao_sessao: 1, _id: 0}).toArray();
        
        for (usuario of menor20) {
            array20.push(usuario.total_duracao_sessao);
        }

        // Maior que 20 e menor ou igual a 30
        let array20_30 = [];
        let entre20_30 = await collection.find(
            { $and: [
                { $expr: { $gt: [{ $subtract: [{$year: new Date()}, '$ano_nascimento']}, 20]}}, 
                { $expr: { $lte: [{ $subtract: [{$year: new Date()}, '$ano_nascimento']}, 30]}}
            ]}
        ).project({total_duracao_sessao: 1, _id: 0}).toArray();
        
        for (usuario of entre20_30) {
            array20_30.push(usuario.total_duracao_sessao);
        }

        // Maior que 30 e menor ou igual a 40
        let array30_40 = [];
        let entre30_40 = await collection.find(
            { $and: [
                { $expr: { $gt: [{ $subtract: [{$year: new Date()}, '$ano_nascimento']}, 30]}}, 
                { $expr: { $lte: [{ $subtract: [{$year: new Date()}, '$ano_nascimento']}, 40]}}
            ]}
        ).project({total_duracao_sessao: 1, _id: 0}).toArray();
        
        for (usuario of entre30_40) {
            array30_40.push(usuario.total_duracao_sessao);
        }

        // Maior que 40 e menor ou igual a 50
        let array40_50 = [];
        let entre40_50 = await collection.find(
            { $and: [
                { $expr: { $gt: [{ $subtract: [{$year: new Date()}, '$ano_nascimento']}, 40]}}, 
                { $expr: { $lte: [{ $subtract: [{$year: new Date()}, '$ano_nascimento']}, 50]}}
            ]}
        ).project({total_duracao_sessao: 1, _id: 0}).toArray();
        
        for (usuario of entre40_50) {
            array40_50.push(usuario.total_duracao_sessao);
        }

        // Maior que 50
        let array50 = [];
        let maior50 = await collection.find(
            { $expr: { 
                $gt: [{ $subtract: [{$year: new Date()}, '$ano_nascimento']}, 50]
            }}
        ).project({total_duracao_sessao: 1, _id: 0}).toArray();
        
        for (usuario of maior50) {
            array50.push(usuario.total_duracao_sessao);
        }

        dados.graphs.boxPlotDuracao = {};
        dados.graphs.boxPlotDuracao.array1 = Helper.formaBoxPlot(array20);
        dados.graphs.boxPlotDuracao.array2 = Helper.formaBoxPlot(array20_30);
        dados.graphs.boxPlotDuracao.array3 = Helper.formaBoxPlot(array30_40);
        dados.graphs.boxPlotDuracao.array4 = Helper.formaBoxPlot(array40_50);
        dados.graphs.boxPlotDuracao.array5 = Helper.formaBoxPlot(array50);

        const collectionApps = db.collection('aplicativos');
        const collectionViews = db.collection('app_views'+req.user.app);

        //Somas do total de acesso das views do app
        let views = await collectionApps.find({_id: ObjectId(req.user.app)}).project({_id: 0, views: 1}).toArray();
        dados.graphs.views = [];
        let mais_visitada = {};
        mais_visitada.acessos = 0;
        let index = 0;

        for (view of views[0].views) {
            let view_total = await collectionViews.aggregate([
                { $group: { _id: null, count: {$sum: '$' +view+ '.quantidade'}}}
            ]).toArray();
            if (view_total[0].count >= mais_visitada.acessos) {
                mais_visitada.acessos = view_total[0].count;
                mais_visitada.index = index;
            }
            dados.graphs.views.push({name: view, y: view_total[0].count});
            index++;
        }
        dados.graphs.views[mais_visitada.index].sliced = 'true';
        dados.graphs.views[mais_visitada.index].selected = 'true';

        const collectionCrashes = db.collection('app_crashes'+req.user.app);

        // Número de travamentos
        dados.stats.num_crashes = await collectionCrashes.countDocuments();

        const collectionSessoes = db.collection('app_sessoes'+req.user.app);

        dados.stats.num_total_sessoes = await collectionSessoes.countDocuments();

        // Array com o número de sessões a cada hora por dia da semana
        let sessoes_dia_semana_hora = await collectionSessoes.aggregate([
            { $group: { 
                        _id: {"dia_semana": { $dayOfWeek: {date: "$data", timezone: "America/Sao_Paulo"}}, "hora": {$hour: "$data"}}, 
                        sum: { $sum: 1}
            }},
            {$sort: { "_id": 1}}
        ]).toArray();

        dados.graphs.sessoes_por_hora_dia = [];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 24; j++) {
                dados.graphs.sessoes_por_hora_dia.push([i, j, 0]);
            }
        }

        for (let dia_hora of sessoes_dia_semana_hora) {
            let index = dados.graphs.sessoes_por_hora_dia.indexOf([dia_hora._id.dia_semana - 1, dia_hora._id.hora, 0]);
            delete dados.graphs.sessoes_por_hora_dia[index];

            dados.graphs.sessoes_por_hora_dia.push([dia_hora._id.dia_semana - 1, dia_hora._id.hora, dia_hora.sum]);
        }
        
        // Porcentagens com relação ao total de usuários
        dados.porcentagens = {};
        dados.porcentagens.num_usuarios_dia = (dados.stats.num_usuarios_dia / dados.stats.num_usuarios_totais.length) * 100;
        dados.porcentagens.num_usuarios_semana = (dados.stats.num_usuarios_semana / dados.stats.num_usuarios_totais.length) * 100;
        dados.porcentagens.num_usuarios_mes = (dados.stats.num_usuarios_mes / dados.stats.num_usuarios_totais.length) * 100;
        dados.porcentagens.num_usuarios_ano = (dados.stats.num_usuarios_ano / dados.stats.num_usuarios_totais.length) * 100;
        dados.porcentagens.num_usuarios_masculinos = (dados.stats.num_usuarios_masculinos / dados.stats.num_usuarios_totais.length) * 100;
        dados.porcentagens.num_usuarios_femininos = 100 - dados.porcentagens.num_usuarios_masculinos;

        // Formatação dos dados
        dados.stats.num_usuarios_femininos = (dados.stats.num_usuarios_totais.length - dados.stats.num_usuarios_masculinos).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.num_usuarios_totais = dados.stats.num_usuarios_totais.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.num_usuarios_dia = dados.stats.num_usuarios_dia.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.num_usuarios_semana = dados.stats.num_usuarios_semana.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.num_usuarios_mes = dados.stats.num_usuarios_mes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.num_usuarios_ano = dados.stats.num_usuarios_ano.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.num_usuarios_masculinos = dados.stats.num_usuarios_masculinos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.tempo_total_sessoes = dados.stats.tempo_total_sessoes[0].sum.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.media_sessao = dados.stats.media_sessao.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.media_tempo_total = dados.stats.media_tempo_total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.variancia_tempo_total = dados.stats.variancia_tempo_total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.desvio_tempo_total = dados.stats.desvio_tempo_total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.total_gasto = dados.stats.total_gasto[0].sum.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.media_gasto_total = dados.stats.media_gasto_total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.variancia_gasto_total = dados.stats.variancia_gasto_total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.desvio_gasto_total = dados.stats.desvio_gasto_total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.num_crashes = dados.stats.num_crashes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        dados.stats.num_total_sessoes = dados.stats.num_total_sessoes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        await res.render('dashboard/index', {appID: req.user.app, dados: dados, message: message, usuarioNovo: req.user.novoD});
    });
    
};

exports.monta_form = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/usuarios/login');
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
                
                if (res.locals.isNovo) {
                    let app = req.flash('aplicativo')[0] || new Aplicativo();
                    res.render('dashboard/formApp', {paises: paises, categorias: categorias, validationErrors: req.flash('validationErrors'), aplicativo: app, nomeForm: "Cadastrar novo app", acaoForm: "Criar", metodoForm: "POST"});
                } else {
                    if (req.user.app == null) {
                        return res.redirect('/dashboard/novo');
                    }

                    Aplicativo.findById(req.user.app, (err, app) => {
                        res.render('dashboard/formApp', {paises: paises, categorias: categorias, validationErrors: req.flash('validationErrors'), aplicativo: app, nomeForm: "Editar app selecionado", acaoForm: "Editar", metodoForm: "PUT"});
                    });    
                }
            });
        }
    });
}

exports.criar_app = (req, res) => {
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
        req.body.views = req.body.views.split(',');
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
};

exports.atualizar_app = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) { 
        res.format({ 
            html: () => { 
                req.flash('validationErrors', errors.array());
                req.flash('aplicativo', req.body);
                res.redirect('/dashboard/editar'); 
            }, 
            json: () => { 
                res.status(400); 
                res.send(errors.array()); 
            } 
        }); 
        return; 
    } else {
        req.body.views = req.body.views.split(',');

        Aplicativo.update({ _id: req.user.app}, { $set: {'nome': req.body.nome, 'pais': req.body.pais, 'categoria': req.body.categoria, 'views': req.body.views}}, (err, app) => {
            if (err)
                console.log(err);

            req.flash('message', 'App alterado com sucesso!')
            res.redirect('/dashboard');
        });

    }
};

exports.lista_crashes = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/usuarios/login');
    }
    if (req.user.app == null) {
        return res.redirect('/dashboard/novo');
    }

    // Para identificar se é o primeiro acesso de um usuário à pagina de crashes
    req.user.novoC = Helper.verificaNovoUsuario(req, 'novoC');

    let dados = {};
    dados.graphs = {};
    MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, async function(err, client) {
        if(err) { return console.dir(err); }

        const db = client.db(process.env.MONGODB_URI.split('/')[3]);
        const collection = db.collection('app_crashes'+req.user.app);
        
        let crashes_por_mes_tratadas = await collection.aggregate([
            { $match: { nonfatal: 1}},
            { $group: { _id: { $month: '$crashed_at'}, count: { $sum: 1}}}, 
            { $sort: { _id: 1}} 
        ]).toArray();
        let crashes_por_mes_nao_tratadas = await collection.aggregate([
            { $match: { nonfatal: 1}},
            { $group: { _id: { $month: '$crashed_at'}, count: { $sum: 1}}}, 
            { $sort: { _id: 1}} 
        ]).toArray();

        dados.graphs.crashes_mes_tratadas = [];
        for (crash of crashes_por_mes_tratadas) {
            await dados.graphs.crashes_mes_tratadas.push(crash.count);
        }
        dados.graphs.crashes_mes_nao_tratadas = [];
        for (crash of crashes_por_mes_nao_tratadas) {
            await dados.graphs.crashes_mes_nao_tratadas.push(crash.count);
        }

        collection.find().toArray((err, crashes) => {
            if(err) { return console.dir(err); }
            
            res.render('dashboard/crashes', {crashes: crashes, dados: dados, usuarioNovo: req.user.novoC});
        });
    });
};

exports.lista_usuarios = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/usuarios/login');
    }
    if (req.user.app == null) {
        return res.redirect('/dashboard/novo');
    }

    // Para identificar se é o primeiro acesso de um usuário à pagina de usuários
    req.user.novoU = Helper.verificaNovoUsuario(req, 'novoU');

    MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, async function(err, client) {
        if(err) { return console.dir(err); }

        const db = client.db(process.env.MONGODB_URI.split('/')[3]);
        const collection = db.collection('app_users'+req.user.app);      

        collection.find().toArray((err, users) => {
            if(err) { return console.dir(err); }
            
            Aplicativo.findById(req.user.app, (err, app) => {
                if(err) { return console.dir(err); }

                const collectionViews = db.collection('app_views'+req.user.app);    

                collectionViews.find().toArray((err, views) => {
                    if(err) { return console.dir(err); }

                    res.render('dashboard/usuarios', {users: users, aplicativo: app, views: views, usuarioNovo: req.user.novoU});
                });
            });
        });
    });
};