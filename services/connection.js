// connection.js
require('dotenv').config()

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.Mongourl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log(process.env.Mongourl);
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
