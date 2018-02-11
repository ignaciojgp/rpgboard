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

  socket.on("joinRoom",function(args){
     socket.join(args);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  //map command
  socket.on('mapCommand',function(args){
      registryBook[args.mapID] = args.finalResult;
      io.sockets.in(args.mapID).emit("mapCommand",args);
      console.log("command for map "+args.mapID);
  });

  //getting last version of map
  socket.on("lastMapRequest",function(args){
      console.log("map requested");
      io.sockets.in(args.mapID).emit("lastMapRequest",args);
  });
  socket.on("lastMapResponse",function(args){
      console.log("map responded");
      io.sockets.in(args.mapID).emit("lastMapResponse",args);
  });

});//


app.post("/api/map/register",function(req,res){
    console.log(req.body);
    var id = uuidv1();
    registryBook[id] = req.body;
    res.send(id);
    // console.log(registryBook);
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
