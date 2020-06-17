const router = require('express').Router()
const Users = require('../models/Users')
const Events = require('../models/Event')
const moment = require('moment')
var upload = require('./images');

var sess

router.route('/').post((req, res) => {
  // console.log(req.body);
  sess = req.session

  if (sess.user_id) {
    return res.render('public_landing', {
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
  Users.find(user)
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

        res.render('public_landing', {
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
        // res.redirect('/')
        res.render('index', { alerts: 'Wrong Username / Password' })
      }
    }).catch((err) => {
      res.render('index', { alerts: 'Invalid Request' })
      // res.json('Error: ' + err)
    })
})

router.route('/profile/').get((req, res) => {
  // turn on the projections as per necessity
  Users.findById(req.session._id)
    .then(user => {
      res.render('updateprof',{user:user})
    }).catch((err) => {
      res.json(err)
    })
})
// <form method="POST" action="/users/profile/image/upload/<%=id%>"
// invoked from form to upload
router.route('/profile/image/upload/:id').post( upload.single('file'), (req, res) => {
  const id = req.params.id
  // Sending back file name to server
  // console.log(req.file);
  res.redirect(`/users/profile/image/update?id=${id}&url=${req.file.filename}`)
  // res.json({file:req.file});
})

// use the following format for update requests in this route
router.route('/profile/').post( upload.single('profpic'), function (req, res, next) {
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
  Users.findByIdAndUpdate(id, change)
    .then(() => {
      res.render('public_landing', {
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

// primary route to add event
router.route('/add_event/').get((req, res) => {
  Users.findById(req.session._id)
    .then((user) => {
      // check if the user is club head
      if (user.club_head) {
        res.render('add_event', { club_head_id: user._id })
      } else {
        res.send('you are not club head')
      }
    }).catch(err => {
      console.log(err)
    })
})

// for viewing the events in backend by the respective club-head
router.route('/events/retrieve/').get((req, res) => {
  Events.find({ owner: req.session._id })
    .then(events => {
    // res.json(events)
      res.render('event_view', { events: events, moment: moment })
    }).catch((err) => {
      res.json('Error: ' + err)
    })
})

router.route('/events/details/:id').get((req, res) => {
  const id = req.params.id
  Events.find({ _id: id })
    .then(events => {
    // res.json(events)
      res.render('event_details', { events: events, moment: moment })
    }).catch((err) => {
      res.json('Error: ' + err)
    })
})

// to save the event in database
// <form action="/users/add_event/<%=club_head_id%>/add_event/<%=club_name%>/add" method="POST" enctype="multipart/form-data">
// from the add_event form
router.route('/add_event/save').post( upload.single('poster'), (req, res) => {
  let poster_url
  if (req.file == undefined) {
    poster_url = ' '
  } else {
    poster_url = `${req.file.filename}`
  }

  const event = new Events({
    name: req.body.event_name + '',
    venue: req.body.event_venue,
    date: req.body.event_date,
    description: req.body.description,
    poster_url: poster_url, // url to find poster of the event
    owner: req.session._id,
    categories: req.body.categories,
    speaker: req.body.speaker

  })

  event.save((err, event) => { // saving the event in database
    if (err) {
      res.json(err)
    } else {
      res.redirect('/users/events/retrieve/')
    }
  })
  // let headid = req.params.club_head_id;
})

// route for using in the notify section
router.route('/notify/:id').get((req, res) => {
  const event_id = req.params.id
  Events.findById(event_id)
    .then(event => {
    // res.json(events)

      Users.findById(event.owner)
        .then(user => {
          res.render('contact', { event: event, user: user })
        }).catch((err) => {
          res.json('Error: ' + err)
        })
    }).catch((err) => {
      res.json('Error: ' + err)
    })
})

//change password rendering route
router.route('/change_password').get((req,res)=>{
  res.render('password')
})

// for changing the password
router.route('/password/change').post((req,res)=>{
  var pswd = req.body.pswd
  Users.findByIdAndUpdate(req.session._id,{pswd:pswd})
  .then(()=>{
    res.redirect(307,'/users/')
  }).catch(err=>{
    res.json(err)
  })
})

module.exports = router
