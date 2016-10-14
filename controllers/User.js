module.exports = function(app, apiRoutes){
    var mongoose = require('mongoose');
    var userHelper = require('../models/userHelper');
    var path = require("path");
    var User = require('../models/user');
    var _batmanMailer = require(path.join(process.env.PWD , "helpers", "BatmanMailer", "index.js"));
    var _compiler = require(path.join(process.env.PWD , "helpers", "mailer.js"));
    var crypto = require("crypto");

    function register(req, res){
        var data = req.body;
        var _plainPwd = req.body.password;

        userHelper.create(data, function(err, user){
          if(err){
              console.log("erro", err);
              res.status(409).json({err : err});
              return;
          }

          user.password = null;
          res.status(200).json(user)
        });
    }

    function update(req, res){
       var data = {};
       var REQ = req.body || req.params;

       !REQ.metadata || (data.metadata = REQ.metadata);
       !REQ.username || (data.username = REQ.username);
       !REQ.email || (data.email = REQ.email);
       !REQ.first_name || (data.first_name = REQ.first_name);
       !REQ.last_name || (data.last_name = REQ.last_name);
       
       data = { $set : data }; 

       userHelper.update({ _id : mongoose.Types.ObjectId(req.params.user_id) }, data, function(err, rs){
          if(rs){
            res.json(rs);
          }
       });   
    }

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

    function authenticate(req, res){
            if (!req.body.username) {
                res.status(400).send({err : 'debe especificar un usuario'});
                return;
            }

            if (!req.body.password) {
                res.status(400).send({err : 'debe especificar un password'});
                return;
            }

          var jwt = require('jsonwebtoken');
          var UserSchema = require('../models/user');

         UserSchema.findOne({username : req.body.username}).exec(function(err, user){
            if(!user){
                    res.status(401).json({err : 'Usuario o clave incorrectos'});
                    return;
             }

            if(user.auth(req.body.password)){
                  user.password = null;

                  var token = jwt.sign(user, app.get('secret'), {
                      expiresIn: 43200 // 24 horas (suficientes para una jornada laboral)
                    });

                  userHelper.createSession({token : token, user : user }, function(err, userToken){
                        res.status(200).json({token:token, user : user});
                  });  
            }else{
                  res.status(401).json({err: 'Usuario o clave incorrectos'});
            }
        });
    }

    function changePassword(req, res){
         var data = {};
         var REQ = req.body || req.params;

          User.findOne({ _id : mongoose.Types.ObjectId(req.params.user_id) }, function(err, rs){
              if(rs){
                    if(rs.password ==  require(process.env.PWD + "/helpers/crypto-util")(REQ.oldpwd)){
                        rs.password = require(process.env.PWD + "/helpers/crypto-util")(REQ.newpwd);
                        rs.save(function(err, rs){
                            if(rs){
                                res.status(200).json({message : "ok"});
                            }
                        })
                    }else{
                      res.status(400).json({message : "old password not match"})
                    }
              }else{
                  res.status(404).json({message : "user not found"})
              }
          });            
    }

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

  function validateToken(req, res){
    var REQ = req.body || req.params;
    var token = req.param.token;
    var user_id = req.params.user_id;

    if (token) {
        jwt.verify(token, app.get("secret"), function(err, decoded) {
            var Session = require("./models/session");

            if (err){
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' }); 
            }

            Session.find({token : token}, function(err, rs){
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
  }

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

  apiRoutes.get('/api/user', users);
  apiRoutes.get('/api/user/:id', user);
  apiRoutes.delete("/api/user/:id", remove);

  app.post("/register", register);
  app.post('/change-password/:user_id', changePassword);
  app.post("/authenticate", authenticate);
  app.post("/validate-token/:user_id/:token", validateToken);
  app.put("/update-user/:user_id", update);
  
  return this;
}