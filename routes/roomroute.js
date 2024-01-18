const express = require("express");
const controlroom = require("../controller/controlroom");
const router = express.Router();


router.post("/create", async function (req, res) {
    controlroom.create(req,res);
});

router.post("/join", async function (req, res) {
    controlroom.join(req, res);
});

module.exports = router;