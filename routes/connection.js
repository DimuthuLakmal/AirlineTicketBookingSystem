var mysql     =    require('mysql');

module.exports = {
    pool : mysql.createPool({
        connectionLimit: 100, //important
        host: "166.62.27.168",
        user: "dimuthu",
        password: "0773432552ijse4E",
        database: "airticketbooking",
        debug: false
    })
}