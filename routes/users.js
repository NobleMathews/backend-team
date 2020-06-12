const router = require('express').Router()
const Users = require('../models/Users')
const Events = require('../models/Event')
const moment = require('moment')

var sess
router.route('/').get((req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err)
    }
    res.redirect('/')
  })
})

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
        res.redirect('/')
      }
    }).catch((err) => {
      res.json('Error: ' + err)
    })
})

router.route('/profile/:user_id').get((req, res) => {
  const user_id = req.params.user_id
  const user = { user_id: user_id }
  // turn on the projections as per necessity
  Users.find(user, { club_head: 0, club_name: 0, createdAt: 0, updatedAt: 0 })
    .then(user => {
      if (user.length === 1) {
        // front end -> updater view
        res.render('updateprof', { id: user[0]._id, user_id: user[0].user_id, contact: user[0].contact, email_id: user[0].email_id,dp_url: user[0].dp_url,name: user[0].name })
      } else {
        res.redirect('/')
      }
    }).catch((err) => {
      res.json('Error: ' + err)
    })
})


// // body of post request must contain the object id as well as the url saved from gfs
// // this is automatically done when invoking the upload image route
// router.route('/profile/image/update/').get((req, res) => {
//   const id = req.query.id
//   const url = req.query.url
//   const change = {
//     dp_url: url
//   }
//   Users.findByIdAndUpdate(id, change)
//     .then((user) => {
//       res.sendStatus(200)
//     })
// })

// primary route to add event
router.route('/add_event/:user_id').get((req, res) => {
  Users.findOne({ user_id: req.params.user_id })
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
router.route('/events/retrieve/:club_head_id').get((req, res) => {
  const club_head_id = req.params.club_head_id
  Events.find({ owner: club_head_id })
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

module.exports = router
