// schemas/drawingSchema.js

const mongoose = require('mongoose');

const drawingSchema = new mongoose.Schema({
  px:String,
  py:String,
  x: String,
  y: String,
  selectedTool:String,
  selectedcolor:String,
  Lwidth:Number,
  opno:Number,
});

module.exports = mongoose.model('Drawing', drawingSchema);
