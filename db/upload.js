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
        fileSize: 50 * 1000000 // 50 Mb limit imposed
    } 
})
// forced upload to handle non image uploads
const uploadf = multer({ storage,
    limits:{
        fileSize: 50 * 1000000 // 50 Mb limit imposed but unrestricted on type
    } 
})
module.exports =  {
   upload,uploadf
};