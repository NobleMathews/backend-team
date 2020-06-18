const multer = require('multer')
const storage = require('./storage')
const path = require('path')

const upload = multer({ storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        // png jpg gif and jpeg allowed
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {  
            return callback(null, false)
        }
        callback(null, true)
    },
    limits:{
        fileSize: 50 * 1024 // 50 Mb limit imposed
    } 
})

module.exports = upload