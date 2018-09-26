var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uniqid = require('uniqid');
var _ = require('lodash');

var players = [];

app.use(express.static('client'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

function changeMap(client, data) {
    client.join(data.target_map);
    client.broadcast.to(client.player.map).emit('player_leave_map', data);
    client.player.map = data.target_map;
    client.emit('map_changed', data);
    client.broadcast.to(client.player.map).emit('player_enter_map', data);
}

function move(client, data) {
    client.emit('moved', data);
    data.id = client.id;
    client.broadcast.to(client.player.map).emit('player_move', data);
}

function addPlayer(data){
    var player = _.filter(players, {id: data.id});
    if(player){
        player = data;
    }        
    players.push(data);
}

io.on('connection', function (client) {

    client.player = {
        id: client.id,
        map: 'bg-0001',
        x: 0,
        y: 0
    };

    console.log('[event][connected]', client.player);

    client.join(client.player.map);
    
    addPlayer(client.player);
    
    console.log("players: ",players.count);
    
    client.emit('connected', {
        player: client.player,
        players: _.reject(_.filter(players, {map: client.player.map}), {id: client.player.id})
    });

    client.broadcast.to(client.player.map).emit('player_enter_map', client.player);

    client.on('move', function (data) {
        console.log('[event][move]', data, client.player);
        move(client, data);
    });

    client.on('change_map', function (data) {
        console.log('[event][change_map]', data);
        changeMap(client, data.target_map);
    });

    client.on('disconnect', function () {
        client.emit('[event][disconnected]');
        _.remove(players, {id: client.player.id});
    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});