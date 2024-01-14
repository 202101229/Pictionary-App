// schemas/userSchema.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type : String,
    require:true
  },
  img:{
    type:String,
    require : true
  }
});

module.exports = mongoose.model('User', userSchema);
