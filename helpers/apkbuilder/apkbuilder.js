var aws = require('aws-sdk');
var crypto = require("crypto");
var EXTENTION  = '.apk';
var BUCKET = 'shoply-apps';
var BASE_AMAZON = "http://s3-us-west-2.amazonaws.com/"+BUCKET+"/";
var BASE_LOCAL = "http://www.shoply.com.co:8080/static/apps/";
var fs = require('fs');
var path = require("path");
var uploadDir = path.join(process.env.PWD, "uploads", "apps");

aws.config.update({
    accessKeyId: "",
    secretAccessKey: ""
});

aws.config.update({region: 'us-west-2'});
var s3 = new aws.S3();
module.exports = {
	Upload : function(callback){
		fs.readFile(path.join(process.env.PWD, "apps", "shoply-app", "platforms", "android", "build", "outputs", "apk", "android-debug.apk"), function (err, _buffer) {
				crypto.pseudoRandomBytes(16, function (err, raw) {
		            if (err) return cb(err);
		            var _key = raw.toString('hex') + EXTENTION;

				    var data = {
				    	Bucket: BUCKET,
					    Key: _key, 
					    Body: _buffer
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
		});
	},

	UploadLocal : function(callback){
		fs.readFile(path.join(process.env.PWD, "apps", "shoply-app", "platforms", "android", "build", "outputs", "apk", "android-debug.apk"), function (err, _buffer) {
				crypto.pseudoRandomBytes(16, function (err, raw) {
		            if (err) return cb(err);
		            var _key = raw.toString('hex') + EXTENTION;

					require("fs").writeFile(path.join(uploadDir, _key), _buffer, function(err) {
						if(err){
							callback(err, null);
						}else{
							var URL = BASE_LOCAL  + _key;
							callback(null, {url : URL});
						}
					});
		        });	 
		});
	},

	Build : function(callback){
        var exec = require('child_process').exec;
        var child = exec('ionic resources && ionic build android', {cwd: '/home/majoca10/shoply/backend/shoply-backend/apps/shoply-app/'});
        
        child.stdout.on('data', function(data){
        	console.log("shell->", data);
        });
        
        child.on('close', callback);
	}
}