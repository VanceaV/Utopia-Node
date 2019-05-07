var routes = require('express').Router();
var userDao = require('./UserDao');
var bookingDao = require('./BookingDao');
var paymentDao = require('./PaymentDao');
var ticketDao = require('./TicketDao');
var db = require('./Db');

const adminId = 1;
const date = new Date();


exports.confirmBookingReserv = function(bookingDetail){

  return new Promise ((resolve,reject)=>{

    db.beginTransaction(function(err){
      if(err) reject(err);

      userDao.save(bookingDetail.booking.user).then(function(value){
        bookingDetail.booking.user=value;
  
        bookingDetail.booking.confirmation_num = makeConfirmationId(20);
        bookingDetail.booking.create_date = date;
        bookingDetail.booking.orderSubmit = true;;
  
        bookingDao.save(bookingDetail.booking).then(function(value){
          bookingDetail.booking=value;
          bookingDetail.payment.payment_status = true;
          bookingDetail.payment.create_date = date;
          bookingDetail.payment.create_by = adminId;
  
          
          paymentDao.save(bookingDetail.payment).then(function(value){
            bookingDetail.payment=value;
            bookingDetail.booking.payment = [];
            bookingDetail.booking.payment.push(bookingDetail.payment); 
            bookingDetail.booking.ticket = [];
  
  
            for (var travelerNum = 0; travelerNum < bookingDetail.users.length; travelerNum++) {
              var traveler = bookingDetail.users[travelerNum];
              traveler.active = false;
              traveler.create_date = date;
              traveler.create_by = adminId;
              userDao.save(traveler).then(function(value){
                traveler=value;
  
  
                
                for (var flightNum = 0; flightNum < bookingDetail.flights.length; flightNum++) {
                  var ticket = {};
                  ticket.booking_id = bookingDetail.booking.booking_id;
                  ticket.flight = bookingDetail.flights[flightNum];
                  ticket.user = traveler;
                  
                  ticket.create_date = date;
                  ticket.create_by = adminId;
                  ticketDao.save(ticket).then(function(value){
                    ticket=value;
                  }).catch(function(reject){
                    throw(reject);
                  });
                  bookingDetail.booking.ticket.push(ticket);


                  if(bookingDetail.booking.ticket.length == ( bookingDetail.users.length * bookingDetail.flights.length)){
                    db.commit(function (err) {
                        if (err) {
                            db.rollback(function () {
                                throw err;
                            });
                        }
                        db.end();
                    });
                    resolve(bookingDetail.booking);
                  } 
                }
              });
            }
          });
        });
      });
    });
  });
}


exports.getNumberOfTravelersForABooking=function(bookingId){

  return  new Promise((resolve,reject)=>{
    var query = "Select * from user where user_id in " +
    "(SELECT user_id from ticket where booking_id = ? group by user_id)";
    db.query(query,[bookingId],function(err, res){
      if(err){
        db.rollback(function(err){
          reject(err)
        });
      }
      //console.log(res);
      console.log(err);
      resolve(res);
      
    });
  });
}

  function makeConfirmationId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }





