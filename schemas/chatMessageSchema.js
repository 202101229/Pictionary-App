// schemas/chatMessageSchema.js
const mongos = require('mongoose');
const { Schema } = mongos;

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: String,
  id: { type: Schema.Types.ObjectId},
  message: String,
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
