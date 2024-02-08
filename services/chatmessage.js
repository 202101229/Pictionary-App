const gameSchema = require('../schemas/gameSchema');
const Room = require('../schemas/roomSchema');

class chathandling{
  constructor(io) {
    this.io = io;
  }

  async message(data){
    try{

        console.log(data.room);

        data.room = (data.room).toString();
    
        const x = await Room.findOne({name:data.room});

        if(x.word === data.message){

          const ply = await gameSchema.find({room:x._id , present : 1});

          let coorp = ply.find( u => u.username === data.user);

          if(coorp.sadd === 0){

          let y = ply.length;

          if(y <= 1) y = 2;

          let score1 = 100;
          let score2 = parseInt(score1 / (y - 1));

          await gameSchema.updateOne({ room: x._id, id: data.id}, { $inc: { score: score1} , $set:{sadd : 1}});
          await gameSchema.updateOne({ room: x._id, id: x.turn }, { $inc: { score: score2}});

          this.io.to(data.room).emit('chatMessage', { user: 'System',id:'1', message: `Player ${data.user} Guess the word currectly.`});
          }

        }else{
    
        const xy = await Room.updateOne({ name: data.room }, { $push: { chatMessages: { user: data.user, id : data.id, message: data.message } } });
        this.io.to(data.room).emit('chatMessage', { user: data.user, id:data.id , message: data.message });
        }
    }
    catch (e){
        console.log(e);
    }
  }
}

module.exports = chathandling;
