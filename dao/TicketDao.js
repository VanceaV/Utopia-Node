var routes = require('express').Router();
var db = require('./Db');
var date = new Date();
const adminId = 1;


exports.save = function (ticket) {

    return  new Promise ((resolve,reject)=>{

        var query = "INSERT INTO ticket (create_date, booking_id, create_by, flight_id, user_id) VALUES (?, ?, ?, ?,?)";
        
            db.query(query, [date, ticket.booking_id, adminId, ticket.flight.flight_id, ticket.user.user_id],function (err, res, fields) {
                if(err) {
                    db.rollback(function(){
                    reject(err);
                    })
                }   
                ticket.ticket_id  = res.insertId;
                resolve(ticket);
            });
        
    });
}
     
 