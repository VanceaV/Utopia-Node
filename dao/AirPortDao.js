var db = require('./Db');
var mysql = require('mysql');

exports.getAirportListByName = function(airport_name){



    return new Promise ((resolve,reject)=>{

        var query = "SELECT * FROM city inner join airport using(city_id) WHERE city_name = ? or country= ? or airport_code= ?";
        
        db.query(query, [airport_name,airport_name,airport_name],function(err, result){
            if(err){
                reject(err)
            }else{
                resolve(result) 
            }
         });
    }); 
}