var routes = require('express').Router();
var airPortDao = require('../dao/AirportDao');
var flightDao = require('../dao/FlightDao');
var bookingDao = require('../dao/BookingDao');
var travelerDao = require('../dao/TravelerDao');


routes.get('/airports/:airport_name',function(req,res){
    airPortDao.getAirportListByName(req.params.airport_name).then(function(value){
      res.setHeader('Content-Type', 'application/json');
      res.send(value);
    }).catch(function(err){
      throw err;
    });
});

// http://localhost:4000/flights/2019-05-01/2/1
routes.get('/flights/:date/:depAirportId/:arrAirportId',function(req,res){
  flightDao.getFlightList(req.params.date, req.params.depAirportId, req.params.arrAirportId).then(function(value){
    res.setHeader('Content-Type', 'application/json');
    res.send(value);
  }).catch(function(err){
    throw err;
  });
});

// http://localhost:4000/flights
//"flights":[{"flightId":38},{"flightId":39}],
//"travelerNumber":2
routes.put('/flights', function(req, res){
  var data = req.body;
  flightDao.decreaseFlightCapacity(data).then(function(value){
    res.status(201);
    res.send('Update flights Successful!');
  }).catch(function(err){
    res.status(400);
    res.send('Update flights Failed!');
  });
});


//http://localhost:4000/booking

//{
// 	"booking":{
// 		"user":{
// 			"email":"vancea.vladimir@gmail.com",
// 			"first_name":"vladimir",
// 			"last_name":"vancea",
// 			"phone":"45464564"
// 		}
		
// 	},
// 	"payment":{},
// 	"users":[{"first_name":"firstName", "last_name":"lastName", "email":"email@gmail.com", "phone":"111-111-111"}],
// 	"flights":[{"flight_id":40}]

// }

routes.post('/booking', function(req, res){
  var bookingDetail = req.body;
  travelerDao.confirmBookingReserv(bookingDetail).then(function(value){
    res.status(201);
    res.send('post confirmBookingReserv Successful!');
  }).catch(function(reject){
    res.status(400);
    res.send('Post confirmBookingReserv Failed!');
  });
});


routes.delete('/booking/:bookingId', function (req, res) {

  bookingDao.cancelbooking(req.params.bookingId).then(function(value) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send(value);
  }).catch(function(reject){
      res.status(500);
      res.send(reject);
  })
});

module.exports = routes;