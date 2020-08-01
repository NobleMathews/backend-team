const connection = require('../../db/mongoose')
const router = require('express').Router()
const mongoose = require('mongoose')
var path = require('path');

let gfs
connection.once('open', ()=>{
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
})
router.get('/', (req, res) => {
  res.sendStatus(200);
})

router.get('/:filename', (req, res) => {
  // serve from static folder .. keep file names same
  let known_hosts=["hackerrank","topcoder","codechef","codeforces","unknown_host"]
  if(known_hosts.includes(req.params.filename)){
    return res.sendFile(path.join(__dirname, '../../public', `images/challenges/${req.params.filename}.JPG`));
  }
  else{
  //get from gfs
  gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'no files exist'
        })
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res)
    })
  }
})

module.exports = router