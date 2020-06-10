const router = require('express').Router()
const projectmodel = require('../models/Project.model.js')

router.route('/create').post((req, res) => {
  var project = new projectmodel({
    title: req.body.title,
    team_members: req.body.team_member,
    description: req.body.description,
    branch: req.body.branch,
    club: req.body.club,
    degree: req.body.degree,
    snapshot_url: req.body.snapshot_url
  })

  project.save((err) => {
    console.error.bind(console, 'saving of project not done yet!')
  })
  res.status(200).send(req.body)
})
router.route('/delete').post((req, res) => {
  const project_title = req.body.title
  projectmodel.deleteOne({ title: project_title }, (err) => {
    console.error.bind(console, 'not yet deleted')
  })
  res.status(200).send('Successfully Deleted')
})

router.route('/update').post((req, res) => {
  const project_title = req.body.previous_title
  	var change = {

  		title: req.body.title,
    	team_members: req.body.team_member,
    	description: req.body.description,
    	branch: req.body.branch,
    	club: req.body.club,
    	degree: req.body.degree,
    	snapshot_url: req.body.snapshot_url
  }

  projectmodel.findOneAndUpdate({ title: project_title }, change)
    .catch(err => {
      console.log(err)
    })

  res.status(200).send(req.body)
})
module.exports = router
