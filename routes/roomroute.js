const express = require("express");
const controlroom = require("../controller/controlroom");
const { isloged } = require("../middlewares/auth");
const router = express.Router();


router.post("/create" ,isloged, async function (req, res) {
    controlroom.create(req,res);
});

router.post("/join",isloged, async function (req, res) {
    controlroom.join(req, res);
});

module.exports = router;