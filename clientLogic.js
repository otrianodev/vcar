var cars = {};
var socket = null;

var style = { font: "16px Arial", fill: "0xFFFFFF", align: "center"};

var box = $("#box");
box.hide();

var createPlayer = $("#createPlayer");
var sendToGame = $("#sendToGame");
var playerName = $("#playerName");
var playerColor = $("#playerColor");

sendToGame.click( function () {
	//connectToServer...
	createPlayer.hide();
	box.show();
	
	var color = playerColor.val();
	var name = playerName.val();
	
	console.log(color, name);
	
	socket = io.connect();
	socket.on("connect", function () {
		console.log("Client connected");
		socket.emit("newPlayer", {color: color, name: name});
		$(window).bind ("beforeunload", function () {
			socket.emit("kill", {id: socket.id});
		});
	});
	
	socket.on('updateClient', function (players) {
		var playerKeys = Object.keys(players);
		var playerKeysLength = playerKeys.length;
		
		var carKeys = Object.keys(cars);
		var carKeysLength = carKeys.length;

		//destroy client sprites that don't exist on server
		if (playerKeysLength < carKeysLength){
			console.log("destroy %d sprite", carKeysLength - playerKeysLength);
			for (var i = 0; i < carKeysLength; i++){
				var key = carKeys[i];
				if (typeof players[key] === 'undefined'){
					cars[key].destroy();
					delete cars[key];
				}
			}
		}
		
		//create and update cars
		for (var i = 0; i < playerKeysLength; i++){
			var key = playerKeys[i];
			if (typeof cars[key] === "undefined"){
				createCar(key, players[key].t, players[key].n);
			}
			var player = players[key];
			var car = cars[key];
			car.angle = player.a;
			car.position.x = player.x;
			car.position.y = player.y;
		}
	});
	
});

function preload() {
	game.load.image("background", "background.png");
	game.load.image("car", "coche.png");
	game.load.image("cat1", "cat1.png");
	game.load.image("cat2", "cat2.png");
	game.load.image("cat3", "cat3.png");
}

function createCar (id, tint, text) {
	cars[id] = game.add.sprite(400, 300, "car");
	cars[id].pivot = new Phaser.Point(16.0, 16.0);
	cars[id].tint = isNaN(tint) ? 0xFFFFFF : tint ;
	cars[id].addChild(game.make.text(0,-32, text, style));
}

function create () {
	cursors = game.input.keyboard.createCursorKeys();
	game.add.image(0,0, "background");
	
	var cat1 = game.make.sprite(0,0,"cat1");
	var cat2 = game.make.sprite(0,0,"cat2");
	var cat3 = game.make.sprite(0,0,"cat3");
	var sheet = game.add.bitmapData(320*3, 240);
	sheet.draw(cat1, 0, 0);
	sheet.draw(cat2, 320, 0);
	sheet.draw(cat3, 320*2, 0);
	
	//game.add.image(0, 0, sheet);
	game.cache.addSpriteSheet("aliveCat", "", sheet.canvas, 320, 240, 3, 0, 0);
	
	var cat = game.add.sprite(0, 0, "aliveCat");
	cat.animations.add("alive");
	cat.play("alive", 12, true);
	cat.scale.set(0.5, 0.5);
	cat.position.set(160, 160);
}

function update () {
	if (cursors.up.isDown){
		console.log("accelerate!");
		socket.emit("accelerate", {id: socket.id});
	}
	if (cursors.left.isDown){
		console.log("turn left");
		socket.emit("turnLeft", {id: socket.id});
	}
	else if (cursors.right.isDown){
		console.log("turn right");
		socket.emit("turnRight", {id: socket.id});
	}
}

var state = {preload: preload, create: create, update: update};

var game = new Phaser.Game(800, 600, Phaser.AUTO, "box", state, false, false);
