const router = require('express').Router()
const clubModel = require('../models/Club.model')
const clubHeadsModel = require('../models/ClubHead.model')
const upload = require('../db/upload');
const adminAuth = require('../middleware/adminAuth');
const clubAuth = require('../middleware/clubAuth')

// for rendering the create club page
router.route('/create/').get(adminAuth, (req, res) => {
    res.render('create_club', {page_name:"clubs"})
})

// route to create the club
router.route('/create').post(adminAuth, upload.single('logo'), (req, res) => {
  let logo
  if(req.file == undefined){
    logo = ''
  }else{
    logo = `${req.file.filename}`
  }
  clubHeadsModel.findOne({email_id:req.body.email_id})
  .then((club_head)=>{

    if(!club_head){
      throw new Error()
    }
    var club = new clubModel({
      name: req.body.club_name.toUpperCase(),
      head: club_head._id,
      description: req.body.club_description,
      logo_url: logo
    })
    club.save((err,club)=>{
      if(err){
        res.json(err)
      }else{
        res.redirect('/club/view_all')
      }
    })
  }).catch((e) => {
    res.json('Club head must exist with given email!!!')
    //to redirect back to view all clubs page after showing error message
  })
})

// for rendering the club update page
router.route('/update').get(clubAuth, async (req, res) => {
    try{
      const owner = req.user
      const club = await clubModel.findOne({head: owner})

      if(!club){
        throw new Error()
      }

      res.render('update_club', {club})
    }catch(e){
      res.json('NO club has been assigned to the logged in club head by admin')
    }
    
})

// route to update the club details
router.route('/update/').post(clubAuth, upload.single('logo') ,async (req, res) => {
    const owner = req.user
    const club = await clubModel.findOne({head: owner})
    const id = club._id
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
          .then(() => {
            res.redirect(307, '/club_head/profile')
          }).catch(err => {
            res.status(404).send(err)
          })          
        }
      }
      );
})

// route to delete club
router.route('/delete/:id').delete(adminAuth, (req, res) => { 
    const club = req.body.club_name
  
    clubModel.deleteMany({ name: club }, (err) => {
      console.error.bind(console, 'not deleted')
    })
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(club)
})

// for rendering view page of all clubs
router.route('/view_all').get(adminAuth, (req, res) => {
    clubModel.find()
      .then(clubs => {
        res.render('view_clubs', {
          clubs: clubs, page_name:"clubs"
        })
      }).catch((err) => {
        res.json('Error: ' + err)
      })
})

// for rendering details of specific club
router.route('/details/:id').get(adminAuth, (req, res) => {
    const club_id = req.params.id
    clubModel.findById(club_id)
    .then(club => {
      clubHeadsModel.findById(club.head)
      .then(club_head=>{
        res.render('details_club',{club_head:club_head,club:club, page_name:"clubs"})
      }).catch(err=>{
        res.json(err)
      })
    }).catch(err=>{
      res.json(err)
    })
})

// for rendering the reset page
router.route('/reset/:id').get(adminAuth, (req,res)=>{
  const club_id = req.params.id
  res.render('reset_club',{club_id:club_id, page_name:"clubs"})
})

// route to reset any club
router.route('/reset/:id').post(adminAuth, (req,res)=>{
  const club_id = req.params.id
  const email_id = req.body.email_id
  clubHeadsModel.findOne({email_id:email_id},(err,club_head)=>{
    clubModel.findByIdAndUpdate(club_id,{head:club_head.email_id})
    .then(()=>{
      res.redirect('/admin',307)
    }).catch(err=>{
      res.json(err)
    })
  })
})

module.exports = router