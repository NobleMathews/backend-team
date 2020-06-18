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

// for rendering achievement create page
router.route('/achievement/create/').get((req, res) => {
    res.render('create_achievement')
})

// route to create achievement
router.route('/achievement/create/').post(upload.any('snapshot_url', 20), (req, res) => {
    var pics_url = []
  
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
    }
  
    var acheievement = new achievementModel({
      title: req.body.title,
      caption: req.body.caption,
      description: req.body.des,
      pics_url: pics_url
    })
  
    acheievement.save((err, ach) => {
      if (err) res, json(err)
      res.redirect('/admin/achievement/')
    })
})

// route for rendering achievement update page
router.route('/achievement/update/:id').get((req, res) => {
    achievementModel.findById(req.params.id)
      .then(ach => {
        res.render('update_achievement', { ach: ach })
      }).catch(err => {
        res.status(404).send('Does nit exist')
      })
})

// route to update achievement
router.route('/achievement/update/:id').post( upload.any('pics', 20), (req, res) => { // for updating the achievement of a given id
    const id = req.params.id
    var pics_url
    if (req.files != undefined) {
      pics_url = req.files.map((file) => {
        return file.filename
      })
    }
  
    var achievement = {
      title: req.body.title,
      caption: req.body.caption,
      description: req.body.des,
      pics_url: pics_url
    }
  
    achievementModel.findByIdAndUpdate(id, achievement)
      .then(() => {
        res.status(200).send('Achievement updated successfully')
      }).catch(err => {
        res.status(400).send(err)
      })
})

// route to delete achievement
router.route('/achievements/delete/:id').get((req, res) => {
    const achievement_id = req.params.id
    achievementModel.findByIdAndDelete(achievement_id)
      .then(() => {
        res.redirect('/admin/achievement')
      }).catch(err => {
        res.json(err)
      })
})

// route to view all achievemnts
router.route('/achievement/').get((req, res) => {
    achievementModel.find()
    .then(achievements => {
        res.render('view_achievement', { achievements })
    })
})

