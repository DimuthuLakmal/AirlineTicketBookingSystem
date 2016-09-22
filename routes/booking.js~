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

function handle_database(req, res) {
}

/* GET users listing. */
router.get('/documents/user_id/:user_id', function (req, res, next) {
    var user_id = req.params.user_id;
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "ijse",
        database: "airticketbooking",
        dateStrings:true,
    });
    hasDocuments(con, user_id, res);

});

module.exports = router;
