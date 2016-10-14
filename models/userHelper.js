var mongoose = require("mongoose");
var crypto = require("crypto");
var userSchema = require('./user');
var sessionSchema = require('./session');

var user = {
	sessionSchema : sessionSchema,
	create  : function(data, callback){
		if(data.password){
	    	data.password = require("../helpers/crypto-util")(data.password);
		}

		var _usuario = new userSchema(data);
	
		_usuario.save(function(err, usuario){
			if(err) return callback(err, null);
			return callback(null, usuario);			
		});

	},

	update : function(where, data, callback){
        userSchema.update(where, data, callback);
	},

	remove : function(id, callback){
        userSchema.findById(id, callback);
	},

	user : function(id, callback){
        userSchema.find({_id : id }, callback);
	},

	users : function(callback){
        userSchema.find({}, callback);
	},

	auth : function(req, res, next){
		  if (req.headers.authorization) {
		    var authInfo = req.headers.authorization.split(' ');

		    if (authInfo[0] === 'Bearer') {
	      		var token = authInfo[1];
		        sessionSchema.getToken(token, function(err, token) {
		        	if(!token){
		    			res.status(404);
		    			return res.send("user no found");
		        	}
		        	
			        next();
		      });
		    } else {
		    	res.status(401);
		    	res.send("no se han enviado las credenciales");
		    }
		  } else {
		    	res.status(400);
		    	res.send("su peticion no es correcta")
		  }
	},

	createSession : function(session, callback){
		var _session = new sessionSchema(session)
		_session.save(callback);
	},

	logout : function(){
		sessionSchema.findOne({token : token} , function(err, session){
			if(session){
				session.remove();
			}
		});
	}
}

module.exports = user;