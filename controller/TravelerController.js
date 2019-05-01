var routes = require('express').Router();
var db = require('../dao/Db');
var airPortDao = require('../dao/AirPortDao');


routes.get('/airports/:airport_name',function(req,res){
    airPortDao.getAirportListByName(req.params.airport_name,function(error, result){
      if(error) throw error;
      res.setHeader('Content-Type', 'application/json');
      res.send(result);
    });
});

module.exports = routes;