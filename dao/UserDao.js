var db = require('./Db');
var mysql = require('mysql');

exports.getFlightList = function(date,depAirportId,arrAirportId, cb){

    var query = "SELECT * FROM city inner join airport using(city_id)" + 
        "where dep_airport_id ="+ mysql.escape(depAirportId)+
        "and arr_airport_id ="+ mysql.escape(arrAirportId)+
        "or country="+mysql.escape(airport_name)+
        "or airport_code="+mysql.escape(airport_name);
        
    db.query(query, function(err, result,fields){
        cb(err, result,fields);
      });

}