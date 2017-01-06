var express = require('express');
var router = express.Router();
var mysql  =  require('mysql');
var async = require('async');

var pool  = mysql.createPool({
    host: "mysql1003.mochahost.com",
    user: "avixteam_dimuthu",
    password: "Dimuthu@123",
    database: "avixteam_airticketbooking",
    dateStrings:true,
});

function add_vehicle(con,user_id,vehicle_no,passenger,type,res) {
    async.waterfall([
        function(callback){
            var lat = '';
            var lng = '';
            con.query('SELECT latitude,longitude FROM driver WHERE id=\''+user_id+'\'', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    lat = rows[i].latitude;
                    lng = rows[i].longitude;
                }
                callback(null,lat,lng);
            });

        },
        function(lat,lan,callback){
            var vehicle = {user_id:user_id,vehicle_no:vehicle_no,passenger:passenger,type:type,lat:lat,lan:lan};

            con.query('INSERT INTO vehicle SET ?',vehicle, function (err) {
                if (err) throw err;
                con.release();
                callback(null,"Success");
            });

        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

function book_vehicle(con,user_id,vehicle_no,from,to,date,time,passengers,res) {
    async.waterfall([
        function(callback){
            var vehicle_id = '';
            con.query('SELECT id FROM vehicle WHERE vehicle_no=\''+vehicle_no+'\'', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    vehicle_id = rows[i].id;
                }
                callback(null,vehicle_id);
            });
        },
        function(vehicle_id,callback){
            var vehicle_booking = {user_id:user_id,vehicle_id:vehicle_id,from:from,to:to,time:date+" "+time,passengers:passengers,status:0};

            con.query('INSERT INTO booking_vehicle SET ?',vehicle_booking, function (err) {
                if (err) throw err;
                con.release();
                callback(null,"Success");
            });

        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

function update_booking(con,booking_id,status,res) {
    async.waterfall([
        function(callback){
            con.query('UPDATE booking_vehicle SET status=? WHERE id=?', [status, booking_id],function (err) {
                if (err) throw err;
                con.release();
                callback(null,"Success");
            });
        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

function update_ratings(con,vehicle_no,ratings,res) {
    async.waterfall([
        function(callback){
            var user_id = '';
            con.query('SELECT user_id FROM vehicle WHERE vehicle_no=\''+vehicle_no+'\'', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    user_id = rows[i].user_id;
                }
                callback(null,user_id);
            });
        },
        function(user_id,callback){
            con.query('UPDATE driver SET ratings=? WHERE id=?', [ratings, user_id],function (err) {
                if (err) throw err;
                con.release();
                callback(null,"Success");
            });
        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

function view_booking_passenger(con,user_id,res) {
    var results = [];
    async.waterfall([
        function(callback){
            con.query('SELECT * FROM vehicle v,user u,booking_vehicle b WHERE b.user_id=\''+user_id+'\' AND b.vehicle_id=v.id AND u.id=v.user_id AND (b.status=0 OR b.status=2 OR b.status=3)', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    results.push(row);
                }
                con.release();
                callback(null,results);
            });
        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

function view_booking_drivers(con,user_id,res) {
    var results = [];
    async.waterfall([
        function(callback){
            con.query('SELECT * FROM vehicle v,driver d,booking_vehicle b WHERE d.id=\''+user_id+'\' AND b.vehicle_id=v.id AND d.id=v.user_id AND (b.status=0 OR b.status=2)', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    results.push(row);
                }
                con.release();
                callback(null,results);
            });
        },
    ], function (err, result) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.jsonp(result);
    });
}

/* GET register vehicle. */
router.get('/add_vehicle/user_id/:user_id/vehicle_no/:vehicle_no/passenger/:passenger/type/:type', function(req, res, next) {
    var user_id = req.params.user_id;
    var vehicle_no = req.params.vehicle_no;
    var passenger = req.params.passenger;
    var type = req.params.type;
    pool.getConnection(function(err, con) {
        add_vehicle(con,user_id,vehicle_no,passenger,type,res);
    });

});

/* GET register vehicle. */
router.get('/add_booking/user_id/:user_id/vehicle_no/:vehicle_no/from/:from/to/:to/date/:date/time/:time/passengers/:passengers', function(req, res, next) {
    var user_id = req.params.user_id;
    var vehicle_no = req.params.vehicle_no;
    var from = req.params.from;
    var to = req.params.to;
    var date = req.params.date;
    var time = req.params.time;
    var passengers  = req.params.passengers;
    pool.getConnection(function(err, con) {
        book_vehicle(con,user_id,vehicle_no,from,to,date,time,passengers,res);
    });

});

/* GET update status of bookings */
router.get('/update_booking/booking_id/:booking_id/status/:status', function(req, res, next) {
    var booking_id = req.params.booking_id;
    var status = req.params.status;
    pool.getConnection(function(err, con) {
        update_booking(con,booking_id,status,res);
    });

});

/* GET update ratings for drivers*/
router.get('/update_ratings/vehicle_no/:vehicle_no/ratings/:ratings', function(req, res, next) {
    var vehicle_no = req.params.vehicle_no;
    var ratings = req.params.ratings;
    pool.getConnection(function(err, con) {
        update_ratings(con,vehicle_no,ratings,res);
    });

});


/* GET view bookings for passengers*/
router.get('/view_booking_passenger/user_id/:user_id', function(req, res, next) {
    var user_id = req.params.user_id;
    pool.getConnection(function(err, con) {
        view_booking_passenger(con,user_id,res);
    });

});

/* GET view bookings for drivers*/
router.get('/view_booking_drivers/user_id/:user_id', function(req, res, next) {
    var user_id = req.params.user_id;
    pool.getConnection(function(err, con) {
        view_booking_drivers(con,user_id,res);
    });

});

module.exports = router;