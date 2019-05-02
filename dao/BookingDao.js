var db = require('./Db');
var mysql = require('mysql');

const adminId = 1;
const date = new Date();


// Read Booking
exports.readBooking = function (confirmationNum, cb) {
    // read booking
    var query1 = "Select * from booking where confirmation_num = ?";
    db.query(query1, [confirmationNum], function (err, result1, fields) {
        if (err) {
            db.rollback(function () {
                throw err;
            });
        }
        var booking = result1[0];

        var query2 = "Select * from user where user_id = ?"
        db.query(query2, [booking.user_id], function (err, result2, fields) {
            if (err) {
                db.rollback(function () {
                    throw err;
                });
            }

            booking.user = result2[0];
            delete booking.user_id;

            // search for tickets under this booking
            var query3 = "Select * from ticket where booking_id = ?"
            db.query(query3, [booking.booking_id], function (err, result3, fields) {
                if (err) {
                    db.rollback(function () {
                        throw err;
                    });
                }

                // add traveler and flight info into tickets
                var tickets = result3;
                for (i = 0; i < tickets.length; i++) {
                    var ticketInfo = tickets[i];
                    var query4 = "Select * from flight where flight_id = ?"
                    db.query(query4, [ticketInfo.flight_id], function (err, result4, fields) {
                        if (err) {
                            db.rollback(function () {
                                throw err;
                            });
                        }
                        ticketInfo.flight = result4[0];
                        delete ticketInfo.flight_id;

                        var query3 = "Select * from user where user_id = ?"
                        db.query(query3, [ticketInfo.user_id], function (err, result3, fields) {
                            if (err) {
                                db.rollback(function () {
                                    throw err;
                                });
                            }
                            ticketInfo.user = result3[0];
                            delete ticketInfo.user_id;
                            tickets[i] = ticketInfo;

                            if (i == tickets.length -1) {
                                // assign tickets info into booking
                                delete booking.age;
                                booking.ticket = tickets;
                                console.log(booking);
                                cb(err, booking, fields);
                            }
                        });
                    });
                }
            });
        });
    });
}

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