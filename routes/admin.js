const router = require('express').Router()
const clubHeadsModel = require('../models/ClubHead.model')
const superAdminModel = require('../models/SuperAdmin.model')

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
  if (sess.user_id) {
    admins = {
      _id: sess._id,
      name: sess.name,
      user_id: sess.user_id,
      email_id: sess.email_id,
      contact: sess.contact
    }

    return res.render('landing_admin', { admin: admins })
  }

  const user_id = req.body.user_id
  const pswd = req.body.pswd
  const admin = { user_id, pswd }
  superAdminModel.findOne(admin)
    .then(admin => {
      if (admin) {
        sess._id = admin._id
        sess.name = admin.name
        sess.user_id = admin.user_id
        sess.email_id = admin.email_id
        sess.contact = admin.contact
        // site to redirect to on login success 
        res.render('landing_admin', { admin: admin })
      } else {
        // user doesnt have admin privileges (Show UI popup) ,redirect to user login
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
      res.render('update_profile_admin', { id: req.params.id, user_id: admin.user_id,name: admin.name,contact:admin.contact ,email_id:admin.email_id })
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
      res.render('landing_admin', { admin: admin })
    }).catch(err => {
      res.json(err)
    })
})



router.route('/club_head/reset/:id').get((req, res) => { // by this route the club-head values will be set on default which can be changed by thhe club-head later on
  const club_head_id = req.params.id
  clubHeadsModel.findById(club_head_id)
    .then(user => {
      const l_club_name = user.club_name.toLowerCase()
      clubHeadsModel.findByIdAndUpdate(user._id, {
        pswd: l_club_name,
        name: '',
        contact: '',
        email_id: '',
        dp_url: '',
        bio: ''
      })
        .then(() => {
          res.redirect('/club/view_all')
        }).catch(err => {
          res.json(err)
        })
    }).catch(err => {
      res.json(err)
    })
})

module.exports = router
