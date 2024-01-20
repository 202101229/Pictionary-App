const Room = require('./schemas/roomSchema');

class chathandling{
  constructor(io) {
    this.io = io;
  }

  async message(data){
    try{

        console.log(data.room);

        data.room = (data.room).toString();
    
        const x = await Room.findOne({name:data.room});
    
        const xy = await Room.updateOne({ name: data.room }, { $push: { chatMessages: { user: data.user, id : data.id, message: data.message } } });
        this.io.to(data.room).emit('chatMessage', { user: data.user, id:data.id , message: data.message });
    }
    catch (e){
        console.log(e);
    }
  }
}

module.exports = chathandling;
