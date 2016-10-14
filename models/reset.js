var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var base_path = process.env.PWD;

var entity = "reset";

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var _Schema = new Schema({
	_user : { type : Schema.Types.ObjectId , ref : 'User'},
 	resetPasswordToken: String,
  	resetPasswordExpires: Date
});

_Schema.pre('save', function (next) {
  next();
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 

