const router = require('express').Router()
const clubHeadsModel = require('../models/ClubHead.model')
const upload = require('../db/upload')

// for rendering password page
router.route('/password/change').get((req, res) => {
  res.render('update_password_clubHead')
})

// route for changing the password
router.route('/password/change').post((req, res) => {
  var pswd = req.body.pswd
  clubHeadsModel.findByIdAndUpdate(req.session._id, { pswd: pswd })
    .then(() => {
      res.redirect(307, '/profile/')
    }).catch(err => {
      res.json(err)
    })
})

// route to create club_head
router.route('/create').post((req, res) => {
  const club_head = new clubHeadsModel({
    user_id: req.body.user_id,
    pswd: req.body.pswd,
    email_id: req.body.email_id,
    club_name: req.body.club_name.toUpperCase()
  })

  club_head.save((err, user) => {
    if (err) {
      res.json(err)
    }else{
      res.redirect('/club_head/view_all')
    }
  })
})

// route to render club_head create page
router.route('/create').get((req, res) => {
  res.render('create_club_head')
})

// route for updating profile
router.route('/profile/').post(upload.single('profpic'), function (req, res, next) {
  var sess = req.session
  const id = req.session._id
  const uid = req.params.id
  var dpurl = req.body.dp_url

  if (req.file != undefined) {
    dpurl = req.file.filename
  }
  const change = {
    // pswd: req.body.pswd,
    dp_url: dpurl,
    name: req.body.name,
    contact: req.body.contact,
    email_id: req.body.email_id,
    bio: req.body.bio
  }
  sess.dp_url = dpurl
  sess.email_id = req.body.email_id
  sess.contact = req.body.contact
  sess.name = req.body.name
  sess.bio = req.body.bio
  clubHeadsModel.findByIdAndUpdate(id, change)
    .then(() => {
      res.render('landing_clubHead', {
        id: sess._id,
        club_name: sess.club_name,
        name: sess.name,
        user_id: sess.user_id,
        pswd: sess.pswd,
        email_id: sess.email_id,
        contact: sess.contact,
        bio: sess.bio,
        dp_url: sess.dp_url
      })
    }).catch(err => {
      res.json(err)
    })
})

// for rendering update profile
router.route('/profile/').get((req, res) => {
  // turn on the projections as per necessity
  clubHeadsModel.findById(req.session._id)
    .then(user => {
      res.render('update_profile_clubHead', { user: user })
    }).catch((err) => {
      res.json(err)
    })
})

// route for rendering profile and action page
router.route('/').post((req, res) => {
  // console.log(req.body);
  sess = req.session

  if (sess.user_id) {
    return res.render('landing_clubHead', {
      id: sess._id,
      club_name: sess.club_name,
      name: sess.name,
      user_id: sess.user_id,
      pswd: sess.pswd,
      email_id: sess.email_id,
      contact: sess.contact,
      bio: sess.bio,
      dp_url: sess.dp_url
    })
  }
  const user_id = req.body.user_id
  const pswd = req.body.pswd
  const user = { user_id, pswd }
  clubHeadsModel.find(user)
    .then(user => {
      if (user.length === 1) {
        sess._id = user[0]._id
        sess.club_name = user[0].club_name
        sess.name = user[0].name
        sess.user_id = user[0].user_id
        sess.pswd = user[0].pswd
        sess.email_id = user[0].email_id
        sess.contact = user[0].contact
        sess.bio = user[0].bio
        sess.dp_url = user[0].dp_url

        res.render('landing_clubHead', {
          id: user[0]._id,
          club_name: user[0].club_name,
          name: user[0].name,
          user_id: user[0].user_id,
          pswd: user[0].pswd,
          email_id: user[0].email_id,
          contact: user[0].contact,
          bio: user[0].bio,
          dp_url: user[0].dp_url

        })
      } else {
        res.render('index', { alerts: 'Wrong Username / Password' })
      }
    }).catch((err) => {
      res.render('index', { alerts: 'Invalid Request' })
      // res.json('Error: ' + err)
    })
})

// route to view all club_heads
router.route('/view_all').get((req, res) => {
  clubHeadsModel.find({},(err,club_heads)=>{
    if(err){
      res.json(err)
    }else{
    res.render('view_club_heads',{club_heads:club_heads})
    }
  })
})

// route to delete a club_head
router.route('/delete/:id').get((req,res)=>{
  const club_head_id = req.params.id
  clubHeadsModel.findByIdAndRemove(club_head_id)
  .then(()=>{
    res.redirect('/club_head/view_all')
  }).catch(err=>{
    res.json(err)
  })
})

module.exports = router
