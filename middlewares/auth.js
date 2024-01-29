const express = require("express");
const app = express();
const User = require('../schemas/userSchema');

async function isregistred(req, res, next) {

    const v = await User.find({ username: req.body.name });

    if (v.length == 0) {

        return res.status(400).send('<script>alert("You are entered wrong user name or you are not registered for register click on register."); window.location ="/" </script>');

    }

    else {


        next();

    }


}

async function isloged(req, res, next) {
    if (req.cookies.useinfo) {
        next();
    } else {
        res.status(400).send('<script> alert("You have to login first."); window.location = "/login";</script>');
    }

}

async function alredyloged(req,res,next){

    if(req.cookies.useinfo){

        return res.redirect('/start');

    }else{
        next();
    }

}

module.exports = { isregistred, isloged , alredyloged}