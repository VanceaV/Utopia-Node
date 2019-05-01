var routes = require('express').Router();
var airPortDao = require('../dao/AirportDao');
var flightDao = require('../dao/FlightDao');
var bookingDao = require('../dao/BookingDao');
var admin = { "userId": 1 };


routes.get('/airports/:airport_name',function(req,res){
    airPortDao.getAirportListByName(req.params.airport_name,function(error, result){
      if(error) throw error;
      res.setHeader('Content-Type', 'application/json');
      res.send(result);
    });
});


routes.get('/flights/:date/:depAirportId/:arrAirportId',function(req,res){
  flightDao.getFlightList(req.params.date, req.params.depAirportId, req.params.arrAirportId, function(error, result){
    if(error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
});


routes.put('/flights', function(req, res){
  var data = req.body;
  flightDao.decreaseFlightCapacity(data, function(err, result){
    if(err){
      res.status(400);
      res.send('Update flights Failed!');
    }else{
      res.status(201);
    res.send('Update Author Successful!');
    }
  });

});


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