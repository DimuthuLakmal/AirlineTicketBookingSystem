var express = require('express');
var router = express.Router();
var mysql  =  require('mysql');
var async = require('async');


var results=[];
function search_vehicle(con,airport,passengers,type,res) {
    async.waterfall([
        function(callback){
            var country = '';
            con.query('SELECT * FROM airport WHERE name=\''+airport+'\'', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    country = rows[i].country;
                }
                callback(null,country);
            });
        },
        function(country,callback){
            var vehicleDetails = {};
            con.query('SELECT * FROM user u, vehicle v WHERE v.type=\''+type+'\' AND v.passenger>='+passengers+' AND u.country=\''+country+'\' AND u.id=v.user_id', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    console.log(row);
                    vehicleDetails = {username:row.username,email:row.email,mobile:row.mobile,vehicle_no:row.vehicle_no,passenger:row.passenger,type:row.type,lat:row.lat,lan:row.lan};
                    results.push(vehicleDetails);
                }
                callback(null,results);
            });
        }
    ], function (err, results) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(results);
    });
}

/* GET vehicle_search. */
router.get('/airport/:airport/passengers/:passengers/type/:type', function(req, res, next) {
    var airport = req.params.airport;
    var passengers = req.params.passengers;
    var type = req.params.type;
    var con = mysql.createConnection({
        host: "us-cdbr-iron-east-04.cleardb.net",
        user: "b368700be279d3",
        password: "7d47c6dc",
        database: "heroku_f29a3ff653c345e",
    });
    search_vehicle(con,airport,passengers,type,res);
});

module.exports = router;