var express = require('express');
var each = require('foreach');
var router = express.Router();
var mysql = require('mysql');
var async = require('async');
var API = require('qpx-express');

var result = [];
var apiKey = 'AIzaSyA1668Pe8Ar95A9vko4AbD5FeJ-FEeBspw';
var qpx = new API(apiKey);

var pool  = mysql.createPool({
    host: "166.62.27.168",
    user: "dimuthu",
    password: "0773432552ijse4E",
    database: "airticketbooking",
});

function retrieveFlights(con, start, end, date, passengers, direct, res) {
    async.waterfall([
        function (callback) {
            var tripOptions = [];
            var slice;
            if (direct == 1) {
                slice = {
                    "origin": start,
                    "destination": end,
                    "date": date, // YYYY-MM-DD
                    "maxStops": direct,
                };
            } else {
                slice = {
                    "origin": start,
                    "destination": end,
                    "date": date
                };
            }
            var body = {
                "request": {
                    "passengers": {"adultCount": passengers},
                    "slice": [slice],
                    "solutions": 10
                }
            };

            qpx.getInfo(body, function (error, data) {
                console.log(data.trips);
                if (data.trips.tripOption) {
                    console.log(data.trips);
                    var carriers = data.trips.data.carrier;
                    var tripOptionRawData = data.trips.tripOption;
                    for (i = 0; i < tripOptionRawData.length; i++) {
                        var tripOption = tripOptionRawData[i];
                        var carrier = tripOption.slice[0].segment[0].flight.carrier;
                        var departureTime = tripOption.slice[0].segment[0].leg[0].departureTime;
                        var arrivalTime = tripOption.slice[0].segment[tripOption.slice[0].segment.length-1].leg[0].arrivalTime;
                        var carrierName="";
                        var carrierNameURL = ""
                        for(j=0;j<carriers.length;j++){
                            if(carriers[j].code==carrier){
                                carrierName = carriers[j].name;
                                carrierNameURL = 'img/airlines/'+carrierName.replace(/\s/g, '').toLowerCase()+".png";
                            }
                        }
                        tripOptions.push({
                            'carrierName': carrierName,
                            'carrierNameURL': carrierNameURL,
                            'price': tripOption.saleTotal,
                            'duration': tripOption.slice[0].duration,
                            'departureTime':departureTime,
                            'arrivalTime':arrivalTime,
                            'segments': tripOption.slice[0].segment,
                            'carriers':carriers,
                        });
                    }
                }
                con.release();
                callback(error, tripOptions);
            });
        }
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });

}

function searchName(con, req, res) {
    var name = "";
    async.waterfall([
        function(callback){
            con.query('SELECT name FROM airport WHERE short_code=\''+req.params.airport+'\'', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    name = rows[i].name;
                }
                con.release();
                callback(null,name);
            });
        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

function handle_database(req, res) {
    var start = req.params.start;
    var end = req.params.end;
    var date = req.params.date;
    var passengers = req.params.passengers;
    var direct = req.params.direct;
    pool.getConnection(function(err, con) {
        retrieveFlights(con, start, end, date, passengers, direct, res);
    });

}

/* GET users listing. */
router.get('/start/:start/end/:end/date/:date/passengers/:passengers/direct/:direct', function (req, res, next) {
    handle_database(req, res);
    //res.send(req.params.start);
});

router.get('/airport/:airport', function (req, res, next) {
    pool.getConnection(function(err, con) {
        searchName(con, req, res);
    });
});

module.exports = router;
