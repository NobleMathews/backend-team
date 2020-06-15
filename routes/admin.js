const router = require('express').Router()
const clubmodel = require('../models/Club.model.js')
const usermodel = require('../models/Users.js')
const achievementModel = require('../models/Achievement.model')
const superAdminModel = require('../models/SuperAdmin.model')
const projectmodel = require('../models/Project.model.js')

var sess

router.route('/').post((req, res) => {
  sess = req.session
  console.log(sess.user_id)
  if (sess.user_id) {
    admins = {
      _id: sess._id,
      name: sess.name,
      user_id: sess.user_id,
      email_id: sess.email_id,
      contact: sess.contact
    }

    return res.render('admin_landing', { admin: admins })
  }

  const user_id = req.body.user_id
  const pswd = req.body.pswd
  const admin = { user_id, pswd }
  superAdminModel.find(admin)
    .then(admin => {
      if (admin.length === 1) {
        sess._id = admin[0]._id
        sess.name = admin[0].name
        sess.user_id = admin[0].user_id
        sess.email_id = admin[0].email_id
        sess.contact = admin[0].contact
        // site to redirect to on login success : ! Change to valid Get route -> view with admin features
        res.render('admin_landing', { admin: admin[0] })
      } else {
        // user doesnt have admin privileges (Show UI popup) , may redirect to user login
        // res.status(200).send('Sorry you donot have admin privileges !')
        res.render('index', { alerts: 'Sorry you donot have admin privileges !' })
      }
    }).catch((err) => {
      res.json('Error: ' + err)
    })
})

router.route('/club/delete').delete((req, res) => { // this route will help in deleting a club
  const club = req.body.club_name

  clubmodel.deleteMany({ name: club }, (err) => {
    console.error.bind(console, 'not deleted')
  })
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(club)
})


router.route('/club_head/reset/:id').get((req, res) => { // by this route the club-head values will be set on default which can be changed by thhe club-head later on
  const club_head_id = req.params.id
  usermodel.findById(club_head_id)
  .then(user=>{
    const l_club_name = user.club_name.toLowerCase()
    usermodel.findByIdAndUpdate(user._id,{
    pswd: l_club_name,
    name: '',
    contact: '',
    email_id: '',
    dp_url: '',
    bio: ''
    })
    .then(()=>{
      res.redirect('/admin/clubs/retrieve')
    }).catch(err=>{
      res.json(err)
    })
  }).catch(err=>{
    res.json(err)
  })
})

router.route('/achievement/create/').get((req, res) => {
  res.render('create_achievement')
})



router.route('/achievement/view/:id').get((req, res) => { // for displaying the achivement by using its id
  const id = req.params.id
  achievementModel.findById(id)
    .then(achievement => {
      res.status(200).json(achievement)
    }).catch(err => {
      res.status(400).send('Does not exist')
    })
})

router.route('/achievement/update/:id').get((req,res)=>{
  achievementModel.findById(req.params.id)
  .then(ach=>{
    res.render('update_achievement',{ach:ach})
  }).catch(err=>{
    res.status(404).send('Does nit exist')
  })
})



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

router.route('/profile/update/:id').get((req, res) => {
  superAdminModel.find({ _id: req.params.id })
    .then(admin => {
      res.render('admin_updateprof', { id: req.params.id, user_id: admin.user_id, pswd: admin.pswd })
    })
})

router.route('/profile/update/:id').post((req, res) => {
  var sess = req.session
  sess.name = req.body.name
  sess.email_id = req.body.email_id
  sess.contact = req.body.contact

  const change = {
    name: req.body.name,
    contact: req.body.contact,
    email_id: req.body.email_id
  }

  admin = {
    _id: sess._id,
    name: sess.name,
    user_id: sess.user_id,
    email_id: sess.email_id,
    contact: sess.contact
  }
  superAdminModel.findByIdAndUpdate(req.params.id, change)
    .then(() => {
      res.render('admin_landing',{admin:admin})
    }).catch(err => {
      res.json(err)
    })
})

router.route('/create_club/').get((req, res) => {
  res.render('create_club')
})

router.route('/project/update').post((req, res) => {
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
router.route('/project_details').get((req, res) => {
  projectmodel.find()
    .then(projects => {
        res.render('project_details',{projects:projects,_id:sess._id})
    }).catch(err => {
      res.status(404).send(err)
    })
})
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

router.route('/club/update/:id').get((req,res)=>{
  const club_id = req.params.id
  clubmodel.findById(club_id)
  .then(club=>{
    res.render('update_club',{club:club})
  }).catch(err=>{
    res.json(err)
  })
})

router.route('/projects/delete/:id').get((req,res)=>{
  const project_id = req.params.id
  projectmodel.findByIdAndDelete(project_id)
  .then(()=>{
    res.redirect('/admin/project_details')
  }).catch(err=>{
    res.json(err)
  })
})

router.route('/achievement/create/').get((req, res) => {
  res.render('create_achievement')
})

router.route('/achievements/delete/:id').get((req,res)=>{
  const achievement_id = req.params.id
  achievementModel.findByIdAndDelete(achievement_id)
  .then(()=>{
    res.redirect('/admin/achievement')
  }).catch(err=>{
    res.json(err)
  })
})


router.route('/achievement/').get((req, res) => {
  achievementModel.find()
  .then(achievements=>{
    res.render('view_achievement',{achievements})
  })
})

router.route('/achievement/edit/:id').get((req, res) => {
  const acv_id = req.params.id
  achievementModel.findById(acv_id)
  .then(achievement=>{
    res.render('update_achievement',{ach:achievement})
  })
})


router.route('/club/view/:id').get((req, res) => {
  const club_head_id = req.params.id
  usermodel.findById(club_head_id)
  .then(user=>{
    res.render('club_details',{user:user})
  }).catch(err=>{
    res.json(err)
  })
})

module.exports = router
