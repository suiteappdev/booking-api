var jwt = require('jsonwebtoken');
var path = require("path");
var config = require(path.join(process.env.PWD, "config.js"));
var Session = require(path.join(process.env.PWD, "models", "session.js"));
var mongoose = require("mongoose");

module.exports = {
    tokenValidator : function(req, res, next){
        var REQ = req.body || req.params;
        var token = REQ.token || req.params.token;
        var user_id = req.params.user_id;

        if (token) {
            jwt.verify(token, config.secret, function(err, decoded) {
                if (err){
                    return res.status(401).json({ success: false, message: 'Failed to authenticate token.' }); 
                }

                Session.find({token : token, _user_id: mongoose.Types.ObjectId(user_id)}, function(err, rs){
                    if(!err){ 
                            if(rs.length > 0){ 
                              console.log(rs);
                              req.decoded = decoded;    
                              next();
                           }
                           else{
                                res.status(401).json({ success : false, message : 'invalid token'});
                           }
                    }
                })  
          });
        }else{
          return res.status(403).send({ 
              success: false, 
              message: 'No token provided.' 
          });
        } 
    },

    destroySession : function(token, user_id,  callback){
        Session.findOne({token : token, _user_id:mongoose.Types.ObjectId(user_id)}).remove().exec(function(err, data){
          if(!err){
            return callback(null, data);
          }

          callback(err, null)
        });  
    }
}