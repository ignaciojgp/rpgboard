var express = require("express");
var bodyParser = require('body-parser')
const uuidv1 = require('uuid/v1');

var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);



app.use("/",express.static("webapp"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

//app.listen(8888);
var registryBook= {};

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('newMap',function(args){

  });
});//


app.post("/api/map/register",function(req,res){
    console.log(req.body);
    var id = uuidv1();
    registryBook[id] = req.body;
    res.send(id);
    console.log(registryBook);
});

app.get("/api/map",function(req,res){
    //console.log(registryBook);
    console.log(req.query.mapID);
    var id = req.query.mapID
    res.send(registryBook[id]);
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});
