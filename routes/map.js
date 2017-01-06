var express = require('express');
var each = require('foreach');
var router = express.Router();
var mysql  =  require('mysql');
var async = require('async');

var pool  = mysql.createPool({
    host: "mysql1003.mochahost.com",
    user: "avixteam_dimuthu",
    password: "Dimuthu@123",
    database: "avixteam_airticketbooking",
});

function retrieveAirports(con,country,res) {

    async.waterfall([
        function(callback){
            var airports=[];
            con.query('SELECT * FROM airport WHERE country=\''+country+'\'', function (err, rows) {
                if (err) throw err;
                    for(i=0;i<rows.length;i++){
                        var airport_id = rows[i].id;
                        var lat = rows[i].lat;
                        var lan = rows[i].lan;
                        var name = rows[i].name;
                        airports.push({'id':airport_id,'lat':lat,'lan':lan,'name':name});
                    };
                con.release();
                callback(null, airports);
            });
        }
    ], function (err, result) {
        console.log(result);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });

}

function handle_database(req,res) {
    var country = req.params.country;

    pool.getConnection(function(err, con) {
        retrieveAirports(con,country,res);
    });


}

/* GET users listing. */
router.get('/country/:country', function (req, res, next) {
    handle_database(req, res);
});

module.exports = router;