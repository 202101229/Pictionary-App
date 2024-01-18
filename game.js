// game.js

const Room = require('./schemas/roomSchema');
const User = require('./schemas/userSchema');
const Game = require('./schemas/gameSchema');

class PictionaryGame {
  constructor(io) {
    this.io = io;
  }

  async createRoom(req, res) {
    try {
      const userinfo = req.cookies.useinfo;
      const room = new Room({ name: `${req.body.roomname}-${userinfo.username}-${userinfo.id}`, turn:userinfo.id});
      const saved = await room.save();
      // socket.join(room.name);
      const roomNumber = saved.name;
  
       res.render("home" , {roomNumber});
       
      this.io.emit('updateRooms', await this.getRooms());
    } catch (error) {
      console.error('Error creating room:', error.message);
    }

  }

  async joinRoom(socket, roomName , username) {

    var roomtojoin = roomName.toString();

    socket.join(roomtojoin);

    const room = await Room.findOne({ name: roomtojoin});

    this.io.to(roomName).emit('updateRooms', await this.getRooms());
    this.io.to(roomName).emit('chatHistory', await this.getChatHistory(roomName));
    // this.io.to(roomName).emit('drawingHistory', await this.getDrawingHistory(roomName));
    // this.io.to(roomName).emit('turnChange', { turn: room.turn });
    // this.io.to(roomName).emit('chatMessage', { user: 'System', message: `Player ${socket.id} joined the room.` });
  }

  async getRooms() {
    const rooms = await Room.find();
    return rooms.map((room) => room.name);
  }

  async getChatHistory(roomName) {
    const { chatMessages } = await Room.findOne({ name: roomName });
    return chatMessages;
  }

  async getDrawingHistory(roomName) {
    const { drawings } = await Room.findOne({ name: roomName });
    return drawings;
  }
}

module.exports = PictionaryGame;
