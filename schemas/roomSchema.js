// schemas/roomSchema.js

const mongoose = require('mongoose');
const { Schema } = mongoose;
const drawingSchema = require('./drawingSchema');
const chatMessageSchema = require('./chatMessageSchema');

const roomSchema = new Schema({
  name: String,
  drawings: [drawingSchema.schema], // Ensure drawingSchema is referenced correctly
  chatMessages: [chatMessageSchema.schema], // Ensure chatMessageSchema is referenced correctly
  turn: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Room', roomSchema);