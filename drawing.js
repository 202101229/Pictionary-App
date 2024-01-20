const Room = require('./schemas/roomSchema');
const User = require('./schemas/userSchema');
const Game = require('./schemas/gameSchema');
const cookie = require("cookie");

class drawhandling {
    constructor(io) {
        this.io = io;
    }
    async drawLine(data) {
        this.io.to(data.room).emit('drawLine', data);

        data.room = (data.room).toString();
    
        const x = data.room;
        var indata = data;
        delete indata.room;
        try{
        indata.px = (indata.px).toString();indata.py = (indata.py).toString();
        indata.x = (indata.x).toString();indata.y = (indata.y).toString();
        const y = await Room.updateOne({ name: x}, { $push: { drawings:indata}});
        // console.log(y);
        }
        catch(e){
            console.log(e);
        }
    }

}

module.exports = drawhandling;
