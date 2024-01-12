const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(cors());
const server = http.createServer(app);
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post("/createroom",(req,res)=>{
    console.log("hellow");
});

app.post("/joinroom" , (req,res)=>{
    res.sendFile(path.join(__dirname , "public/chats.html"))
});

const io = socketIO(server, {
    cors: {
        origin: "http://127.0.0.1:5500",  // Replace with the actual origin of your client
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('message', (message) => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
