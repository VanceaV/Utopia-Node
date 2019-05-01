var db = require('./Db');
var mysql = require('mysql');

const adminId = 1;

const today = new Date();

console.log(today);


exports.getFlightList = function (date, depAirportId, arrAirportId, cb) {

    var query = "SELECT * From flight " +
        "where dep_airport_id =" + mysql.escape(depAirportId) +
        "and arr_airport_id =" + mysql.escape(arrAirportId) +
        "and dep_dateTime >=" + mysql.escape(date) +
        "and dep_dateTime <DATE_ADD(" + mysql.escape(date) + ", INTERVAL 1 DAY)" +
        "order by dep_dateTime";

    db.query(query, function (err, result, fields) {
        cb(err, result, fields);
    });
}


exports.decreaseFlightCapacity = function (data, cb) {

    console.log(data);

    var flightsArray = data.flights;
    db.beginTransaction(function (err) {
        if (err) cb(err, null);

        for (var i = 0; i < flightsArray.length; i++) {

            console.log(flightsArray[i].flightId);

            var query = "update flight set capacity = capacity - " + mysql.escape(data.travelerNumber) +
                ", update_by = " + mysql.escape(adminId) +
                ", update_date = " + mysql.escape(today) +
                " where flight_id = " + mysql.escape(flightsArray[i].flightId);
            db.query(query, function (err, result, fields) {
                if(err) {
                    db.rollback(function(){
                        console.log(err);
                        throw err;
                    })
                }
                //cb(err, result,fields);
            });

        }


        db.commit(function(err, res){
          cb(err, res);
        }); 
    });
};








