const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const connectDB = require('./connection');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
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
const { initss } = require('./controller/controlroom.js');

initss(io);

connectDB();

const pictionaryGame = new PictionaryGame(io);
const chathandle = new chathandling(io);
const drawhandle = new drawhandling(io);

app.use(express.static(path.join(__dirname, 'public')));


const uplodroute = require("./routes/uplodroute");
const roomroute = require("./routes/roomroute.js");
const { isloged, alredyloged, isregistred } = require('./middlewares/auth.js');
const gameSchema = require('./schemas/gameSchema.js');
const upload = require('./middlewares/upload.js');

app.use("/file", uplodroute);
app.use("/room", roomroute);

app.get("/", alredyloged, (req, res) => {
  res.redirect("/login");
});

app.get("/register", alredyloged, (req, res) => {
  let data = 0;
  res.render("index", { data });

});

app.get("/login", (req, res) => {
  let data = 1;
  res.render("index", { data });
})

app.get("/s", async (req, res) => {

  const roomNumber = req.body.roomname;
  res.render("home", { roomNumber });
})

app.get("/start", isloged, (req, res) => {
  res.render("home1");
});

app.post("/checkuniq" ,async (req,res)=>{
  let x = await User.findOne({username:req.body.username});
  let sign;
  if(x !== null) sign = 0;
  else           sign = 1;
  res.json({sign : sign});
});

app.post("/start",upload.single('file'), async (req, res) => {
          if (req.body.name === ""){
            res.redirect("/");
          }

          var img = 'avatar1.png';

        if (req.fileValidationError) {
            res.status(400).send(req.fileValidationError);
        } else if (!req.file) {

          img = `avatar${req.body.avatar}.png`;

        }else{
          img = `${req.file.filename}`;
          // console.log(img);

        }

  const HashPassword = await bcrypt.hash(req.body.password, 10);

  const user = new User({ username: req.body.name, password: HashPassword,img: img});

  const savedUser = await user.save();

  res.cookie("useinfo", { username: req.body.name, id: savedUser._id }, {
    secure: false,
  });

  res.render("home1");
});

app.post("/directstart", isregistred, async (req, res) => {

            const check = await User.findOne({username:req.body.name})
            const match = await bcrypt.compare(req.body.password,check.password);

            if(match){

              res.cookie("useinfo", { username: req.body.name, id:check._id }, {
                secure: false,
              });
            
              res.render("home1");

            }else{

              res.status(400).send('<script>alert("Incorrect Password."); window.location = "/login";</script>');

            }

});

app.post("/createroom", (req, res) => {
  console.log(req);
  const soket = "xyz";
  pictionaryGame.createRoom(socket, username);
});

app.post("/joinroom", (req, res) => {

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
    pictionaryGame.joinRoom(socket, data.room, data.username , data.id , data.prevroom);
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

  socket.on('startgame'  , (data) =>{

    pictionaryGame.startgame(socket,data ,io);

  });

  socket.on("removeplayer", (data)=>{
    pictionaryGame.removeplayer(socket , data);
  });

  socket.on('disconnect', async () => {


    try{

    let userinfoCookie = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie).useinfo : null;
    userinfoCookie = JSON.parse(userinfoCookie.substring(2));

    await gameSchema.updateOne({socketid:socket.id} , {present : 0});

    const user = await gameSchema.findOne({socketid:socket.id});
    const room = await Room.findOne({_id:user.room});
    let tot = await gameSchema.find({room:room._id});
    let notpre = await gameSchema.find({room:room._id , present :0});
    if(notpre.length === tot.length){

      await gameSchema.deleteMany({room:room._id});

      await Room.deleteOne({_id:room._id});

      io.emit('updateRooms',await getRooms());
    }

    io.to(room.name).emit('chatMessage', { user: 'System', id: '1', message: `Player ${userinfoCookie.username} left the game.` });
    io.to(room.name).emit('Updateusers' , await pictionaryGame.getgameplayers(room._id));
    console.log('User disconnected:', socket.id);
    }
    catch(err){
      console.log(err);
    }
  });
});

async function getRooms() {
  const rooms = await Room.find({turnstatus:0});
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
