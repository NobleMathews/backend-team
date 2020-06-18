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

// for rendering the create club page
router.route('/create_club/').get((req, res) => {
    res.render('create_club')
  })

  // route to create the club
router.route('/club/create').post( upload.single('logo'), (req, res) => { // this is for creating the club-head
    const club_name = req.body.club_name
    let logo
    if (req.file == undefined) {
      logo = ' '
    } else {
      logo = `${req.file.filename}`
    }
    var u_club_name = club_name.toUpperCase()
    var l_club_name = club_name.toLowerCase()
    var user = new usermodel({
      user_id: l_club_name,
      pswd: l_club_name,
      name: '',
      contact: '',
      email_id: '',
      dp_url: '',
      club_head: true,
      club_name: u_club_name,
      bio: ''
    })
    user.save((err, user) => {
      var club = new clubmodel({
        name: u_club_name,
        head: user._id,
        description: req.body.club_description,
        logo_url: logo
      })
      club.save((err) => {
        console.error.bind(console, 'Creating new user failed')
      })
      res.redirect('/admin/clubs/retrieve')
    })
  })

// for rendering the club update page
router.route('/club/update/:id').get((req, res) => {
    const club_id = req.params.id
    clubmodel.findById(club_id)
      .then(club => {
        res.render('update_club', { club: club })
      }).catch(err => {
        res.json(err)
      })
  })

// route to update the club details
router.route('/club/update/:id').post( upload.single('logo') ,(req, res) => {
    
    const id = req.params.id
    let club_name=req.body.name;
    if (req.file == undefined) {
      var change = {
        name: club_name,
        description: req.body.description,
      }
    } else {
      var change = {
        name: club_name,
        description: req.body.description,
        logo_url: req.file.filename
      }
    }
  
    var u_club_name = club_name.toUpperCase()
    var l_club_name = club_name.toLowerCase()
    var changeU={
      user_id: l_club_name,
      pswd: l_club_name,
      club_name: u_club_name
    }
    clubmodel.findByIdAndUpdate(id, change,
      function(err, result) {
        if (err) {
          res.status(400).send(err)
        } else {
          usermodel.findByIdAndUpdate({ _id: result.head },changeU)
          .then(admin => {
            res.redirect("/admin/clubs/retrieve")
          }).catch(err => {
            res.status(404).send(err)
          })          
        }
      }
      );
  })

// route to delete club
router.route('/club/delete').delete((req, res) => { // this route will help in deleting a club
    const club = req.body.club_name
  
    clubmodel.deleteMany({ name: club }, (err) => {
      console.error.bind(console, 'not deleted')
    })
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(club)
  })

//   for rendering view page of all clubs
  router.route('/clubs/retrieve').get((req, res) => {
    clubmodel.find()
      .then(clubs => {
        res.render('view_club_heads', {
          clubs: clubs
        })
      }).catch((err) => {
        res.json('Error: ' + err)
      })
  })

// for rendering details of specific club
  router.route('/club/view/:id').get((req, res) => {
    const club_head_id = req.params.id
    usermodel.findById(club_head_id)
      .then(user => {
        res.render('club_details', { user: user })
      }).catch(err => {
        res.json(err)
      })
  })
  