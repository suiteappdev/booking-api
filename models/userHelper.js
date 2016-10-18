var mongoose = require("mongoose");
var crypto = require("crypto");
var userSchema = require('./user');
var sessionSchema = require('./session');

/*
	Objeto global user
*/
var user = {
	sessionSchema : sessionSchema,
	/**
	* funcion para crear usuario
	* @method create
	* @param {Object} data - objeto usuario 
	* @param {Function} callback - funcion callback
	*/
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

	/**
	* funcion para actualizar usuario
	* @method update
	* @param {String} where - objeto usuario 
	* @param {Object} data - objeto usuario 
	* @param {Function} callback - funcion callback para manejar la respuesta
	*/
	update : function(where, data, callback){
        userSchema.update(where, data, callback);
	},

	/**
	* funcion para borrar usuario
	* @method remove
	* @param {String} id - id usuario 
	* @param {Function} callback - funcion callback para manejar la respuesta
	*/
	remove : function(id, callback){
        userSchema.findById(id, callback);
	},

	/**
	* funcion para obtener un usuario
	* @method user
	* @param {String} id - id usuario 
	* @param {Function} callback - funcion callback para manejar la respuesta
	*/
	user : function(id, callback){
        userSchema.find({_id : id }, callback);
	},

	/**
	* funcion para obtener un usuario
	* @method users
	* @param {Function} callback - funcion callback para manejar la respuesta
	*/
	users : function(callback){
        userSchema.find({}, callback);
	},

	/**
	* función para obtener un autenticar un usuario
	* @method auth
	* @param {Object} req - objeto request
	* @param {Object} res - objeto request
	* @param {Function} next - siguiente funcion
	*/
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

	/**
	* función para crear una sesion
	* @method createSession
	* @param {Object} session - objeto session
	* @param {Function} callback -  funcion callback para manejar la respuesta
	*/
	createSession : function(session, callback){
		var _session = new sessionSchema(session)
		_session.save(callback);
	},

	/**
	* función para destruir una sesion
	* @method logout
	*/
	logout : function(){
		sessionSchema.findOne({token : token} , function(err, session){
			if(session){
				session.remove();
			}
		});
	}
}

module.exports = user;