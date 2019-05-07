var routes = require('express').Router();
var db = require('./Db');

var active = 0;
var adminId = 1;
var date = new Date();



exports.save = function(user){
  return  new Promise((resolve,reject)=>{
      db.query("insert into user (active,create_date,email,first_name,last_name,phone,create_by) values(?,?,?,?,?,?,?)",[active,date,user.email,user.first_name,user.last_name,user.phone,adminId],function(err, res){
          
        if(err){
          db.rollback(function(err){
            reject(err)
          });
        } 
        user.user_id = res.insertId;
        resolve(user);
      });
  });
};
  


