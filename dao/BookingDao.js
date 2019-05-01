var db = require('./Db');
var mysql = require('mysql');

const adminId = 1;
const date = new Date();


// Read Booking



// Cancel Booking
exports.cancelbooking = function (bookingId, cb) {
    var travelerNum = 0;
    console.log("cancelBooking");
    /* Begin transaction */
    db.beginTransaction(function (err) {
        if (err) { throw err; }

        // get the number of travlers under this booking
        var query1 = "Select * from user where user_id in " +
            "(SELECT user_id from ticket where booking_id = ? group by user_id)";
        db.query(query1, [bookingId], function (err, result1) {
            if (err) {
                db.rollback(function () {
                    throw err;
                });
            }
            // number of travlers
            var travelerNum = result1.length;
            console.log(travelerNum);

            // get flights from the booking
            var query2 = "Select * from flight where flight_id in "
                + "(SELECT flight_id FROM ticket where booking_id = ? Group by flight_id)"
            db.query(query2, [bookingId], function (err, result2) {
                if (err) {
                    db.rollback(function () {
                        throw err;
                    });
                }
                // list of a flight
                var flights = result2;
                console.log(flights);

                // increase the capacity of flights
                for (i = 0; i < flights.length; i++) {
                    query3 = "update flight f set f.capacity = f.capacity + ?, update_by =?, "
                        + "update_date = ?  where f.flight_id = ?";
                    db.query(query3, [travelerNum, adminId, date, flights[i].flight_id], function (err, result, fields) {
                        if (err) {
                            db.rollback(function () {
                                throw err;
                            });
                        }
                    });
                    console.log(flights[i].flightId);
                }

                // set booking to false
                var query4 = "update booking set orderSubmit = false, update_date = ?, update_by = ? "
                    + "where booking_id = ?"
                db.query(query4, [date, adminId, bookingId], function (err, result2) {
                    if (err) {
                        db.rollback(function () {
                            throw err;
                        });
                    }

                    // set payment to false
                    var query5 = "update payment set payment_status = false, update_date = ?, update_by = ? "
                        + "where bookingId = ?"
                    db.query(query4, [date, adminId, bookingId], function (err, result2) {
                        if (err) {
                            db.rollback(function () {
                                throw err;
                            });
                        }

                        db.commit(function (err) {
                            if (err) {
                                db.rollback(function () {
                                    throw err;
                                });
                            }
                            console.log('Transaction Complete.');
                            db.end();
                        });
                    });
                });
            });
        });
    });
};