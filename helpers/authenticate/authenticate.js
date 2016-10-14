module.exports = {
	authenticate : function(req, res, next){
		var path = require("path");
		var Session = require(path.join(process.env.PWD, "models", "session.js"));
        var token = req.body.token || req.query.token || req.headers['x-shoply-auth'];
		var jwt = require('jsonwebtoken');

        if(token){
            jwt.verify(token, app.get("secret"), function(err, decoded) {      
            var Session = require("./models/session");
             
            if (err){
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' }); 
            }
            
            Session.find({token : token}, function(err, rs){
                if(!err){ 
                    if(rs.length > 0){ 
                        req.decoded = decoded;    
                        next();
                    }else{
                        res.status(401).json({ success : false, message : 'invalid token'});
                    }
                }
            }) 
          });
        }else{
            return res.status(403).send({ 
                success: false, 
                message: 'No token provided.' 
            });
        }
	}
}