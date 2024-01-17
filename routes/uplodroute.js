const express = require("express");
const router = express.Router();
const upload  = require("../middlewares/upload");

const mongoose = require("mongoose");

router.get("/",(req,res)=>{
    return res.render("exp.hbs");
})

router.post("/upload",upload.single('file'),(req,res)=>{
    try{
    if(req.file === undefined) return res.send("you must select a file");
    const imgUrl = `${process.env.Base_Url}/file/${req.file.filename}`;
    return res.send(imgUrl);
    }
    catch{
        res.send(err);
    }
})


router.get("/:filename",async(req,res)=>{
    try{
        const file = req.params.filename;
        res.redirect(`/images/${file}`);
    }
    catch{
        res.send("file not found");
    }
});

router.delete("/:filename",async(req,res)=>{
    try{
        res.send("deleted succesfully");
    }
    catch{
        console.log(err);
        res.send("error delete")
    }
    
})


module.exports = router;