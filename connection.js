const mongoose = require('mongoose');

async function conectMongodb(url){

    return mongoose.connect(url,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
         useCreateIndex:true,
    });
}

module.exports = {conectMongodb};