const multer = require('multer')
const storage = require('./storage')
const path = require('path')

const upload = multer({ storage,
    fileFilter: function (req, file, callback) {
        if(file.fieldname === 'file_attachment'){
        // can restricts types here like shown below or with mimes
            return callback(null, true);
        }
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
module.exports = upload