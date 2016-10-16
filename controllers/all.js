module.exports = exports = function(app, apiRoutes, io){
	var path = require("path");
	var config = require(path.join(process.env.PWD , "config.js"));
	
	var fs = require('fs');
	var files = fs.readdirSync('./controllers');

	console.log(files)

		for (x in files)
		 if(!files[x].match('gitignore|base|config|zip|json|all|Socket|save') && files[x].match('.js'))				 
   		      require('./' + files[x])(app, apiRoutes, io);

}