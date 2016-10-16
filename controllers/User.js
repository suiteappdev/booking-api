module.exports = function(app, apiRoutes){
   
    var mongoose = require('mongoose');
    var userHelper = require('../models/userHelper');
    var path = require("path");
    var User = require('../models/user');
    var auth = require(path.join(process.env.PWD , "helpers", "authenticate", "authenticate.js"));
    var crypto = require("crypto");
    var jwt = require('jsonwebtoken');
    var Session = require(path.join(process.env.PWD, "models", "session.js"));
    var apiResponder = require("../helpers/api-responder.js");


    function register(req, res){
        var data = req.body;
        var _plainPwd = req.body.password;

        if(!data.username || !data.password){
          return res.status(500).json( apiResponder.error("REQUIRED_FIELDS_NO_RECEIVED") ) ;
        }

        userHelper.create(data, function(err, user){
          
          if(err){
              console.log("erro", err);
              res.status(409).json( apiResponder.error(err) );
              return;
          }

          user.password = null;
          res.status(200).json( user );
        });
    }

    function update(req, res){
       var data = {};
       var REQ = req.body || req.params;

       !REQ.metadata || (data.metadata = REQ.metadata);
       !REQ.username || (data.username = REQ.username);
       !REQ.first_name || (data.first_name = REQ.first_name);
       !REQ.last_name || (data.last_name = REQ.last_name);
       
       data = { $set : data }; 

       userHelper.update({ _id : mongoose.Types.ObjectId(req.params.user_id) }, data, function(err, rs){
          if(rs){
                res.status(200).json( apiResponder.success() );
          }
       });   
    }

/*
    function remove(req, res){
        userHelper.remove(req.params.id, function(err, user){
            if(!err){
                user.remove();
                res.status(200)
                res.end();
            }
        })
    }

 
    function users(req, res){
        User.find({})
        .exec(function(err, users){
            if(!err){
                res.send(users);
            }
        });
    }

    function user(req, res){
        User
        .findOne( mongoose.Types.ObjectId(req.params.id))
        .exec(function(err, rs){
            if(rs)
                res.json(rs);
            else
                res.json(err);
        })

    }
    */

    function authenticate(req, res){
            if (!req.body.username) {
                res.status(400).send( apiResponder.error( "USER_NOT_RECEIVED" ) );
                return;
            }

            if (!req.body.password) {
                res.status(400).send( apiResponder.error( "PASSWORD_NOT_RECEIVED" ) );
                return;
            }

          var jwt = require('jsonwebtoken');
          var UserSchema = require('../models/user');

         UserSchema.findOne({username : req.body.username}).exec(function(err, user){
          
            if(!user){
                    res.status(401).json( apiResponder.error( "BAD_LOGIN" ) );
                    return;
             }

            if(user.auth(req.body.password)){
                  user.password = null;
                      var _user = {};
                      
                      _user.username = user.username;
                      _user.last_name = user.last_name;
                      _user.time = new Date().getTime();

                  var token = jwt.sign(_user, app.get('secret'), {
                      expiresIn: 43200 // 24 horas (suficientes para una jornada laboral)
                    });

                  userHelper.createSession({token : token  , _user_id : mongoose.Types.ObjectId(user._id) }, function(err, userToken){
                        res.status(200).json( apiResponder.success( {token:token, user : user} )  );
                  }); 

            }else{
                  res.status(401).json( apiResponder.error( "BAD_LOGIN" ) );
            }
        });
    }


    function changePassword(req, res){
        var data = {};
        var REQ = req.body || req.params;

        if(!REQ.old_password || !REQ.new_password){
          return res.status(500).json( apiResponder.error("REQUIRED_FIELDS_NO_RECEIVED") );
        }

        User.findOne({ _id : mongoose.Types.ObjectId(req.params.user_id) }, function(err, rs){
              if(rs){
                    if(rs.password ==  require(process.env.PWD + "/helpers/crypto-util")(REQ.old_password)){
                        rs.password = require(process.env.PWD + "/helpers/crypto-util")(REQ.new_password);
                        rs.save(function(err, rs){
                            if(rs){
                                res.status(200).json(apiResponder.success());
                            }
                        })
                    }else{
                      res.status(400).json( apiResponder.error( "OLD_PASSWORD_NOT_MATCH" ) )
                    }
              }else{
                  res.status(404).json( apiResponder.error( "USER_NOT_FOUND" ) )
              }
        });                      
    }

    /*

    function recover(req, res){
        var REQ = req.body || req.params;
        User.findOne({ username : REQ.username}, function(err, rs){
            if(rs){
                  crypto.pseudoRandomBytes(30, function (err, raw) {
                        rs.resetPasswordToken = raw.toString('hex');
                        rs.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                        
                        rs.save(function(err, rs){
                              if(rs){
                                  res.status(200).json({message : "ok"});
                              }
                        })
                      }) 
                  }else{
                      res.status(404).json({message : "user not found"})
                  }                    
        }); 
    }
*/

  function validateToken(req, res){
        var REQ = req.body || req.params; 
        
        var token = req.params.token;
        var user_id = req.params.user_id;

        if (token) {
            jwt.verify(token, app.get("secret"), function(err, decoded) {
                if (err){
                        return res.status(401).json( apiResponder.error("INVALID_TOKEN") ); 
                }

                Session.find({token : token, _user_id:mongoose.Types.ObjectId(req.params.user_id)}, function(err, rs){
                    if(!err){ 
                            if(rs.length > 0){ 
                              req.decoded = decoded;    
                              res.status(200).json( apiResponder.success() );
                           }
                           else{
                                res.status(401).json( apiResponder.error( "INVALID_TOKEN" ) );
                           }
                    }
                })  
          });
        }else{
          return res.status(403).send(apiResponder.error("NOT_TOKEN_PROVIDED"));
        }
  }

/*
  function reset(req, res){
      var REQ = req.body || req.params;
      
      User.findOne({ resetPasswordToken: REQ.link, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            res.status(404).json({message: 'no user found or reset link has been expired'});
        }else{
          user.password = require(process.env.PWD + "/helpers/crypto-util")(REQ.newpwd);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err, rs){
              if(rs){
                  res.status(200).json({message : "ok"});
              }
          })
        }
      });      
  }

  */

  function logout(req, res){
      var REQ = req.body || req.params;
      auth.destroySession(req.params.token, req.params.user_id, function(err, rs){
        if(!err){
              res.status(200).json({message:true});
        }
      });
  }

  app.post("/register", register);
  app.post('/change-password/:user_id', auth.tokenValidator , changePassword);
  app.post("/authenticate", authenticate);
  app.get("/logout/:user_id/:token", auth.tokenValidator, logout);
  app.post("/validate-token/:user_id/:token", validateToken);
  app.post("/update-user/:user_id", auth.tokenValidator, update);
  
  return this;

}