const express = require("express");
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PictionaryGame = require('../game');
const pictionaryGame = new PictionaryGame(io);

async function create(req ,res){
    pictionaryGame.createRoom(req ,res);
}

async function join(req,res){
    const roomNumber = req.body.roomname;
    console.log(roomNumber);
    res.render("home" , {roomNumber});
}

module.exports = {create ,  join}