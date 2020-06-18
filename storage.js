const GridFsStorage = require('multer-gridfs-storage')
const uri = process.env.URI

const storage = new GridFsStorage({
    url: uri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err)
          }
          const filename = buf.toString('hex') + path.extname(file.originalname)
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