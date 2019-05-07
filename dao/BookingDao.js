var db = require('./Db');
var travelerDao = require('./TravelerDao');
var flightDao = require('./FlightDao');
var paymentDao = require('./PaymentDao');
const adminId = 1;
const date = new Date();


// Save Booking
exports.save = function(booking){
    return  new Promise((resolve,reject)=>{
        var query = "INSERT INTO booking (confirmation_num, create_date, orderSubmit, create_by, user_id)"
                + " VALUES (?,?, ?, ?,?)";
        db.query(query,[booking.confirmation_num, booking.create_date, booking.orderSubmit, booking.user.user_id, booking.user.user_id],
            function(err, res){

                if(err){
                    db.rollback(function(err, res){
                    reject(err);
                    });
                }
                booking.booking_id = res.insertId;
                resolve(booking);
        });
    });
}

// Cancel Booking
exports.cancelbooking = function (bookingId) {

    return new Promise ((resolve,reject)=>{

        db.beginTransaction(function (err) {
            if (err) { reject(err) }

            travelerDao.getNumberOfTravelersForABooking(bookingId).then(function(res){
                var travelerNum = res.length;
                flightDao.getFlightListFromBooking(bookingId).then(function(res){
                    var flights = res;
                    for (var i = 0; i < flights.length; i++) {
                        flightDao.increaseCapacityOfFlights(travelerNum,adminId,date,flights[i].flight_id);
                    }    
                })
                setBookingTofalse(bookingId).then(function(resolver){
                    paymentDao.setPaymentToFalse(date, adminId, bookingId).then(function(res){
                        db.commit(function (err) {
                            if (err) {
                                db.rollback(function () {
                                    throw err;
                                });
                            }
                            db.end();
                            resolve("'Transaction Complete.'")
                        });
                    })
                })
            })
        });
    });
}


setBookingTofalse = function (bookingId) {

    return new Promise ((resolve,reject)=>{
        var query = "update booking set orderSubmit = false, update_date = ?, update_by = ? "
                    + "where booking_id = ?"
        db.query(query,[date, adminId, bookingId], function (err, result) {

            if(err){
                reject(err)
            }else{
                resolve(result)
            } 
        });
    }); 
}
   
