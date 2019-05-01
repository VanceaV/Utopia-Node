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

value = "SELECT * From flight " + 
			"where dep_airport_id =:depAirportId and arr_airport_id =:arrAirportId " + 
			"and dep_dateTime >=:date and dep_dateTime <DATE_ADD(:date, INTERVAL 1 DAY) "
			+ "order by dep_dateTime", nativeQuery = true







@Query(value = "SELECT * From flight " + 
"where dep_airport_id =:depAirportId and arr_airport_id =:arrAirportId " + 
"and dep_dateTime >=:date and dep_dateTime <DATE_ADD(:date, INTERVAL 1 DAY) "
+ "order by dep_dateTime", nativeQuery = true)
List<Flight> getFlightList(@Param("date") Date date, @Param("depAirportId") Long depAirportId, @Param("arrAirportId") Long arrAirportId);