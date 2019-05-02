var db = require('./Db');
var mysql = require('mysql');

const adminId = 1;
const date = new Date();

// create Booking
exports.createbooking = function (data, cb) {
    console.log("creating booking ...");
    var users = data.users; // list of users (travelers)
    var booking = data.booking;
    var flights = data.flights // list of flights
    var payment = data.payment;

    /* Begin transaction */
    db.beginTransaction(function (err) {
        if (err) { 
            db.end(); 
            throw err; 
        }

        // 1. save the user who booked the reservation
        var user = booking.user;
        user.create_by = adminId;
        user.create_date = date;
        var query1 = "INSERT INTO user (active, create_date, email, first_name, last_name, phone) " +
            "VALUES (0, ?, ?, ?, ?, ?);"
        db.query(query1, [date, user.email, user.first_name, user.last_name, user.phone], function (err, result1) {
            if (err) {
                db.rollback(function () {
                    throw err;
                });
            }

            // assign id to the user
            user.user_id = result1.insertId;
            booking.user = user;
            delete booking.user_id;
            console.log("user.user_id: " + user.user_id);

            // generate confirmation number with size 20
            booking.confirmation_num = makeConfirmationId(20);
            booking.create_date = date;
            booking.orderSubmit = true;

            // 2. create booking
            var query2 = "INSERT INTO booking (confirmation_num, create_date, orderSubmit, create_by, user_id)"
                + " VALUES (?,?, ?, ?,?)";
            db.query(query2, [booking.confirmation_num, booking.create_date, booking.orderSubmit, user.user_id, user.user_id], function (err, result2) {
                if (err) {
                    db.rollback(function () {
                        throw err;
                    });
                }
                // update booking id 
                booking.booking_id = result2.insertId
                console.log("booking.booking_id: " + booking.booking_id);

                // 3. create payment
                payment.booking_id = booking.booking_id;
                payment.payment_status = true;
                payment.create_date = date;
                payment.create_by = adminId;
                var query3 = "INSERT INTO payment (create_date, payment_status, booking_id,"
                    + " create_by) VALUES (?, ?, ?,?)";
                db.query(query3, [payment.create_date, payment.payment_status, payment.booking_id, payment.create_by], function (err, result3) {
                    if (err) {
                        db.rollback(function () {
                            throw err;
                        });
                    }
                    // update payment id
                    payment.payment_id = result3.insertId;
                    booking.payment = [];
                    booking.payment.push(payment);
                    console.log("booking.payment.payment_id: " + booking.payment[0].payment_id);

                    // 4. generate tickets
                    booking.ticket = [];
                    for (travelerNum = 0; travelerNum < users.length; travelerNum++) {
                        var traveler = users[travelerNum]
                        traveler.active = false;
                        traveler.create_date = date;
                        traveler.create_by = adminId;

                        // 4.1 first add new traveler (4)
                        query4 = "INSERT INTO user (active, create_date, email, first_name,"
                            + "last_name, phone) VALUES (?, ?, ?, ?, ?, ?);";
                        db.query(query4, [false, traveler.create_date, traveler.email, traveler.first_name,
                            traveler.last_name, traveler.phone], function (err, result4, fields) {
                            if (err) {
                                db.rollback(function () {
                                        throw err;
                                    });
                                }
                                // update traveler id
                                traveler.user_id = result4.insertId;

                                for (flightNum = 0; flightNum < flights.length; flightNum++) {

                                    var ticket = {};
                                    ticket.booking_id = booking.booking_id;
                                    ticket.flight = flights[flightNum];
                                    ticket.user = traveler;
                                    ticket.create_date = date;
                                    ticket.create_by = adminId;
                                    console.log(date+","+ticket.booking_id+","+ adminId+","+ ticket.flight.flight_id+","+ticket.booking_id);
                                    // 4.2 second create tickets for traveler (5)
                                    query5 = "INSERT INTO ticket (create_date, booking_id, create_by, flight_id, user_id) VALUES (?, ?, ?, ?,?)";
                                    db.query(query5, [date, ticket.booking_id, adminId, ticket.flight.flight_id, ticket.user.user_id], function (err, result5, fields) {
                                        if (err) {
                                            db.rollback(function () {
                                                throw err;
                                            });
                                        }
                                        //update ticket id
                                        console.log(result5.insertId);
                                        ticket.ticket_id = result5.insertId;
                                        booking.ticket.push(ticket);

                                        if(booking.ticket.length == ( users.length * flights.length)){
                                            db.commit(function (err) {
                                                if (err) {
                                                    db.rollback(function () {
                                                        throw err;
                                                    });
                                                }
                                                console.log(booking);
                                                console.log('Booking creating Completed.');
                                                db.end();
                                                cb(err, booking, fields);
                                            });
                                        }
                                    });
                                }
                            });
                    }
                });
            });
        });
    });
};

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

                            if (i == tickets.length - 1) {
                                // assign tickets info into booking
                                delete booking.age;
                                booking.ticket = tickets;
                                db.end();
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
                    db.query(query3, [travelerNum, adminId, date, flights[i].flight_id], function (err, result3, fields) {
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
                db.query(query4, [date, adminId, bookingId], function (err, result4) {
                    if (err) {
                        db.rollback(function () {
                            throw err;
                        });
                    }

                    // set payment to false
                    var query5 = "update payment set payment_status = false, update_date = ?, update_by = ? "
                        + "where bookingId = ?"
                    db.query(query5, [date, adminId, bookingId], function (err, result5) {
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
                            cb(err, fields);
                        });
                    });
                });
            });
        });
    });
};

function makeConfirmationId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 