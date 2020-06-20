const router = require('express').Router()
const superAdminModel = require('../models/SuperAdmin.model')
const projectsModel = require('../models/Project.model')
const upload = require('../db/upload');


// route for rendering the project creating page
router.route('/create').get((req, res) => {
    superAdminModel.findOne({ _id: req.params.id })
      .then(admin => {
        if (admin) {
          res.render('create_project', { id: req.params.id })
        } else {
          res.send('you dont have admin privilages')
        }
      }).catch(err => {
        res.status(404).send(err)
      })
})

// route to create project
router.route('/create/').post( upload.any('snapshot_url', 20),  (req, res, next) => {
    var snaps = []
    // console.log(req.files);
    if (req.files != undefined) {
      snaps = req.files.map(function (file) {
        return file.filename
      })
    }
    var project = new projectsModel({
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
    res.redirect('/projects/view_all')
})

// route for rendering pre-filled form to update project
router.route('/update/:id').get((req,res)=>{
    const proj_id = req.params.id
    projectsModel.findById(proj_id)
    .then(project=>{
      res.render('update_project',{project:project})
    })
})

// route to update project
router.route('/update/:id').post( upload.any('pics', 20), (req, res) => {
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
  
    projectsModel.findByIdAndUpdate(id, change)
      .then(() => {
        res.redirect('/projects/view_all')
      }).catch(err => {
        res.status(400).send(err)
      })
})

// route to delete project
router.route('/delete/:id').get((req, res) => {
    const project_id = req.params.id
    projectsModel.findByIdAndDelete(project_id)
      .then(() => {
        res.redirect('/projects/view_all')
      }).catch(err => {
        res.json(err)
      })
})

// route to view all projects
router.route('/view_all').get((req, res) => {
    projectsModel.find()
      .then(project => {
        res.render('details_project', { projects: project,_id:0}) //, _id: sess._id
      }).catch(err => {
        res.status(404).send(err)
      })
})

module.exports = router