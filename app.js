const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const connectDB = require('./connection');
const app = express();
app.use(express.urlencoded({ extended: true}))
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bcrypt = require("bcryptjs")
const ejs = require('ejs');
const cookie = require('cookie');
app.set('view engine', 'ejs');
const template_path = path.join(__dirname, "./templates/views")
app.set("views", template_path)

const PictionaryGame = require('./game');
const chathandling = require('./chatmessage.js');
const drawhandling = require("./drawing.js");

const Room = require('./schemas/roomSchema'); 
const Drawing = require('./schemas/drawingSchema');
const ChatMessage = require('./schemas/chatMessageSchema');
const User = require('./schemas/userSchema');

const server = http.createServer(app);
const io = socketIO(server);

connectDB();

const pictionaryGame = new PictionaryGame(io);
const chathandle = new chathandling(io);
const drawhandle = new drawhandling(io);

app.use(express.static(path.join(__dirname, 'public')));

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname , "public" , "index.html"));
});

app.get("/s", async (req,res)=>{

  const roomNumber = req.body.roomname;
  console.log(roomNumber);
  res.render("home" , {roomNumber});
})

app.get("/start",(req,res)=>{
  res.render("home1");
});

app.post("/start" ,async (req,res)=>{
    if(req.body.name === ""){
      res.redirect("/");
    }

    const HashPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({username :req.body.name  , password:HashPassword , image : "/images/avatar1.png"});

    const savedUser  = await user.save();

    res.cookie("useinfo",{username:req.body.name , id:savedUser._id},{
      secure:false,
  });

    res.render("home1");
});


const uplodroute = require("./routes/uplodroute");
const roomroute  = require("./routes/roomroute.js");

app.use("/file", uplodroute);
app.use("/room" , roomroute);

app.post("/createroom", (req,res)=>{
  console.log(req);
  const soket ="xyz";
  pictionaryGame.createRoom(socket, username);
});

app.post("/joinroom", (req,res)=>{

  pictionaryGame.joinRoom(socket, data.room, data.username);

});

io.on('connection', (socket) => {

  let userinfoCookie = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie).useinfo : null;
  userinfoCookie = JSON.parse(userinfoCookie.substring(2));
  console.log('User connected:', userinfoCookie.username);

  socket.on('createRoom', (username) => {
    pictionaryGame.createRoom(socket, username);
  });

  socket.on('joinRoom', (data) => {
    pictionaryGame.joinRoom(socket, data.room, data.username);
  });

  socket.on('drawLine', async (data) => {
    // console.log(data);
    drawhandle.drawLine(data);
  });

  socket.on('chatMessage', async (data) => {

    chathandle.message(data);
});

  socket.on('clearCanvas', async (room) => {
    io.to(room).emit('clearCanvas');
    await Room.updateOne({ name: room }, { $set: { drawings: [] } });
  });

  socket.on('disconnect', () => {

    let userinfoCookie = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie).useinfo : null;
    userinfoCookie = JSON.parse(userinfoCookie.substring(2));

    io.emit('chatMessage', { user: 'System' ,id:'1', message: `Player ${userinfoCookie.username} left the game.` });
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
