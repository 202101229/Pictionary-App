// schemas/roomSchema.js

const mongoose = require('mongoose');
const { Schema } = mongoose;
const drawingSchema = require('./drawingSchema');
const chatMessageSchema = require('./chatMessageSchema');

const roomSchema = new Schema({
  name: String,
  drawings: [drawingSchema.schema], 
  chatMessages: [chatMessageSchema.schema],
  turn: { type: Schema.Types.ObjectId, ref: 'User' },
  word:{type:String},
  turnstatus:{type:Number}
});

module.exports = mongoose.model('Room', roomSchema);
