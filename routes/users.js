var express = require('express');
var router = express.Router();
var mysql  =  require('mysql');
var async = require('async');

var pool  = mysql.createPool({
  host: "166.62.27.168",
  user: "dimuthu",
  password: "0773432552ijse4E",
  database: "airticketbooking",
});

function login(con,username,password,res) {
  async.waterfall([
    function(callback){
      var user_id;
      var type;
      con.query('SELECT * FROM user WHERE username=\''+username+'\' AND password=\''+password+'\'', function (err, rows) {
        if (err) throw err;
        for(i=0;i<rows.length;i++){
          user_id = rows[i].id;
          type = rows[i].type;
        };
        con.release();
        callback(null, user_id,type);
      });
    },
  ], function (err, user_id,type) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if(user_id){
      res.jsonp([user_id,type]);
    }else{
      res.status(400).send('username & password do not match');
    }
  });
}

function signup_passenger(con,req,res) {
  async.waterfall([

    function(callback){
      var username = req.params.username;
      var password = req.params.password;
      var email = req.params.email;
      var mobile = req.params.mobile;
      var country = req.params.country;
      var type = req.params.type;
      var user = {username:username, password:password,email:email, mobile:mobile, country: country, type:type};

      con.query('INSERT INTO user SET ?',user, function (err) {
        if (err) throw err;
        callback(null);
      });

    },
    function(callback){
      var user_id=0;
      con.query('SELECT LAST_INSERT_ID() as user_id', function (err, rows) {
        if (err) throw err;
        for(i=0;i<rows.length;i++){
          user_id = rows[i].user_id;
        };
        callback(null,user_id);
      });

    },
    function(user_id, callback){
      if(req.params.type === 'Passenger'){
        var firstname = req.params.firstname;
        var lastname = req.params.lastname;
        var middlename = req.params.middlename;
        var gender = req.params.gender;
        var meal_preference = req.params.meal_preference;
        var passenger = {id:user_id, firstname:firstname, lastname:lastname,middlename:middlename, gender:gender, meal_preference: meal_preference};

        con.query('INSERT INTO passenger SET ?',passenger, function (err) {
          if (err) throw err;
          con.release();
          callback(null, user_id);
        });
      }

    }
  ], function (err, user_id) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.jsonp(user_id);
  });
}

function signup_driver(con,req,res) {
  var latitude = req.params.latitude;
  var longitude  = req.params.longitude;
  async.waterfall([

    function(callback){
      var username = req.params.username;
      var password = req.params.password;
      var email = req.params.email;
      var mobile = req.params.mobile;
      var country = req.params.country;
      var type = req.params.type;
      var user = {username:username, password:password,email:email, mobile:mobile, country: country, type:type};

      con.query('INSERT INTO user SET ?',user, function (err) {
        if (err) throw err;
        callback(null);
      });

    },
    function(callback){
      var user_id=0;
      con.query('SELECT LAST_INSERT_ID() as user_id', function (err, rows) {
        if (err) throw err;
        for(i=0;i<rows.length;i++){
          user_id = rows[i].user_id;
        };
        callback(null,user_id);
      });

    },
    function(user_id, callback){
      if(req.params.type === 'Driver'){
        var licence_no = req.params.licence_no;
        var driver = {id:user_id, licence_no:licence_no,latitude:latitude,longitude:longitude};

        con.query('INSERT INTO driver SET ?',driver, function (err) {
          if (err) throw err;
          con.release();
          callback(null, user_id);
        });
      }

    }
  ], function (err, user_id) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.jsonp(user_id);
  });
}

function signup_documents(con,req,res) {
  async.waterfall([
    function(callback){
      var user_id = req.params.user_id;
      var nationality = req.params.nationality;
      var dob = req.params.dob;
      var issuing_authority = req.params.issuing_authority;
      var document_no = req.params.document_no;
      var expire_date = req.params.expire_date;
      var document = {user_id:user_id, document_no:document_no,issuing_authority:issuing_authority, dob:dob, nationality: nationality, expire_date:expire_date};

      con.query('INSERT INTO document SET ?',document, function (err) {
        if (err) throw err;
        callback(null);
      });

    },
    function(callback){
      var document_id=0;
      con.query('SELECT LAST_INSERT_ID() as document_id', function (err, rows) {
        if (err) throw err;
        for(i=0;i<rows.length;i++){
          document_id = rows[i].document_id;
        };
        con.release();
        callback(null,document_id);
      });

    }
  ], function (err, document_id) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.jsonp(document_id);
  });
}

/* GET users login. */
router.get('/login/username/:username/password/:password', function(req, res, next) {
  var username = req.params.username;
  var password = req.params.password;
  pool.getConnection(function(err, con) {
    login(con,username,password,res);
  });

});

/* GET users signup_passenger */
router.get('/signup/username/:username/password/:password/email/:email/mobile/:mobile/country/:country/type/:type/firstname/:firstname/middlename/:middlename/lastname/:lastname/gender/:gender/meal_preference/:meal_preference', function(req, res, next) {
  pool.getConnection(function(err, con) {
    signup_passenger(con, req, res);
  });



});

/* GET users signup_driver */
router.get('/signup/username/:username/password/:password/email/:email/mobile/:mobile/country/:country/type/:type/licence_no/:licence_no/latitude/:latitude/longitude/:longitude', function(req, res, next) {

  pool.getConnection(function(err, con) {
    signup_driver(con, req, res);
  });


});

router.get('/signup/documents/user_id/:user_id/document_no/:document_no/issuing_authority/:issuing_authority/dob/:dob/nationality/:nationality/expire_date/:expire_date', function(req, res, next) {
  pool.getConnection(function(err, con) {
    signup_documents(con, req, res);
  });

  signup_documents(con, req, res);

});

module.exports = router;
