<!-- Gera 1000 usuarios a partir do schema -->
# mongodb-dataset-generator .\app_users_schema.json -n 1000 -o dataset_app_users.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios -->
# mongoimport --jsonArray --db applytics --collection app_users5b69f648537da10190857934 --file .\dataset_app_users.json

<!-- Gera arquivo com os ids dos usuarios (Precisa limpar arquivo depois) -->
# mongo | tee ids.txt
# use applytics
# db.app_users5b69f648537da10190857934.find({},{_id: 1}).toArray()

<!-- Adiciona ids gerados para o schema de geração do app_views -->

<!-- Gera 5000 entradas de usuarios_views (Para acomadar a chance de repetidos) -->
# mongodb-dataset-generator .\app_views_schema.json -n 7000 -o dataset_app_views.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios_views -->
# mongoimport --jsonArray --db applytics --collection app_views5b69f648537da10190857934 --file .\dataset_app_views.json

<!-- Limpa entradas duplicadas -->
# mongo
# use applytics
# db.app_views5b69f648537da10190857934.find({}, {"id_usuario":1}).sort({_id:1}).forEach(function(doc){ db.app_views5b69f648537da10190857934.remove({_id:{$gt:doc._id}, "id_usuario":doc.id_usuario}); });

<!-- Adiciona ids gerados para o schema de geração do app_crashes -->

<!-- Gera 500 entradas -->
# mongodb-dataset-generator .\app_crashes_schema.json -n 500 -o dataset_app_crashes.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere crashes -->
# mongoimport --jsonArray --db applytics --collection app_crashes5b69f648537da10190857934 --file .\dataset_app_crashes.json

<!-- Gera 10000 entradas -->
# mongodb-dataset-generator .\app_sessoes_schema.json -n 10000 -o dataset_app_sessoes.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere sessoes -->
# mongoimport --jsonArray --db applytics --collection app_sessoes5b69f648537da10190857934 --file .\dataset_app_sessoes.json

<!-- Adiciona ids gerados para o schema de geração do app_transactions -->

<!-- Gera 5000 entradas -->
# mongodb-dataset-generator .\app_transactions_schema.json -n 5000 -o dataset_app_transactions.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere transações -->
# mongoimport --jsonArray --db applytics --collection app_transactions5b69f648537da10190857934 --file .\dataset_app_transactions.json