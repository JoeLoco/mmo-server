var socket = io();
var players = [];
var player = {
    id: null,
    map: null,
    x: 0,
    y: 0,
    sprite: null
};

socket.on('map_changed', function (data) {
    console.log('[event][map_changed]', data);
    player.map = data.target_map;
});

socket.on('moved', function (data) {
    console.log('[event][moved]: ', data);
});

socket.on('player_leave_map', function (data) {
    console.log('[event][player_leave_map]', data);
    _.find(players,{id: data.id});
});

socket.on('player_enter_map', function (data) {
    console.log('[event][player_enter_map]', data);
    var newPlayer = data;    
    newPlayer.sprite = game.add.sprite(newPlayer.x,newPlayer.y, 'player');    
    players.push(newPlayer);
});

socket.on('player_move', function (data) {
    console.log('[event][player_move]', data);
    var player = _.find(players,{id: data.id});
    player.x = data.x;
    player.y = data.y;
    player.sprite.x = player.x;
    player.sprite.y = player.y;    
});

socket.on('connected', function (data) {
    console.log('[event][connected]', data);
    player.id = data.player.id;
    player.map = data.player.map;
    
    data.players.forEach(function(p){
        p.sprite = game.add.sprite(p.x,p.y, 'player');    
        players.push(p); 
    });
    
});

function playerMove() {
    socket.emit('move', {
        player_id: player.id,
        x: player.x,
        y: player.y
    });
}

$('.change_map').click(function () {
    socket.emit('change_map', {
        player_id: player.id,
        current_map: player.map,
        target_map: $(this).attr('data-map')
    });
});


var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'phaser-example', {preload: preload, create: create, update: update, render: render});

function preload() {
    game.load.image('player', 'shinyball.png');
}

function create() {

    player.sprite = game.add.sprite(player.x,player.y, 'player');
    game.physics.enable(player.sprite, Phaser.Physics.ARCADE);

}

function update() {

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        player.x -= 4;
        playerMove();
    } 
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        player.x += 4;
        playerMove();
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        player.y -= 4;
        playerMove();
    }
    
    if(game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        player.y += 4;
        playerMove();
    }
    
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

function render() {

    game.debug.spriteInfo(player.sprite, 32, 32);

}


