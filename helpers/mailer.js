module.exports = {
	render : function(bind, file){
		var path = require('path');
		var ejs = require("ejs");
		var fs = require("fs");

		var template = fs.readFileSync(path.join(process.env.PWD, 'templates', file), 'utf-8');

	    return ejs.render(template, bind);
	}
}