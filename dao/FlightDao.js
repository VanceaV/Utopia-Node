var db = require('./Db');
var mysql = require('mysql');

const adminId = 1;

const today = new Date();

console.log(today);


exports.getFlightList = function (date, depAirportId, arrAirportId) {

    return new Promise ((resolve,reject)=>{

        var query = "SELECT * From flight " +
        "where dep_airport_id = ? and arr_airport_id = ? and dep_dateTime >= ? and dep_dateTime <DATE_ADD( ?, INTERVAL 1 DAY) order by dep_dateTime";

        db.query(query,[depAirportId,arrAirportId,date,date], function (err, result, fields) {

            if(err){
                reject(err)
            }else{
                resolve(result)
            } 
        });

    }); 
}


exports.decreaseFlightCapacity = function (data) {

   return  new Promise ((resolve,reject)=>{
        var flightsArray = data.flights;
        db.beginTransaction(function (err) {
            if (err) reject(err);
            for (var i = 0; i < flightsArray.length; i++) {
                var query = "update flight set capacity = capacity - ?, update_by = ?, update_date = ? where flight_id = ?";
                    db.query(query, [data.travelerNumber,adminId,today,flightsArray[i].flightId],function (err, result, fields) {
                        if(err) {
                        db.rollback(function(){
                        reject(err);
                    })
                }
            });
        }

        db.commit(function(err, res){
          if(err){
              reject(err);
          }else{
              resolve(res);
          }
        }); 
    });
   }); 
};


exports.getFlightListFromBooking = function (bookingId) {

    return new Promise ((resolve,reject)=>{

        var query = "Select * from flight where flight_id in "
                + "(SELECT flight_id FROM ticket where booking_id = ? Group by flight_id)"
        db.query(query,[bookingId], function (err, result) {

            if(err){
                reject(err)
            }else{
                resolve(result)
            } 
        });
    }); 
}

exports.increaseCapacityOfFlights = function (travelerNum,adminId,date,flight_id) {

    return new Promise ((resolve,reject)=>{

        query = "update flight f set f.capacity = f.capacity + ?, update_by =?, "
                        + "update_date = ?  where f.flight_id = ?";
        db.query(query,[travelerNum,adminId,date,flight_id], function (err, result) {

            if(err){
                reject(err)
            }else{
                resolve(result)
            } 
        });
    }); 
}













