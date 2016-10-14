var aws = require('aws-sdk');
var crypto = require("crypto");
var path = require("path");
var uploadDir = path.join(process.env.PWD, "uploads", "images");
var EXTENTION  = '.jpeg';
var BUCKET = 'shoplyassets';
var BASE_AMAZON = "http://s3.amazonaws.com/"+BUCKET+"/";
var BASE_LOCAL = "http://www.shoply.com.co:8080/static/images/";

aws.config.update({
    accessKeyId: "",
    secretAccessKey: ""
});

aws.config.update({region: 'us-west-2'});

var s3 = new aws.S3();

module.exports = {
	uploadToS3 : function(data, callback){
		_buffer = new Buffer(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
		
		crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);
            var _key = raw.toString('hex') + EXTENTION;

		    var data = {
		    	Bucket: BUCKET,
			    Key: _key, 
			    Body: _buffer,
			    ContentEncoding: 'base64',
			    ContentType: 'image/jpeg'
	  		};

			s3.putObject(data, function(err, data){
				if(err){
					callback(err, null);
				}else{
					var URL = BASE_AMAZON  + _key;
					callback(null, {url : URL});
				}
			});
        });
	},

	uploadToLocal : function(data, callback){
		_buffer = new Buffer(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');

		crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);
            var _key = raw.toString('hex') + EXTENTION;

			require("fs").writeFile(path.join(uploadDir, _key), _buffer, 'base64', function(err) {
				if(err){
					callback(err, null);
				}else{
					var URL = BASE_LOCAL  + _key;
					callback(null, {url : URL});
				}
			});
        });
	}
}