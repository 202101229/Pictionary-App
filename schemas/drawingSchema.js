// schemas/drawingSchema.js

const mongoose = require('mongoose');

const drawingSchema = new mongoose.Schema({
  x: Number,
  y: Number,
});

module.exports = mongoose.model('Drawing', drawingSchema);
