var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uniqid = require('uniqid');
var _ = require('lodash');

var players = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function changeMap(client,data){
  client.join(data.target_map);
  client.broadcast.to(client.player.map).emit('player_leave_map',data);
  client.player.map = data.target_map;
  client.emit('map_changed',data);
  client.broadcast.to(client.player.map).emit('player_enter_map',data);
}

function move(client,data){
  client.emit('moved',data);
  data.player_id = client.id;
  client.broadcast.to(client.player.map).emit('player_move',data);
}

io.on('connection', function(client){

  client.player = {
    map: 'bg-0001',
    x: 0,
    y: 0
  };

  console.log('[event][connected]',client.player);

  client.join(client.player.map);
  client.emit('connected',client.player);

  client.on('move', function(data){
    console.log('[event][move]',data,client.player);
    move(client,data);
  });

  client.on('change_map', function(data){
    console.log('[event][change_map]',data);
    changeMap(client,data.target_map);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});