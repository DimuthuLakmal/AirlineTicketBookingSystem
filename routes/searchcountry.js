var express = require('express');
var each = require('foreach');
var router = express.Router();
var mysql  =  require('mysql');
var async = require('async');

var pool  = mysql.createPool({
    host: "166.62.27.168",
    user: "dimuthu",
    password: "0773432552ijse4E",
    database: "airticketbooking",
});

function autosearch(con,keyword,res) {
    var results=[];
    async.waterfall([
        function(callback){
            con.query('SELECT distinct country FROM airport WHERE country like \''+keyword+'%\'', function (err, rows) {
                if (err) throw err;
                for(i=0;i<rows.length;i++){
                    var airport_id = rows[i].id;
                    var lat = rows[i].lat;
                    var lan = rows[i].lan;
                    var name = rows[i].name;
                    var country = rows[i].country;
                    results.push(country);
                };
                callback(null);
            });
        },
        function(callback){
            con.query('SELECT distinct name FROM airport WHERE name like \''+keyword+'%\'', function (err, rows) {
                if (err) throw err;
                for(i=0;i<rows.length;i++){
                    var airport_id = rows[i].id;
                    var lat = rows[i].lat;
                    var lan = rows[i].lan;
                    var name = rows[i].name;
                    var country = rows[i].country;
                    results.push(name);
                };
                con.release();
                callback(null, results);
            });
        }
    ], function (err, result) {
        console.log(result);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });

}

function searchShortCode(con,keyword,res){
    var results=[];
    async.waterfall([
        function(callback){
            con.query('SELECT name,short_code FROM airport WHERE country=\''+keyword+'\' OR name=\''+keyword+'\'', function (err, rows) {
                if (err) throw err;
                for(i=0;i<rows.length;i++){
                    var short_code = rows[i].short_code;
                    var name = rows[i].name;
                    results.push({shortcode:short_code,name:name});
                };
                con.release();
                callback(null,results);
            });
        }
    ], function (err, result) {
        console.log(result);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

/* GET users listing. */
router.get('/autosearch/keyword/:keyword', function (req, res, next) {
    var keyword = req.params.keyword;
    pool.getConnection(function(err, con) {
        autosearch(con,keyword,res);
    });

});

router.get('/searchcode/keyword/:keyword', function (req, res, next) {
    var keyword = req.params.keyword;
    pool.getConnection(function(err, con) {
        searchShortCode(con,keyword,res);
    });

});

module.exports = router;