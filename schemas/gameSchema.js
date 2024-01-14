// schemas/gameSchema.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  turn: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Game', gameSchema);
