const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images"); // Set the destination folder
    },
    file: (req, file) => {

        const match = ["image/png", "image/jpeg", "image/jpg"];

        if (match.indexOf(file.mimetype) === -1) {
            const error = new Error("File format not supported");
            console.log("File format not supported");
            return ('<script> alert("file format not matched"); window.location ="./" </script> ');
        }

        return {
            bucketName: "photos",
            filename: `${Date.now()}-image-${file.originalname}`
        };
    }
});

module.exports = multer({ storage });