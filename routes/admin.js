const router = require('express').Router()
const clubmodel = require('../models/Club.model.js')
const usermodel = require('../models/Users.js')
const achievementModel = require('../models/Achievement.model')
const superAdminModel = require('../models/SuperAdmin.model')
const projectmodel = require('../models/Project.model.js')
var upload = require('./images');

var sess

// password changing route
router.route('/password/change/').post((req,res)=>{
  var pswd = req.body.pswd
  superAdminModel.findByIdAndUpdate(req.session._id,{pswd:pswd})
  .then(()=>{
    res.redirect(307,'/admin/')
  }).catch(err=>{
    res.json(err)
  })
})

// view profile
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

// for rendering the form
router.route('/profile/update/:id').get((req, res) => {
  superAdminModel.findOne({ _id: req.params.id })
    .then(admin => {
      res.render('admin_updateprof', { id: req.params.id, user_id: admin.user_id,name: admin.name,contact:admin.contact ,email_id:admin.email_id })
    })
})

// for updating through the form
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
      res.render('admin_landing', { admin: admin })
    }).catch(err => {
      res.json(err)
    })
})



router.route('/club_head/reset/:id').get((req, res) => { // by this route the club-head values will be set on default which can be changed by thhe club-head later on
  const club_head_id = req.params.id
  usermodel.findById(club_head_id)
    .then(user => {
      const l_club_name = user.club_name.toLowerCase()
      usermodel.findByIdAndUpdate(user._id, {
        pswd: l_club_name,
        name: '',
        contact: '',
        email_id: '',
        dp_url: '',
        bio: ''
      })
        .then(() => {
          res.redirect('/admin/clubs/retrieve')
        }).catch(err => {
          res.json(err)
        })
    }).catch(err => {
      res.json(err)
    })
})

module.exports = router
