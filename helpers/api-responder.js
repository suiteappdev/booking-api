
function responder(){

    var error_msgs = require("../localizations/error_messages.js");


	this.success = function(data){

		if(data)
			var r = data;
		else
			var r = { success :  true }; 

		return r;


	}

	this.error  = function(err){

		console.log(typeof err === "string")

		var r = { success : false };

		if(typeof err === "string")
			r.error = error_msgs[err] || "Unknow error";
		else
			r.error = err;

		return r;        

   }

   return this;

 }


module.exports = responder();