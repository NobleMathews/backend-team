const router = require('express').Router()
const connection = require('../server')
const crypto = require('crypto')
const path = require('path')
const multer = require('multer')
const Users = require('../models/Users')
const Events = require('../models/Event')
const moment = require('moment')
var upload = require('./images');
const GridFsStorage = require('multer-gridfs-storage')

const uri = 'mongodb+srv://heads:heads@cluster0-v6kuo.mongodb.net/techsite?retryWrites=true&w=majority'
let gfs
connection.once('open', () => {
  console.log('MongoDB database connection established successfully')
  gfs = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' })
})

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

const upload = multer({ storage,
fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    // png jpg gif and jpeg allowed
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      //enable this line if abort should be aborted || currently the file is just ignored & not sent for upload
        // return callback(new Error('Only images are allowed'))              
        return callback(null, false)

    }
    callback(null, true)
},
  limits:{
      fileSize: 50 * 1024 // 50 Mb limit imposed
  } 
})


//  for rendering summary creation page
router.route('/event_summary/create').get((req,res)=>{
})

// route to create event_summary
router.route('/event_summary/create').post((req,res)=>{
})

// for rendering event_summary updating page
router.route('/summary_edit/:id').get((req,res)=>{
    res.render('add_summary',{id:req.params.id})
})

//  route to update event_summary
router.route('/summary_update/:id').post( upload.any('gallery',20), (req, res)=>{
    const id = req.params.id;
    var pics_url
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
    }
    const evsum={
        'event_summary.gallery' : pics_url,                          
        'event_summary.chief_guest' : req.body.chief_guest,
        'event_summary.award_winners' : req.body.award_winners,
        'event_summary.summary' : req.body.summary,
        'event_summary.outside_links' : req.body.outside_links,
        'event_summary.file_attachment' : req.body.file_attachment,
        'event_summary.video_links' : req.body.video_links
    }
    for(let field in evsum) if(!evsum[field]) delete evsum[field];
    Events.findByIdAndUpdate(id,evsum)
    .then((event)=>{
        res.redirect("/users/events/retrieve");
    });
});

// route to delete event_summary
router.route('/event_summary/delete').delete((req,res)=>{})