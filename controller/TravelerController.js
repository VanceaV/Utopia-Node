var routes = require('express').Router();
var airPortDao = require('../dao/AirportDao');
var flightDao = require('../dao/FlightDao');
var bookingDao = require('../dao/BookingDao');
var admin = { "userId": 1 };

// get airport list
routes.get('/airports/:airport_name', function (req, res) {
  airPortDao.getAirportListByName(req.params.airport_name, function (error, result) {
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
});

// get flight list
routes.get('/flights/:date/:depAirportId/:arrAirportId', function (req, res) {
  flightDao.getFlightList(req.params.date, req.params.depAirportId, req.params.arrAirportId, function (error, result) {
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
});

// dercrease flight capacity
routes.put('/flights', function (req, res) {
  var data = req.body;
  flightDao.decreaseFlightCapacity(data, function (err, result) {
    if (err) {
      res.status(400);
      res.send('Update flights Failed!');
    } else {
      res.status(201);
      res.send('Decrease flight capacity Successful!');
    }
  });

});


// create booking
routes.post('/booking', function (req, res) {
  var data = req.body;
  bookingDao.createbooking(data, function (err, result) {
    if (err) {
      res.status(500);
      res.send('Failed to create booking');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send(result); // booking
    }
  });

});

// change booking

// read booking
routes.get('/booking/:confirmationNum', function (req, res) {
  var confirmationNum = req.params.confirmationNum;
  if (req.params.confirmationNum) {
    bookingDao.readBooking(req.params.confirmationNum)
      .then(result => {
        console.log(result);
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(result); // booking
      }).catch(err => {
        console.log(err);
      });
  } else {
    return { statusCode: 400, message: "Bad Request" };
  }

  // bookingDao.readBooking(confirmationNum, function (error, result) {
  //   if (error) {
  //     throw error;
  //     res.status(500);
  //     res.send("Failed to read booking by confirmation number.");
  //   } else if (result == null) {
  //     res.status(404);
  //     res.send("No record for confirmation number: " + confirmationNum);
  //   } else {
  //     res.setHeader('Content-Type', 'application/json');
  //     res.status(200);
  //     res.send(result);
  //   }
  // })
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
