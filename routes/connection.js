var mysql     =    require('mysql');

module.exports = {
    pool : mysql.createPool({
        connectionLimit: 100, //important
        host: "us-cdbr-iron-east-04.cleardb.net",
        user: "b368700be279d3",
        password: "7d47c6dc",
        database: "heroku_f29a3ff653c345e",
        debug: false
    })
}