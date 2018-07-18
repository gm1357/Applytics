require('dotenv').load();
var mysql = require('mysql');

function createDBConnection() {
    var db = 'applytics';

    if (process.env.NODE_ENV === 'test') {
        db = 'applytics_test';
    }

    return connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password : process.env.DB_PASS,
        database: applytics,
    });
}

module.exports = function() {
    return createDBConnection;
}