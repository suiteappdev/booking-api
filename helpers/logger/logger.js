module.exports = {
	create : function(host, user, entity, collection){
		var path = require("path");
		var log = require(path.join(process.env.PWD, "models", "log.js"));


		var _obj = new Object();
		_obj.data = {};

		_obj._user = user;
		_obj.data.host = host;
		_obj.data.entity = entity;
		_obj.data.collection = collection;

		var _data = new log(_obj);

		_data.save(function(_err, _rs){
			if(_rs){
				console.log("[LOG]["+ _rs.updatedAt +"] From="+_rs.data.host+" Entity=" + _rs.data.entity + " Usuario="+ _rs._user +" Coleccion="+_rs.data.collection);
			}
		})
	},

	logger : function(req, res, next){

	}
}