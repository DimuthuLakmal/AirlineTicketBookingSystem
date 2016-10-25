var express = require('express');
var each = require('foreach');
var router = express.Router();
var mysql = require('mysql');
var async = require('async');
var API = require('qpx-express');

var result = [];
var apiKey = 'AIzaSyA1668Pe8Ar95A9vko4AbD5FeJ-FEeBspw';
var qpx = new API(apiKey);

function retrieveFlights(con,start,end,date,passengers,direct,res) {
    async.waterfall([
        function(callback){
            var tripOptions = [];
            var slice;
            if(direct==1){
                slice={
                    "origin": start,
                    "destination": end,
                    "date": date, // YYYY-MM-DD
                    "maxStops":1
                };
            }else{
                slice={
                    "origin": start,
                    "destination": end,
                    "date": date
                };
            }
            var body = {
                "request": {
                    "passengers": { "adultCount": passengers },
                    "slice": [slice],
                    "solutions": 10
                }
            };

            qpx.getInfo(body, function(error, data){
                var tripOptionRawData = data.trips.tripOption;
                if(data.trips.tripOption){
                    for(i=0;i<tripOptionRawData.length;i++){
                        var tripOption = tripOptionRawData[i];
                        tripOptions.push({'price':tripOption.saleTotal,'duration':tripOption.slice[0].duration,'segments':[tripOption.slice[0].segment]});
                    }
                }
                callback(error,tripOptions);
            });
        }
    ], function (err, result) {
        console.log(result);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });

}

function handle_database(req,res) {
    var start = req.params.start;
    var end = req.params.end;
    var date = req.params.date;
    var passengers = req.params.passengers;
    var direct = req.params.direct;
    var con = mysql.createConnection({
        host: "166.62.27.168",
        user: "dimuthu",
        password: "0773432552ijse4E",
        database: "airticketbooking",
    });

    retrieveFlights(con,start,end,date,passengers,direct,res);

}

/* GET users listing. */
router.get('/start/:start/end/:end/date/:date/passengers/:passengers/direct/:direct', function (req, res, next) {
    handle_database(req, res);
    //res.send(req.params.start);
});

module.exports = router;
