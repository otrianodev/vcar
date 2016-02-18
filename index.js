"use strict";

const os = require ("os");
const fs = require("fs");
const express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

const indexHTML = "./index.html";
var index = fs.readFileSync(indexHTML);

const interfaceName = "Wi-Fi";

function Player (x, y) {
	this.x = x;
	this.y = y;
	this.a = 0;
}

Player.prototype.turnLeft = () => {
	this.a += -4.0;
}

Player.prototype.turnRight = () => {
	this.a += 4.0;
}

Player.prototype.accelerate = () => {
	const PI = 3.14159;
	let rotation = this.angle * 180.0/PI;
	this.x += Math.cos(rotation) * 8.0;
	this.y += Math.sin(rotation) * 8.0;
}

var players = {};

function handler (request, response) {
	response.writeHead(200);
    response.end(index);
}

fs.watch(indexHTML, function(event, filename) {
    console.log(event, filename);
    //console.log("updating " + indexHTML);
    index = fs.readFileSync(indexHTML);
});

app.get("/", handler);

io.on("connection", function (socket){
	console.log(socket.id);
	players[socket.id.replace(/\/#/, "")] = new Player(400.0, 300.0);
	console.log(players);
	
	socket.on ("accelerate", (player) => {
		console.log(player.id, "accelerates!");
		players[player.id].accelerate();
	});
	
	socket.on ("turnLeft", (player) => {
		console.log(player.id, "accelerates!");
		players[player.id].turnLeft();
	});
	
	socket.on ("turnRight", (player) => {
		console.log(player.id, "accelerates!");
		players[player.id].turnRight();
	});

});

function updateClients(players, io) {
	io.emit("updateClient", players);
}

app.use(express.static(__dirname + "/"));
server.listen(1337);

setInterval(updateClients, 16, players, io);
