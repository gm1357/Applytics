app = require('./conf/express')();

var configDB = require('./conf/database.js');
mongoose.connect(configDB.url);

app.listen(3000,function(){
    console.log("servidor rodando");
});