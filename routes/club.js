const router = require('express').Router()
const clubModel = require('../models/Club.model')
const clubHeadsModel = require('../models/ClubHead.model')
const upload = require('../db/upload');


// for rendering the create club page
router.route('/create/').get((req, res) => {
    res.render('create_club')
})

// route to create the club
router.route('/create').post( upload.single('logo'), (req, res) => { // this is for creating the club-head
    const club_name = req.body.club_name
    let logo
    if (req.file == undefined) {
      logo = ' '
    } else {
      logo = `${req.file.filename}`
    }
    var u_club_name = club_name.toUpperCase()
    var l_club_name = club_name.toLowerCase()
    var user = new clubHeadsModel({
      user_id: l_club_name,
      pswd: l_club_name,
      name: '',
      contact: '',
      email_id: '',
      dp_url: '',
      club_head: true,
      club_name: u_club_name,
      bio: ''
    })
    user.save((err, user) => {
      var club = new clubModel({
        name: u_club_name,
        head: user._id,
        description: req.body.club_description,
        logo_url: logo
      })
      club.save((err) => {
        console.error.bind(console, 'Creating new user failed')
      })
      res.redirect('/clubs/view_all')
    })
})

// for rendering the club update page
router.route('/update/:id').get((req, res) => {
    const club_id = req.params.id
    clubModel.findById(club_id)
      .then(club => {
        res.render('update_club', { club: club })
      }).catch(err => {
        res.json(err)
      })
})

// route to update the club details
router.route('/update/:id').post( upload.single('logo') ,(req, res) => {
    
    const id = req.params.id
    let club_name=req.body.name;
    if (req.file == undefined) {
      var change = {
        name: club_name,
        description: req.body.description,
      }
    } else {
      var change = {
        name: club_name,
        description: req.body.description,
        logo_url: req.file.filename
      }
    }
  
    var u_club_name = club_name.toUpperCase()
    var l_club_name = club_name.toLowerCase()
    var changeU={
      user_id: l_club_name,
      pswd: l_club_name,
      club_name: u_club_name
    }
    clubModel.findByIdAndUpdate(id, change,
      function(err, result) {
        if (err) {
          res.status(400).send(err)
        } else {
          clubHeadsModel.findByIdAndUpdate({ _id: result.head },changeU)
          .then(admin => {
            res.redirect("/clubs/view_all")
          }).catch(err => {
            res.status(404).send(err)
          })          
        }
      }
      );
})

// route to delete club
router.route('/delete/:id').delete((req, res) => { // this route will help in deleting a club
    const club = req.body.club_name
  
    clubModel.deleteMany({ name: club }, (err) => {
      console.error.bind(console, 'not deleted')
    })
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(club)
})

//   for rendering view page of all clubs
router.route('/view_all').get((req, res) => {
    clubModel.find()
      .then(clubs => {
        res.render('view_clubs', {
          clubs: clubs
        })
      }).catch((err) => {
        res.json('Error: ' + err)
      })
})

// for rendering details of specific club
router.route('/details/:id').get((req, res) => {
    const club_head_id = req.params.id
    clubHeadsModel.findById(club_head_id)
      .then(user => {
        res.render('details_club', { user: user })
      }).catch(err => {
        res.json(err)
      })
})

module.exports = router