var crypto = require('crypto');
var base_path = process.env.PWD;
var config = require(base_path + '/config.js');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var _Schema = new Schema({
	  username : { type : String, trim : true, lowercase : true, unique : true},
	  password : {type: String, required : false},
	  first_name : { type : String, trim : true,  lowercase : true},
	  last_name : { type : String, trim : true, lowercase : true},
	  full_name : { type : String, trim : true, lowercase : true},
	  resetPasswordToken: String,
  	  resetPasswordExpires: Date
});

_Schema.pre('save', function (next) {
    this.full_name = (this.name || '') + ' ' + (this.last_name  || '');
    next();
});

_Schema.methods.auth = function(password, callback){
    var res = true;
	if(require('../helpers/crypto-util')(password) !== this.password){
	     res = false;
	}
	
    if(callback)
     	callback(res);
    else
        return res;
}

_Schema.statics.exists = function(email, callback){
	this.find({ email : email}, function(err, rs){
        callback(err, rs.length);
	})
}

_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model('User', _Schema);


