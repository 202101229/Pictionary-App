// schemas/gameSchema.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  username:{type:String},
  socketid:{type:String},
  id:{type:Schema.Types.ObjectId,ref :'User'},
  present : {type : Number}
});

module.exports = mongoose.model('Game', gameSchema);
