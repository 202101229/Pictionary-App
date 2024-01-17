const express = require("express");
const { create , join } = require("../controller/controlroom");
const router = express.Router();


router.post("/create",function (req, res) {
    create(req,res);
});

router.post("/join", function (req, res) {
    join(res, res);
});

module.exports = router;