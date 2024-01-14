// schemas/chatMessageSchema.js

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: String,
  message: String,
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
