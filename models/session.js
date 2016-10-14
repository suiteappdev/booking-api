var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

//puedes usar _Schema como standard, al final solo seteas el nombre del modelo session

var _Schema = new mongoose.Schema({
	token : String,
	expire : {type : Date, default : Date.now},
	closed_date : {type : Date}
});

_Schema.methods.hasExpired = function(){
	var _now = new Date();
	return Math.round((Date.now() - expire ) / 1000) > 43200 // segundos;
}

_Schema.statics.getToken = function(token, callback){
	return this.model('session').findOne({ token : token }, callback);
}

_Schema.statics.removeToken = function(token, callback){
	return this.model('session').findOne({ token : token}, callback);
}

_Schema.methods.close = function(){
    this.closed_date = Date.now();
    this.save();
}

_Schema.statics.refresh = function(token, callback){
	return this.model('session').update({ token : token }, {expire : Date.now}, callback)
}

_Schema.plugin(timestamps);

module.exports =  mongoose.model('session', _Schema); 