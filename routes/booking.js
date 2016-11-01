var express = require('express');
var each = require('foreach');
var router = express.Router();
var mysql = require('mysql');
var async = require('async');
var moment = require('moment');

var pool  = mysql.createPool({
    host: "166.62.27.168",
    user: "dimuthu",
    password: "0773432552ijse4E",
    database: "airticketbooking",
    dateStrings:true,
});

function hasDocuments(con, user_id, res) {
    async.waterfall([
        function (callback) {
            var result = [];
            con.query('SELECT * FROM document WHERE user_id=\''+user_id+'\'', function (err, rows) {
                if (err) throw err;
                for(i=0;i<rows.length;i++){
                    result.push({user_id:user_id,document_no:rows[i].document_no,issuing_authority:rows[i].issuing_authority,dob:rows[i].dob,nationality:rows[i].nationality,expire_date:rows[i].expire_date});
                };
                con.release();
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
                callback(null,user_id);
            });

        },
        function(user_id,callback){
            var email = '';
            var mobile = '';
            con.query('SELECT email,mobile FROM user WHERE id=\''+user_id+'\'', function (err, rows) {
                if (err) throw err;
                for (i = 0; i < rows.length; i++) {
                    email = rows[i].email;
                    mobile = rows[i].mobile;
                }
                con.release();
                callback(null,email,mobile);
            });
        },
        function (email,mobile, callback) {
            var helper = require('sendgrid').mail

            from_email = new helper.Email("kjtdimuthu.13@cse.mrt.ac.lk")
            to_email = new helper.Email('nuwan910730@gmail.com')
            subject = "Ticket Booking"
            content = new helper.Content("text/plain", "Thank you for booking. If any inquiry call +94777323498")
            mail = new helper.Mail(from_email, subject, to_email, content)

            var sg = require('sendgrid')('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');
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
            });

            sg.API(request, function(error, response) {
                console.log(response.statusCode)
                console.log(response.body)
                console.log(response.headers)
            });

            callback(null,mobile);
        },
        function (mobile, callback) {
            // Twilio Credentials
            var accountSid = 'ACb1c6f0ccb34ac2d7aaee85cc8a9d5a34';
            var authToken = '[AuthToken]';

            //require the Twilio module and create a REST client
            var client = require('twilio')(accountSid, authToken);

            client.messages.create({
                to: mobile,
                from: "+17542276508",
                body: "You have successfully booked a ticket",
            }, function(err, message) {
                console.log(message);
            });

            callback(null,"Success");
        }
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
                con.release();
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
                con.release();
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
    pool.getConnection(function(err, con) {
        hasDocuments(con, user_id, res);
    });


});

/* GET bookings. */
router.get('/flight/user/:user/from/:from/to/:to/date/:date/passengers/:passengers/direct/:direct/price/:price/carrier/:carrier', function (req, res, next) {
    var user_id = req.params.user_id;
    pool.getConnection(function(err, con) {
        book_flight(con,req, res);
    });


});

/* GET update bookings. */
router.get('/update/booking_id/:booking_id/status/:status', function (req, res, next) {
    var user_id = req.params.user_id;
    pool.getConnection(function(err, con) {
        update_booking(con,req, res);
    });


});

/* GET view bookings. */
router.get('/view/user/:user', function (req, res, next) {
    var user_id = req.params.user_id;
    pool.getConnection(function(err, con) {
        view_booking(con,req, res);
    });


});



module.exports = router;
