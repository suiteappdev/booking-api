module.exports = {
	bulk : function(data){
		var shell = require('child_process');
		var path = require('path');

 		var param = JSON.stringify(data)
 		
		var Script = shell.spawn('php',[
			path.join(
				process.env.PWD,
				'helpers',
				'BatmanMailer',
				'assets',
				'index.php'
				), param
		]);

		return Script;
	}
}