var express = require('express');
var each = require('foreach');
var router = express.Router();
var mysql  =  require('mysql');
var async = require('async');


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
    var con = mysql.createConnection({
        host: "us-cdbr-iron-east-04.cleardb.net",
        user: "b368700be279d3",
        password: "7d47c6dc",
        database: "heroku_f29a3ff653c345e",
    });

    retrieveAirports(con,country,res);

}

/* GET users listing. */
router.get('/country/:country', function (req, res, next) {
    handle_database(req, res);
});

module.exports = router;