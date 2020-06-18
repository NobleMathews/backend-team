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
        return callback(null, false)
    }
    callback(null, true)
},
  limits:{
      fileSize: 50 * 1024 // 50 Mb limit imposed
  } 
})

// route for rendering the project creating page
router.route('/create_project/:id').get((req, res) => {
    superAdminModel.find({ _id: req.params.id })
      .then(admin => {
        if (admin.length === 1) {
          res.render('create_project', { id: req.params.id })
        } else {
          res.send('you dont have admin privilages')
        }
      }).catch(err => {
        res.status(404).send(err)
      })
})

// route to create project
router.route('/project/create').post( upload.any('snapshot_url', 20),  (req, res, next) => {
    var snaps = []
    // console.log(req.files);
    if (req.files != undefined) {
      snaps = req.files.map(function (file) {
        return file.filename
      })
    }
    var project = new projectmodel({
      title: req.body.title,
      team_members: req.body.team_member,
      description: req.body.description,
      branch: req.body.branch,
      club: req.body.club,
      degree: req.body.degree,
      snapshot_url: snaps
    })
  
    project.save((err) => {
      console.error.bind(console, 'saving of project not done yet!')
    })
    // const id = req.body.id
    res.redirect('/admin/project_details')
})

// route for rendering pre-filled form to update project
router.route('/update_project/:id').get((req,res)=>{
    const proj_id = req.params.id
    projectmodel.findById(proj_id)
    .then(project=>{
      res.render('project_update',{project:project})
    })
})

// route to update project
router.route('/update_project/:id').post( upload.any('pics', 20), (req, res) => {
    const id = req.params.id
    var snapshots_url
    if (req.files != undefined) {
      snapshots_url = req.files.map((file) => {
        return file.filename
      })
    }
  
    var change = {
      title: req.body.title,
      team_members: req.body.team_member,
      description: req.body.description,
      branch: req.body.branch,
      club: req.body.club,
      degree: req.body.degree,
      snapshot_url: snapshots_url
    }
  
    projectmodel.findByIdAndUpdate(id, change)
      .then(() => {
        res.redirect('/admin/project_details/')
      }).catch(err => {
        res.status(400).send(err)
      })
})

// route to delete project
router.route('/projects/delete/:id').get((req, res) => {
    const project_id = req.params.id
    projectmodel.findByIdAndDelete(project_id)
      .then(() => {
        res.redirect('/admin/project_details')
      }).catch(err => {
        res.json(err)
      })
})

// route to view all projects
router.route('/project_details').get((req, res) => {
    projectmodel.find()
      .then(projects => {
        res.render('project_details', { projects: projects, _id: sess._id })
      }).catch(err => {
        res.status(404).send(err)
      })
})