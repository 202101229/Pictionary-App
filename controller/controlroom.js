const express = require("express");
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PictionaryGame = require('../game');
const pictionaryGame = new PictionaryGame(io);
const Room = require('../schemas/roomSchema');

async function create(req ,res){
    pictionaryGame.createRoom(req ,res);
}

async function join(req,res){
    let roomNumber = req.body.roomname;
    roomNumber = roomNumber.toString();
    const room = await Room.findOne({name:roomNumber});
    if(room == null){

        res.status(400).send('<script>alert("Room with this Room Number Does not exists."); window.location = "/start";</script>');
    }
    else{
        res.render("home" , {roomNumber});
    }
}

module.exports = {create ,  join}