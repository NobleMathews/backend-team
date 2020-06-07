const router = require('express').Router()
var clubmodel = require('../models/Club.model.js')
var usermodel = require('../models/Users.js')
router.route('/create_club').post((req, res) => {
  var club = new clubmodel({
    name: req.body.club_name,
    head: req.body.head_name,
    description: req.body.club_description,
    logo: req.body.logo
  })

  club.save((err) => {
    console.error.bind(console, 'saving is not done yet')
  })

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(club)
})

router.route('/create_club').delete((req, res) => {
  const club = req.body.club_name

  clubmodel.deleteMany({ name: club }, (err) => {
    console.error.bind(console, 'not deleted')
  })
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(club)
})

router.route('/create_club_head').post((req, res) => {
  const club_name = req.body.club_name
  var user = new usermodel({
    user_id: club_name,
    pswd: club_name,
    name: req.body.name,
    contact: req.body.contact,
    email_id: req.body.email_id,
    dp_url: req.body.dq_url,
    club_head: true,
    club_name: club_name,
    bio: req.body.bio
  })
  console.log(user.user_id)
  user.save((err) => {
    console.error.bind(console, 'saving not done yet')
  })
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(user)
})

router.route('/create_club_head/update').post((req, res) => {
  var club_name = req.body.club_name
  var change = {
    user_id: club_name, // wo to waise bhhi raahega hi
    pswd: club_name,
    name: '',
    contact: '',
    email_id: '',
    dp_url: '',
    club_head: true,
    club_name: club_name,
    bio: ''
  }

  usermodel.findOneAndUpdate({ club_name: club_name }, change)
    .catch(err => {
      console.log(err)
    })

  res.status(200).send('Succesful')
})
module.exports = router
