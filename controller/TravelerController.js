var routes = require('express').Router();
var db = require('../dao/Db');
var airPortDao = require('../dao/AirPortDao');
var bookingDao = require('../dao/BookingDao');

// administrator 
var admin = { "userId": 1 };


routes.get('/airports/:airport_name', function (req, res) {
  airPortDao.getAirportListByName(req.params.airport_name, function (error, result) {
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
});


// cancel booking
routes.delete('/booking/:bookingId', function (req, res) {
  console.log("cancelBooking");

  bookingDao.cancelbooking(req.params.bookingId, function (error, result) {
    if (error) {
      throw error;
      res.status(500);
      res.send("Failed to cancel the booking.");
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send(result);
    }
  })
});

module.exports = routes;