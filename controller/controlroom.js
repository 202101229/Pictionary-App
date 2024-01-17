const express = require("express");
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PictionaryGame = require('../game');
const pictionaryGame = new PictionaryGame(io);

async function create(req ,res){
    const soket ="xyz";
    pictionaryGame.createRoom(req ,res);
}

async function join(req,res){

}

module.exports = {create ,  join}