const express = require("express");
const PictionaryGame = require('../game');
const Room = require('../schemas/roomSchema');
const gameSchema = require("../schemas/gameSchema");

async function initss(io){
    pictionaryGame = new PictionaryGame(io);
}

async function create(req ,res){
    pictionaryGame.createRoom(req ,res);
}

async function join(req,res){
    let roomNumber = req.body.roomname;
    roomNumber = roomNumber.toString();
    const room = await Room.findOne({name:roomNumber});
    const username = req.cookies.useinfo.username;
    let val;
    if(room !== null)
    val = await gameSchema.findOne({room:room._id , username:username});
    if(room == null){

        res.status(400).send('<script>alert("Room with this Room Number Does not exists."); window.location = "/start";</script>');
    }
    else if(room.turnstatus === 1 && val === null){

        res.status(400).send('<script>alert("Game is alredy started in this room you are not able to join."); window.location = "/start";</script>');

    }
    else{
        res.render("home" , {roomNumber});
    }
}

module.exports = {create ,  join , initss}