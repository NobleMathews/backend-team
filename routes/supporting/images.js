const connection = require('../../db/mongoose')
const router = require('express').Router()
const mongoose = require('mongoose')

let gfs
connection.once('open', ()=>{
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
})


router.get('/:filename', (req, res) => {
  req.app.locals.gfs=gfs;
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        if(req.params.filename=="randomgfsinit.png"){
          return res.status(200)
        }
        return res.status(404).json({
          err: 'no files exist'
        })
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res)
    })
})

module.exports = router