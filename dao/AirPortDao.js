var db = require('./Db');
var mysql = require('mysql');

exports.getAirportListByName = function(airport_name, cb){

    var query = "SELECT * FROM city inner join airport using(city_id)" + 
        "WHERE city_name ="+ mysql.escape(airport_name)+
        "or country="+mysql.escape(airport_name)+
        "or airport_code="+mysql.escape(airport_name);
        
    db.query(query, function(err, result,fields){
        cb(err, result,fields);
      });

}