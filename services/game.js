// game.js

const Room = require('../schemas/roomSchema');
const User = require('../schemas/userSchema');
const Game = require('../schemas/gameSchema');
const cookie = require("cookie");
const gameSchema = require('../schemas/gameSchema');
const {generateSlug} = require("random-word-slugs");

class PictionaryGame {
  constructor(io) {
    this.io = io;
  }

  async startgame(socket , data, io){


    const host = await gameSchema.findOne();
    const room = await Room.findOne({ name:data.room});

    if(room.turnstatus === 1){

      return 0;

    }

    if(host.username !== data.username){

      this.io.to(socket.id).emit('makealert', {message:"Only host will able to start the game."});

      return 0;

    }

    let count = 65;

    let ap = await Room.updateOne({_id:room._id},{$set:{turnstatus:1}});
    if(ap){
      this.io.emit('updateRooms', await this.getRooms());
    }
    let users = await gameSchema.find({room:room._id});


    const options = {
      format: "camel",
      partsOfSpeech: ["noun"],
      categories: {
        noun: ["animals", "food", "people", "sports"],
      },
    };

    let i  = 0, n = users.length;

    if(n === 0) return 1;

    var word = generateSlug(1, options);
    var word2 = '';
    let x = 3; if(word.length <= 3) x = 1;
    if(parseInt(word.length) === parseInt(4)) x = 2;
    let arr = [];
    for(let y = 0 ; y < word.length;++y) arr.push(y) , word2 +='_';
    word2 = word2.split('');
    for(let y = 0 ; y < x ; ++y){
      let ind = parseInt(Math.random() * word.length - y);
      word2[arr[ind]]= word[arr[ind]];
      arr.splice(ind , ind);
    }

    word2 = word2.join(' ');

    await Room.updateOne({_id:room._id}, { $set: {turn : users[0].id,word:word}});

    // io.to(data.room).emit('turnchange' , {username: users[0].username , word:word});

    let gameinterval = setInterval(async function(){

      --count;

      if(count < 0){

        count = 65;

        ++i;
        
        if(i >= n){

          clearInterval(gameinterval);
          let players = await gameSchema.find({room:room._id}).sort({ score: -1 });

          let ab = await Room.updateOne({ name: room.name}, { $set: { drawings: [] , redostack :[] , turnstatus : 0} });
          let bc = await Room.updateOne({ name: room.name}, { $set: { chatMessages: [] }});

          if(bc){
            
            io.to(room.name).emit('chatHistory',[]);

          }
          io.to(room.name).emit('clearCanvas');

          io.to(data.room).emit('endgame',{users:players});

          let roomss = await Room.find({turnstatus:0});

          roomss = roomss.map((room) => room.name);

          io.emit('updateRooms', roomss);

          if(players){
            await gameSchema.updateMany({room:room._id} , {$set :{score : 0}});
          }

          return 0;

        }

        let user = null;

        while(1)
        {
          
          user = await gameSchema.findOne({username:users[i].username , present:1});

          if(user === null && (i + 1) >= n){

              clearInterval(gameinterval);

              let players = await gameSchema.find({room:room._id}).sort({ score: -1 });

              let ab = await Room.updateOne({ name: room.name}, { $set: { drawings: []  , redostack :[] , turnstatus:0} });
              let bc = await Room.updateOne({ name: room.name}, { $set: { chatMessages: [] }});

              if(bc){

                io.to(room.name).emit('chatHistory', []);

              }
              io.to(room.name).emit('clearCanvas');

              io.to(data.room).emit('endgame',{users:players});

              let roomss = await Room.find({turnstatus:0});
              
              roomss = roomss.map((room) => room.name);

              io.emit('updateRooms', roomss);

              if(players){
                await gameSchema.updateMany({room:room._id} , {$set :{score : 0}});
              }
              return 0;
              break;
            }


            if(user !== null){
              break;
            }


            ++i;


          }

        //clearInterval(gameinterval);
        word = generateSlug(1, options);
        word2 = '';
            let x = 3; if(word.length <= 3) x = 1;
            if(parseInt(word.length) === parseInt(4)) x = 2;
            let arr = [];
            for(let y = 0 ; y < word.length;++y) arr.push(y) , word2 +='_';
            word2 = word2.split('');
            for(let y = 0 ; y < x ; ++y){
              let ind = parseInt(Math.random() * word.length - y);
              word2[arr[ind]]= word[arr[ind]];
              arr.splice(ind , ind);
            }
            word2 = word2.join(' ');
        await Room.updateOne({_id:room._id}, { $set: {turn : user.id,word:word}});
        // io.to(data.room).emit('turnchange' , {username: user.username , word:word});
        await gameSchema.updateMany({room:room._id},{sadd : 0});

      }else{
        io.to(data.room).emit('turnupdates' , {username: users[i].username , word:word , count:count , word2 : word2})
      }

    } , 1000);

  }

  async createRoom(req, res) {
    try {
      const userinfo = req.cookies.useinfo;
      const createdroom = `${req.body.roomname}-${userinfo.username}-${userinfo.id}`;
      let x = await Room.find({name:createdroom});
      if(x.length){
        res.status(400).send('<script>alert("Room with same name already exists."); window.location = "/start";</script>');
      }else {
      const room = new Room({ name: createdroom, turn:userinfo.id , turnstatus : 0});
      const saved = await room.save();
      // socket.join(room.name);
      const roomNumber = saved.name;
      if(saved)
       res.render("home" , {roomNumber});

      if(saved)

      this.io.emit('updateRooms', await this.getRooms());

      }
    } catch (error) {
      console.error('Error creating room:', error.message);
    }

  }

  async joinRoom(socket, roomName , username , id , prevroom) {

    var roomtojoin = roomName;

    // console.log(roomtojoin);


    socket.join(roomtojoin);


    const room = await Room.findOne({name: roomtojoin});


    const user  = await gameSchema.findOne({room:room._id,id:id}) ;

    let x = undefined;

    if(user === null){

      if(room.turnstatus === 1){

        this.io.to(socket.id).emit('makealert', {message:"Game is alredy started in this room you are not able to join."});

        return ;

      }

    let y = await User.findOne({username:username});

    // console.log(y);

    const roomuser = new gameSchema({room:room._id , username:username , socketid:socket.id, id : id , present : 1 , score:0 ,img:y.img , sadd : 0});

    x  = await roomuser.save();

    }
    else{

    x = await gameSchema.updateOne({room : room._id , id:id}, { $set: {socketid: socket.id,present:1}});

    }

    if(x){

     let y = await gameSchema.find({room:room._id,present:1});
    //  console.log(y);

     if(y){
    this.io.to(roomtojoin).emit('updateRooms', await this.getRooms());
    this.io.to(roomtojoin).emit('chatHistory', await this.getChatHistory(roomName));
    this.io.to(roomName).emit('drawingHistory', await this.getDrawingHistory(roomName));
    this.io.to(roomtojoin).emit('chatMessage', { user: 'System',id:'1', message: `Player ${username} joined the room.` });
    this.io.to(roomtojoin).emit('Updateusers' , await this.getgameplayers(room._id));
     }

    }

    let room2 = await Room.findOne({name:prevroom});
    let upd = 0;
    if(prevroom === roomtojoin) upd = 1;
    else           socket.leave(room2.name);     
    let ab = await gameSchema.updateOne({room:room2._id , username:username}, {$set:{present : upd}});


    if(ab){

    let tot = await gameSchema.find({room:room2._id});
    let notpre = await gameSchema.find({room:room2._id , present :0});
    if(notpre.length === tot.length){

      await gameSchema.deleteMany({room:room2._id});

      await Room.deleteOne({_id:room2._id});

      this.io.emit('updateRooms',await this.getRooms());
    }

    this.io.to(room2.name).emit('Updateusers' , await this.getgameplayers(room2._id));

  }

  }

  async removeplayer(socket , data){
    const host = await gameSchema.findOne();
    if(host.username === data.username){

      const room = await Room.findOne({name: data.room});
      const ruser = await gameSchema.findOne({username:data.player});
      let x  = await gameSchema.deleteOne({room:room._id , username:data.player});
      if(x){
      this.io.to(ruser.socketid).emit('initiateRedirect', {to : '/start'});
      this.io.to(socket.id).emit('makealert', {message:"Player Removed success fully."});
      this.io.to(data.room).emit('Updateusers' , await this.getgameplayers(room._id));
      }

    }else{

      this.io.to(socket.id).emit('makealert', {message:"Only host can able to remove a player."});

    }
  }

  async getgameplayers(id){

    const players = await gameSchema.find({room:id , present:1});
    return players;

  }

  async getRooms() {
    const rooms = await Room.find({turnstatus:0});
    return rooms.map((room) => room.name);
  }

  async getChatHistory(roomName) {
    const { chatMessages } = await Room.findOne({ name: roomName });
    return chatMessages;
  }

  async getDrawingHistory(roomName) {
    const { drawings } = await Room.findOne({ name: roomName});
    return drawings;
  }
}

module.exports = PictionaryGame;
