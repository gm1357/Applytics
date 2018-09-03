<!-- 3181 = 1913m + 1268f -->

<!-- Gera 1000 usuarios a partir do schema -->
# mongodb-dataset-generator .\app_users\app_users_schema_f1.json -n 451 -o .\app_users\dataset_app_users_f1.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios -->
# mongoimport --jsonArray --db applytics --collection app_users5b69f648537da10190857934 --file .\app_users\dataset_app_users_f1.json

<!-- Gera 1000 usuarios a partir do schema -->
# mongodb-dataset-generator .\app_users\app_users_schema_f2.json -n 397 -o .\app_users\dataset_app_users_f2.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios -->
# mongoimport --jsonArray --db applytics --collection app_users5b69f648537da10190857934 --file .\app_users\dataset_app_users_f2.json

<!-- Gera 1000 usuarios a partir do schema -->
# mongodb-dataset-generator .\app_users\app_users_schema_f3.json -n 420 -o .\app_users\dataset_app_users_f3.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios -->
# mongoimport --jsonArray --db applytics --collection app_users5b69f648537da10190857934 --file .\app_users\dataset_app_users_f3.json

<!-- Gera 1000 usuarios a partir do schema -->
# mongodb-dataset-generator .\app_users\app_users_schema_m1.json -n 743 -o .\app_users\dataset_app_users_m1.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios -->
# mongoimport --jsonArray --db applytics --collection app_users5b69f648537da10190857934 --file .\app_users\dataset_app_users_m1.json

<!-- Gera 1000 usuarios a partir do schema -->
# mongodb-dataset-generator .\app_users\app_users_schema_m2.json -n 647 -o .\app_users\dataset_app_users_m2.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios -->
# mongoimport --jsonArray --db applytics --collection app_users5b69f648537da10190857934 --file .\app_users\dataset_app_users_m2.json

<!-- Gera 1000 usuarios a partir do schema -->
# mongodb-dataset-generator .\app_users\app_users_schema_m3.json -n 523 -o .\app_users\dataset_app_users_m3.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios -->
# mongoimport --jsonArray --db applytics --collection app_users5b69f648537da10190857934 --file .\app_users\dataset_app_users_m3.json

<!-- Gera arquivo com os ids dos usuarios (Precisa limpar arquivo depois) -->
# mongo | tee ids.txt
# use applytics
# db.app_users5b69f648537da10190857934.find({},{_id: 1}).toArray()

<!-- ========================================================================================== -->

<!-- Adiciona ids gerados para o schema de geração do app_views -->

<!-- Gera 7000 entradas de usuarios_views (Para acomadar a chance de repetidos) -->
# mongodb-dataset-generator .\app_views\app_views_schema_1.json -n 7000 -o .\app_views\dataset_app_views_1.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios_views -->
# mongoimport --jsonArray --db applytics --collection app_views5b69f648537da10190857934 --file .\app_views\dataset_app_views_1.json

<!-- Adiciona ids gerados para o schema de geração do app_views -->

<!-- Gera 7000 entradas de usuarios_views (Para acomadar a chance de repetidos) -->
# mongodb-dataset-generator .\app_views\app_views_schema_2.json -n 7000 -o .\app_views\dataset_app_views_2.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios_views -->
# mongoimport --jsonArray --db applytics --collection app_views5b69f648537da10190857934 --file .\app_views\dataset_app_views_2.json

<!-- Adiciona ids gerados para o schema de geração do app_views -->

<!-- Gera 7000 entradas de usuarios_views (Para acomadar a chance de repetidos) -->
# mongodb-dataset-generator .\app_views\app_views_schema_3.json -n 7000 -o .\app_views\dataset_app_views_3.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere usuarios_views -->
# mongoimport --jsonArray --db applytics --collection app_views5b69f648537da10190857934 --file .\app_views\dataset_app_views_3.json

<!-- Limpa entradas duplicadas -->
# mongo
# use applytics
# db.app_views5b69f648537da10190857934.find({}, {"id_usuario":1}).sort({_id:1}).forEach(function(doc){ db.app_views5b69f648537da10190857934.remove({_id:{$gt:doc._id}, "id_usuario":doc.id_usuario}); });

<!-- =========================================================================================== -->

<!-- Adiciona ids gerados para o schema de geração do app_crashes -->

<!-- 1257 = 754f + 503nf -->

<!-- Gera 322 entradas -->
# mongodb-dataset-generator .\app_crashes\app_crashes_schema_nf1.json -n 322 -o .\app_crashes\dataset_app_crashes_nf1.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere crashes -->
# mongoimport --jsonArray --db applytics --collection app_crashes5b69f648537da10190857934 --file .\app_crashes\dataset_app_crashes_nf1.json

<!-- Gera 115 entradas -->
# mongodb-dataset-generator .\app_crashes\app_crashes_schema_nf2.json -n 115 -o .\app_crashes\dataset_app_crashes_nf2.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere crashes -->
# mongoimport --jsonArray --db applytics --collection app_crashes5b69f648537da10190857934 --file .\app_crashes\dataset_app_crashes_nf2.json

<!-- Gera 66 entradas -->
# mongodb-dataset-generator .\app_crashes\app_crashes_schema_nf3.json -n 66 -o .\app_crashes\dataset_app_crashes_nf3.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere crashes -->
# mongoimport --jsonArray --db applytics --collection app_crashes5b69f648537da10190857934 --file .\app_crashes\dataset_app_crashes_nf3.json

<!-- Gera 497 entradas -->
# mongodb-dataset-generator .\app_crashes\app_crashes_schema_f1.json -n 497 -o .\app_crashes\dataset_app_crashes_f1.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere crashes -->
# mongoimport --jsonArray --db applytics --collection app_crashes5b69f648537da10190857934 --file .\app_crashes\dataset_app_crashes_f1.json

<!-- Gera 158 entradas -->
# mongodb-dataset-generator .\app_crashes\app_crashes_schema_f2.json -n 158 -o .\app_crashes\dataset_app_crashes_f2.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere crashes -->
# mongoimport --jsonArray --db applytics --collection app_crashes5b69f648537da10190857934 --file .\app_crashes\dataset_app_crashes_f2.json

<!-- Gera 99 entradas -->
# mongodb-dataset-generator .\app_crashes\app_crashes_schema_f3.json -n 99 -o .\app_crashes\dataset_app_crashes_f3.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere crashes -->
# mongoimport --jsonArray --db applytics --collection app_crashes5b69f648537da10190857934 --file .\app_crashes\dataset_app_crashes_f3.json

<!-- ====================================================================================== -->

<!-- 33763 -->

<!-- Gera 14258 entradas -->
# mongodb-dataset-generator .\app_sessoes\app_sessoes_schema_1.json -n 14258 -o .\app_sessoes\dataset_app_sessoes_1.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere sessoes -->
# mongoimport --jsonArray --db applytics --collection app_sessoes5b69f648537da10190857934 --file .\app_sessoes\dataset_app_sessoes_1.json

<!-- Gera 12321 entradas -->
# mongodb-dataset-generator .\app_sessoes\app_sessoes_schema_2.json -n 12321 -o .\app_sessoes\dataset_app_sessoes_2.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere sessoes -->
# mongoimport --jsonArray --db applytics --collection app_sessoes5b69f648537da10190857934 --file .\app_sessoes\dataset_app_sessoes_2.json

<!-- Gera 7184 entradas -->
# mongodb-dataset-generator .\app_sessoes\app_sessoes_schema_3.json -n 7184 -o .\app_sessoes\dataset_app_sessoes_3.json

<!-- Trocar $date por ISODate para gerar datas de forma correta -->

<!-- Insere sessoes -->
# mongoimport --jsonArray --db applytics --collection app_sessoes5b69f648537da10190857934 --file .\app_sessoes\dataset_app_sessoes_3.json