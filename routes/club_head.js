const router = require('express').Router()
const clubHeadsModel = require('../models/ClubHead.model')
const upload = require('../db/upload')
const adminAuth = require('../middleware/adminAuth')
const clubAuth = require('../middleware/clubAuth')

// for rendering password page
router.route('/password/change').get(clubAuth, (req, res) => {
  res.render('update_password_clubHead')
})

// route for changing the password
router.route('/password/change').post(clubAuth, (req, res) => {
  var pswd = req.body.pswd
  clubHeadsModel.findByIdAndUpdate(req.user._id, { pswd: pswd })
    .then(() => {
      res.redirect(307, '/club_head/profile')
    }).catch(err => {
      res.json(err)
    })
})

// route to create club_head
router.route('/create').post(adminAuth, (req, res) => {
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
router.route('/create').get(adminAuth, async (req, res) => {
  res.render('create_club_head')
})

// route for updating profile
router.route('/profile/update').post(clubAuth, upload.single('profpic'), async (req, res) => {

  var dpurl = req.body.dp_url

  if (req.file != undefined) {
    dpurl = req.file.filename
  }
  
  const updates = Object.keys(req.body)

  try{

    const user = req.user

    updates.forEach((update) => {
      user[update] = req.body[update]
    })

    await user.save()

    res.render('landing_clubHead', {
      id: user._id,
      club_name: user.club_name,
      name: user.name,
      user_id: user.user_id,
      pswd: user.pswd,
      email_id: user.email_id,
      contact: user.contact,
      bio: user.bio,
      dp_url: user.dp_url
    })

  }catch(e){
    res.status(400).json(e)
  }

})

// for rendering update profile
router.route('/profile/update').get(clubAuth, (req, res) => {
  // turn on the projections as per necessity
  res.render('update_profile_clubHead', { user: req.user })
})

// route for rendering profile and action page
router.route('/login').post(async (req, res) => {
  // console.log(req.body);
  
  const user_id = req.body.user_id
  const pswd = req.body.pswd

  try{

    const user = await clubHeadsModel.findOne({user_id, pswd})
    console.log(user)

    if(!user){
      throw new Error()
    }

    const token = await user.generateAuthToken(req, res)
    console.log(token)

    res.render('landing_clubHead', {
        id: user._id,
        club_name: user.club_name,
        name: user.name,
        user_id: user.user_id,
        pswd: user.pswd,
        email_id: user.email_id,
        contact: user.contact,
        bio: user.bio,
        dp_url: user.dp_url
    })

  }catch(e){
    //console.log()
    res.status(400).json('Unable to Login')
  }
 
})

//route for viewing profile of club head
router.route('/profile').post(clubAuth, (req, res) => {
  const user = req.user

  return res.render('landing_clubHead', {
    id: user._id,
    club_name: user.club_name,
    name: user.name,
    user_id: user.user_id,
    pswd: user.pswd,
    email_id: user.email_id,
    contact: user.contact,
    bio: user.bio,
    dp_url: user.dp_url
  })
})

// route to view all club_heads
router.route('/view_all').get(adminAuth, (req, res) => {
  clubHeadsModel.find({},(err,club_heads)=>{
    if(err){
      res.json(err)
    }else{
    res.render('view_club_heads',{club_heads:club_heads})
    }
  })
})

// route to delete a club_head
router.route('/delete/:id').get(adminAuth, (req,res)=>{
  const club_head_id = req.params.id
  clubHeadsModel.findByIdAndRemove(club_head_id)
  .then(()=>{
    res.redirect('/club_head/view_all')
  }).catch(err=>{
    res.json(err)
  })
})

//route for logging out
router.route('/logout/').get(clubAuth, async (req,res) => {
  try{

    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })

    await req.user.save()

    res.redirect('/')

  }catch(e){
    res.json({e})
  }
})

module.exports = router
