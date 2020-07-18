const router = require('express').Router()
const clubHeadsModel = require('../models/ClubHead.model')
const {upload, uploadf}= require('../db/upload')
const adminAuth = require('../middleware/adminAuth')
const clubAuth = require('../middleware/clubAuth')

// for rendering password page
router.route('/password/change').get(clubAuth, (req, res) => {
  res.render('update_password_clubHead', { alerts: req.flash('error'),page_name:"home"})
})

// route for changing the password
router.route('/password/change').post(clubAuth,async (req, res) => {
  var pswd = req.body.pswd

  try{
    req.user.pswd = pswd
    await req.user.save()
    res.redirect(307, '/club_head/profile')
  }catch(err){
    req.flash("error",err.message)
res.redirect('/club_head/view_all')
  }

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
      req.flash("error",err.message)
      res.redirect('/club_head/view_all')
    }else{
      res.redirect('/club_head/view_all')
    }
  })
})

// route to render club_head create page
router.route('/create').get(adminAuth, async (req, res) => {
  res.render('create_club_head', { alerts: req.flash('error'),page_name:"club_heads"})
})

router.route('/update/:id').get(adminAuth, (req,res)=>{
  res.render('update_clubHead',{id:req.params.id,alerts: req.flash('error'),page_name:"club_heads"})
})

router.route('/update/:id').post(adminAuth,(req, res) => {
  clubHeadsModel.findOne({_id:req.params.id},function (err, user) {
    if (err) {
      req.flash("error",err.message)
      res.redirect('/club_head/view_all')
    }
    user.user_id = req.body.user_id;
    user.pswd= req.body.pswd
    user.email_id= req.body.email_id
    user.contact=''
    user.dp_url=''
    user.bio=''
    user.save(function (err) {
      if (err) {
        req.flash("error",err.message)
        res.redirect('/club_head/view_all')
      }
      res.redirect('/club_head/view_all')
    });
  });
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
    user["dp_url"] = dpurl

    await user.save()

    res.render('landing_clubHead', { alerts: req.flash('error'),user:user,page_name:"home"})

  }catch(e){
      req.flash("error",e.message)
      res.redirect('/club_head/profile')
  }

})

// for rendering update profile
router.route('/profile/update').get(clubAuth, (req, res) => {
  // turn on the projections as per necessity
  res.render('update_profile_clubHead', { alerts: req.flash('error'), user: req.user, page_name:"home"})
})

// route for rendering profile and action page
router.route('/login').post(async (req, res) => {
  
  
  const user_id = req.body.user_id
  const pswd = req.body.pswd

  try{

    const user = await clubHeadsModel.findByCredentials(user_id, pswd)

    if(!user){
      throw new Error()
    }

    const token = await user.generateAuthToken(req, res)
    

    res.render('landing_clubHead', { alerts: req.flash('error'),user : user,page_name:'home'})

  }catch(e){
    res.render('index',{alerts:req.flash("Please check UserID / Password")})
  }
 
})

//route for viewing profile of club head
router.route('/profile').post(clubAuth, (req, res) => {
  const user = req.user

  return res.render('landing_clubHead', { alerts: req.flash('error'),user : user,page_name:'home'})
})
router.route('/profile').get(clubAuth, (req, res) => {
  const user = req.user

  return res.render('landing_clubHead', { alerts: req.flash('error'),user : user,page_name:'home'})
})
// route to view all club_heads
router.route('/view_all').get(adminAuth, (req, res) => {
  clubHeadsModel.find({},(err,club_heads)=>{
    if(err){
      req.flash("error",err.message)
res.redirect('/club_head/view_all')
    }else{
    res.render('view_club_heads', { alerts: req.flash('error'),club_heads:club_heads, page_name:"club_heads"})
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
    req.flash("error",err.message)
res.redirect('/club_head/view_all')
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

  }catch(err){
    req.flash("error",err.message)
    res.redirect('/')
  }
})

module.exports = router
