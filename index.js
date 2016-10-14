var express = require("express");
var app = express();
var http = require('http').Server(app);
var config = require("./config");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
var cors = require('cors');
var jwt = require('jsonwebtoken');
var morgan = require('morgan');
var cluster = require('cluster');
var cores = require('os').cpus().length;  //numero de cpus

app.use(cors());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.set("secret", config.secret);
process.env.PWD = process.cwd() || process.env.PWD;

apiRoutes = express.Router();

apiRoutes.use(function(req, res, next) {
  next();
});

app.get('/home', function(req, res){
    res.send("Home");
});

apiRoutes.use(function(req, res, next) {
    next();
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({message:"error"});
    console.log(err);
});

apiRoutes.use(function (err, req, res, next) {
    res.status(err.status || 500).json({message:"error"});
    console.log(err);
});

var io = require("socket.io")(http);
var turns = io;

io.on('connection', function(socket){

});

mongoose.connection.on('open', function(ref){
    console.log('Conectado a Mongo');
    require("./controllers/all")(app, apiRoutes, io); 
    app.use("/api", apiRoutes);

    http.listen(config.appPort, function(){
        console.log("app listen on " + config.appPort);
    }); 
});

mongoose.connection.on('error', function(err){
    console.log('no se pudo realizar la conexión con mongo');
    console.log(err);
    return console.log(err.message);
});

try{
  mongoose.connect( config.dburl );
  console.log('Iniciando conexión en: ' + config.dburl + ', esperando...');
}catch(err){
  console.log('Conexión fallida a: ' + config.dburl);
}