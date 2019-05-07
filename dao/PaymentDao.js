var db = require('./Db');


exports.save = function(payment){

  return  new Promise((resolve,reject)=>{
    var query = "INSERT INTO payment (create_date, payment_status, booking_id,"
      + " create_by) VALUES (?, ?, ?,?)";
    db.query(query,[payment.create_date, payment.payment_status, payment.booking_id, payment.create_by],function(err, res){
      if(err){
        db.rollback(function(err, res){
          reject(err)
        });
      }
      payment.payment_id = res.insertId;
      resolve(payment);   
    });
  });
};

exports.setPaymentToFalse = function(date, adminId, bookingId){

  return  new Promise((resolve,reject)=>{
    var query = "update payment set payment_status = false, update_date = ?, update_by = ? "
    + "where bookingId = ?"
    db.query(query,[date, adminId, bookingId],function(err, res){
      if(err){
        db.rollback(function(err, res){
          reject(err)
        });
      }
      resolve(res);   
    });
  });
};