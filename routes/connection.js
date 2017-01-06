var mysql     =    require('mysql');

module.exports = {
    pool : mysql.createPool({
        connectionLimit: 100, //important
        host: "mysql1003.mochahost.com",
        user: "avixteam_dimuthu",
        password: "Dimuthu@123",
        database: "avixteam_airticketbooking",
        debug: false
    })
}