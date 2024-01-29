// const multer = require("multer");

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "public/images"); // Set the destination folder
//     },
//     file: (req, file) => {

//         const match = ["image/png", "image/jpeg", "image/jpg"];

//         if (match.indexOf(file.mimetype) === -1) {
//             const error = new Error("File format not supported");
//             console.log("File format not supported");
//             return ('<script> alert("file format not matched"); window.location ="./" </script> ');
//         }

//         return {
//             bucketName: "photos",
//             filename: `${Date.now()}-image-${file.originalname}`
//         };
//     }
// });

// module.exports = multer({ storage });


const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let currdir = __dirname;
        cb(null, `${currdir}/../public/images`);
    },
    filename: (req, file, cb) => {
        const match = ["image/png", "image/jpeg", "image/jpg"];

        if (match.indexOf(file.mimetype) === -1) {
            const error = new Error("File format not supported");
            console.log("File format not supported");
            return cb(error, null);
        }

        cb(null, `${Date.now()}-image-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (!file) {
        const error = new Error("No file provided");
        console.log("No file provided");
        return cb(error, false);
    }
    
    cb(null, true);
};

module.exports = multer({ storage, fileFilter });
