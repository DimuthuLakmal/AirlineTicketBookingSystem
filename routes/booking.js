var express = require('express');
var each = require('foreach');
var router = express.Router();
var mysql = require('mysql');
var async = require('async');
var moment = require('moment');

function hasDocuments(con, user_id, res) {
    async.waterfall([
        function (callback) {
            var result = [];
            con.query('SELECT * FROM document WHERE user_id=\''+user_id+'\'', function (err, rows) {
                if (err) throw err;
                for(i=0;i<rows.length;i++){
                    result.push({user_id:user_id,document_no:rows[i].document_no,issuing_authority:rows[i].issuing_authority,dob:rows[i].dob,nationality:rows[i].nationality,expire_date:rows[i].expire_date});
                };
                callback(null, result);
            });
        }
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });

}

function book_flight(con, req, res) {
    async.waterfall([

        function(callback){
            var user_id = req.params.user;
            var from = req.params.from;
            var to  = req.params.to;
            var cost = req.params.price;
            var depart = req.params.date;
            var passengers = req.params.passengers;
            var direct = req.params.direct;
            var airline = req.params.carrier;

            var booking = {user_id:user_id,from:from,to:to,cost:cost,depart:depart,passengers:passengers,direct:direct,airline:airline,status:1};

            con.query('INSERT INTO booking SET ?',booking, function (err) {
                if (err) throw err;
                callback(null,"Success");
            });

        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });

}

function update_booking(con,req,res) {
    async.waterfall([
        function(callback){
            var booking_id=req.params.booking_id;
            var status = req.params.status;
            console.log(booking_id+" "+status);
            con.query('UPDATE booking SET status=? WHERE id=?', [status, booking_id],function (err) {
                if (err) throw err;
                callback(null,"Success");
            });
        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

function view_booking(con,req,res) {
    var results = [];
    async.waterfall([
        function(callback){
            var user_id = req.params.user;
            con.query('SELECT * FROM booking WHERE user_id=\''+user_id+'\' AND status=1', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    results.push(row);
                }
                callback(null,results);
            });
        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

/* GET users listing. */
router.get('/documents/user_id/:user_id', function (req, res, next) {
    var user_id = req.params.user_id;
    var con = mysql.createConnection({
        host: "166.62.27.168",
        user: "dimuthu",
        password: "0773432552ijse4E",
        database: "airticketbooking",
    });
    hasDocuments(con, user_id, res);

});

/* GET bookings. */
router.get('/flight/user/:user/from/:from/to/:to/date/:date/passengers/:passengers/direct/:direct/price/:price/carrier/:carrier', function (req, res, next) {
    var user_id = req.params.user_id;
    var con = mysql.createConnection({
        host: "166.62.27.168",
        user: "dimuthu",
        password: "0773432552ijse4E",
        database: "airticketbooking",
    });
    book_flight(con,req, res);

});

/* GET update bookings. */
router.get('/update/booking_id/:booking_id/status/:status', function (req, res, next) {
    var user_id = req.params.user_id;
    var con = mysql.createConnection({
        host: "166.62.27.168",
        user: "dimuthu",
        password: "0773432552ijse4E",
        database: "airticketbooking",
    });
    update_booking(con,req, res);

});

/* GET view bookings. */
router.get('/view/user/:user', function (req, res, next) {
    var user_id = req.params.user_id;
    var con = mysql.createConnection({
        host: "166.62.27.168",
        user: "dimuthu",
        password: "0773432552ijse4E",
        database: "airticketbooking",
    });
    view_booking(con,req, res);

});



module.exports = router;
