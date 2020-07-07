const router = require('express').Router()
const clubModel = require('../models/Club.model')
const clubHeadsModel = require('../models/ClubHead.model')
const clubMemberModel = require('../models/ClubMember.model')
const {upload, uploadf}= require('../db/upload')
const adminAuth = require('../middleware/adminAuth');
const clubAuth = require('../middleware/clubAuth')

// for rendering the create club page
router.route('/create/').get(adminAuth, (req, res) => {
    res.render('create_club', { alerts: req.flash('error'),page_name:"clubs"})
})

// route to create the club
router.route('/create').post(adminAuth, (req, res) => {
  clubHeadsModel.findOne({email_id:req.body.email_id})
  .then((club_head)=>{
    console.log(req.body)
    if(!club_head){
      throw new Error()
    }
    var club = new clubModel({
      name: ((club_head.club_name).toUpperCase()),
      head: club_head._id,
    })
    club.save((err,club)=>{
      if(err){
        req.flash("error",err)
    res.redirect('/club/view_all')
      }else{
        res.redirect('/club/view_all')
      }
    })
  }).catch((e) => {
    req.flash("error",['Club head must exist with given email & Club name shouldnt aready exist !!!'])
    res.redirect('/club/view_all')
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

      res.render('update_club', { alerts: req.flash('error'),club,page_name:'update_club'})
    }catch(e){
      req.flash("error",['No club has been assigned to the logged in club head by admin'])
      res.redirect('/club/view_all')
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
        res.render('view_clubs', { alerts: req.flash('error'),
          clubs: clubs, page_name:"clubs"
        })
      }).catch((err) => {
        req.flash("error",err)
        res.redirect('/admin/profile')
      })
})

// for rendering details of specific club
router.route('/details/:id').get(adminAuth, (req, res) => {
    const club_id = req.params.id
    clubModel.findById(club_id)
    .then(club => {
      clubHeadsModel.findById(club.head)
      .then(club_head=>{
        res.render('details_club', { alerts: req.flash('error'),club_head:club_head,club:club, page_name:"clubs"})
      }).catch(err=>{
        req.flash("error",err)
    res.redirect('/club/view_all')
      })
    }).catch(err=>{
      req.flash("error",err)
    res.redirect('/club/view_all')
    })
})

// for rendering the reset page
router.route('/reset/:id').get(adminAuth, (req,res)=>{
  const club_id = req.params.id
  res.render('reset_club', { alerts: req.flash('error'),club_id:club_id, page_name:"clubs"})
})

// route to reset any club
router.route('/reset/:id').post(adminAuth, (req,res)=>{
  const club_id = req.params.id
  const email_id = req.body.email_id
  
  clubHeadsModel.findOne({email_id:email_id},(err,club_head)=>{
    clubModel.findByIdAndUpdate(club_id,{head:club_head._id})
    .then(()=>{
      res.redirect('/club/view_all')
    }).catch(err=>{
      req.flash("error",err)
    res.redirect('/club/view_all')
    })
  })
})

// route for front end to render club page
router.route('/front/:club').get((req,res)=>{
  const club_name = req.params.club
  clubModel.findOne({name:club_name})
    .then(club => {
      clubHeadsModel.findById(club.head,{tokens:0})
      .then(club_head=>{
        clubMemberModel.find({owner:club.head},{owner:0,_id:0,__v:0,createdAt:0,updatedAt:0})
        .then(members=>{res.json({
          'Club name':club.name,
          'Club Description':club.description,
          'Club logo_url':club.logo_url,
          'Club Object_ID':club._id,
          'Club Head name':club_head.user_id,
          'Club Head dp_url':club_head.dp_url,
          'Club Head bio':club_head.bio,
          'Club Head contact':club_head.contact,
          'Club Head email_id':club_head.email_id,
          'Member details':members
        }).catch(err=>{res.json(err)})
      }).catch(err=>{
        res.json(err)
      })
    }).catch(err=>{
      res.json(err)
    })
  
})
})


module.exports = router
