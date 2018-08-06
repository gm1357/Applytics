<!-- Gera 1000 usuarios a partir do schema -->
# mongodb-dataset-generator .\app_users_schema.json -n 1000 -o dataset_app_users.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios -->
# mongoimport --jsonArray --db applytics --collection app_users5b5b77161932d925589d4ea1 --file .\dataset_app_users.json

<!-- Gera arquivo com os ids dos usuarios (Precisa limpar arquivo depois) -->
# mongo | tee ids.txt
# use applytics
# db.app_users5b5b77161932d925589d4ea1.find({},{_id: 1}).toArray()

<!-- Adiciona ids gerados para o schema de geração do app_views -->

<!-- Gera 5000 entradas de usuarios_views (Para acomadar a chance de repetidos) -->
# mongodb-dataset-generator .\app_views_schema.json -n 7000 -o dataset_app_views.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios_viewa -->
# mongoimport --jsonArray --db applytics --collection app_views5b5b77161932d925589d4ea1 --file .\dataset_app_views.json

<!-- Limpa entradas duplicadas -->
# mongo
# use applytics
# db.app_views5b5b77161932d925589d4ea1.find({}, {"id_usuario":1}).sort({_id:1}).forEach(function(doc){ db.app_views5b5b77161932d925589d4ea1.remove({_id:{$gt:doc._id}, "id_usuario":doc.id_usuario}); });