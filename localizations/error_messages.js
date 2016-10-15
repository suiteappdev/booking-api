//DEFINE BELOW ALL ERROR MESSAGES THAT WILL BE USED THROUGHT ENTIRE APP
var config = require("../config.js");

module.exports = {
	
	"REQUIRED_FIELDS_NO_RECEIVED" : "Required fields no received. Checkout the documentation at " + config.wikiURL,
	"USER_NOT_RECEIVED" : "FIELD NOT SENT: username",
	"PASSWORD_NOT_RECEIVED" : "FIELD NOT SENT: password",
	"BAD_LOGIN" : "Authentication failed",
	"INVALID_TOKEN" : "Invalid Token",
	"USER_NOT_FOUND" : "User not found",
	"OLD_PASSWORD_NOT_MATCH" : "Old password not match",
	"NOT_TOKEN_PROVIDED" : "Not token provided"

}