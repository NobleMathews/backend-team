const crypto = require('crypto')
const path = require('path')
const GridFsStorage = require('multer-gridfs-storage')
// const uri = process.env.URI
const uri = 'mongodb+srv://heads:heads@cluster0-v6kuo.mongodb.net/techsite?retryWrites=true&w=majority'

const storage = new GridFsStorage({
    url: uri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {

        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err)
          }
          let filename;
          var ext = path.extname(file.originalname);
          if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {  
            filename= buf.toString('hex') + file.originalname;
          }
          else{
            filename= buf.toString('hex') + path.extname(file.originalname);
          }
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          }
          resolve(fileInfo)
        })
      })
    }
})

module.exports = storage