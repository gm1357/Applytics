app = require('./conf/express')();

app.listen(process.env.PORT,function(){
    console.log("servidor rodando na porta "+process.env.PORT);
});