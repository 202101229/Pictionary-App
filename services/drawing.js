const Room = require('../schemas/roomSchema');
const User = require('../schemas/userSchema');
const Game = require('../schemas/gameSchema');
const cookie = require("cookie");

class drawhandling {
    constructor(io) {
        this.io = io;
    }
    async drawLine(data) {

        
        data.room = (data.room).toString();
        
        this.io.to(data.room).emit('drawLine', data);
    
        const x = data.room;
        var indata = data;
        delete indata.room;
        try{
        indata.px = (indata.px).toString();indata.py = (indata.py).toString();
        indata.x = (indata.x).toString();indata.y = (indata.y).toString();
        const y = await Room.updateOne({ name: x}, { $push: { drawings:indata} , redostack : []});
        // console.log(y);
        }
        catch(e){
            console.log(e);
        }
    }


    async undo(roomName){

        try {
          const room = await Room.findOne({ name: roomName }).exec();
      
          if (!room) {
            console.error('Room not found');
            return;
          }
          const maxOpno = Math.max(...room.drawings.map(drawing => drawing.opno));
          const drawingsToDelete = room.drawings.filter(drawing => drawing.opno === maxOpno);
      
          if (drawingsToDelete.length === 0) {
            // console.error('No drawings found in the room');
            return;
          }
          drawingsToDelete.forEach(drawing => {
            room.drawings.pull(drawing);
          });
      
          room.redostack.push(...drawingsToDelete);
          const savedRoom = await room.save();
    
          this.io.to(roomName).emit('drawingHistory', await this.getDrawingHistory(roomName));
        } catch (err) {
          console.error('Error:', err);
        }
    
    
      }
    
      async redo(roomName){
    
        try {
    
          const room = await Room.findOne({ name: roomName }).exec();
      
          if (!room) {
            console.error('Room not found');
            return;
          }
      
          const minOpno = Math.min(...room.redostack.map(drawing => drawing.opno));
          const drawingsToRedo = room.redostack.filter(drawing => drawing.opno === minOpno);
      
          if (drawingsToRedo.length === 0) {
            // console.error('No drawings found in the redostack');
            return;
          }
      
          drawingsToRedo.forEach(drawing => {
            room.redostack.pull(drawing);
            room.drawings.push(drawing);
          });
          const savedRoom = await room.save();
          this.io.to(roomName).emit('drawingHistory', await this.getDrawingHistory(roomName));
    
        } catch (err) {
          console.error('Error:', err);
        }
    
      }  
      async getDrawingHistory(roomName) {
        const { drawings } = await Room.findOne({ name: roomName});
        return drawings;
      }



}

module.exports = drawhandling;
