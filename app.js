const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const connectDB = require('./connection');
const app = express();
app.use(express.urlencoded({ extended: true}))

const PictionaryGame = require('./game');
const Room = require('./schemas/roomSchema');  // Make sure this import is present
const Drawing = require('./schemas/drawingSchema');
const ChatMessage = require('./schemas/chatMessageSchema');
const User = require('./schemas/userSchema');

const server = http.createServer(app);
const io = socketIO(server);

connectDB(); // Establish MongoDB connection

const pictionaryGame = new PictionaryGame(io);

app.use(express.static(path.join(__dirname, 'public')));

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname , "public" , "index.html"));
});

app.get("/start",(req,res)=>{
  res.sendFile(path.join(__dirname , "public" , "home1.html"));
});

app.post("/start",(req,res)=>{

    console.log(req.body);
    if(req.body.name === ""){
      res.redirect("/");
    }
    res.sendFile(path.join(__dirname , "public" , "home1.html"));
});

app.post("/create", (req,res)=>{
  console.log(req);

});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', (username) => {
    pictionaryGame.createRoom(socket, username);
  });

  socket.on('joinRoom', (data) => {
    pictionaryGame.joinRoom(socket, data.room, data.username);
  });

  socket.on('draw', async (data) => {
    io.to(data.room).emit('draw', data);
    await Room.updateOne({ name: data.room }, { $push: { drawings: { x: data.x, y: data.y } } });
  });

  socket.on('guess', (data) => {
    io.to(data.room).emit('guess', { user: socket.id, guess: data.guess });
  });

  socket.on('chatMessage', async (data) => {
    console.log("Hellow");
    await Room.updateOne({ name: data.room }, { $push: { chatMessages: { user: data.user, message: data.message } } });
    io.to(data.room).emit('chatMessage', { user: data.user, message: data.message });
});

  socket.on('clearCanvas', async (room) => {
    io.to(room).emit('clearCanvas');
    await Room.updateOne({ name: room }, { $set: { drawings: [] } });
  });

  socket.on('disconnect', () => {
    io.emit('chatMessage', { user: 'System', message: `Player ${socket.id} left the game.` });
    console.log('User disconnected:', socket.id);
  });
});

async function getRooms() {
  const rooms = await Room.find();
  return rooms.map((room) => room.name);
}

async function getChatHistory(room) {
  const { chatMessages } = await Room.findOne({ name: room });
  return chatMessages;
}

async function getDrawingHistory(room) {
  const { drawings } = await Room.findOne({ name: room });
  return drawings;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
