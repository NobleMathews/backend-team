const router = require('express').Router()
const challengeModel = require('../models/Challenge.model')
const {upload, uploadf}= require('../db/upload')
const adminAuth = require('../middleware/adminAuth');

router.route('/create/').get(adminAuth, (req, res) => {
    res.render('create_challenge', { alerts: req.flash('error'),page_name:"challenge"})
})

router.route('/create').post(adminAuth,upload.single('photo'), (req, res) => {
    let photo_url
    var documentIDs = []
    if (req.file == undefined) {
      photo_url = ' '
    } else {
      photo_url = `${req.file.filename}`
      // req.files.forEach(function (file,index) {
        documentIDs.push([req.file.filename,req.file.id]);
      // })
    }
    const challenge = new challengeModel({
        name: req.body.name,
        description: req.body.description,
        registration_end: req.body.registration_end,
        registration_start: req.body.registration_start,
        ref_url:req.body.ref_url,
        photo: photo_url,
        category: req.body.category,
        documentIDs:documentIDs,
      })
    
      challenge.save((err, challenge) => { // saving the challenge in database
        if (err) {
          req.flash("error",err.message)
        }
          res.redirect("/challenges/view_all")
      }) 
})

router.route('/update').get(adminAuth, async (req, res) => {
    
})


router.route('/update/').post(adminAuth, upload.single('photo') ,async (req, res) => {
    
})

router.route('/delete/:id').delete(adminAuth, (req, res) => { 
})

router.route('/view_all').get(adminAuth, (req, res) => {
    challengesModel.find({}).sort({registration_end:-1})
      .then(challenges => {
        res.render('view_challenges', { alerts: req.flash('error'),challenges: challenges, moment: moment, page_name:'challenge' })
      }).catch((err) => {
        req.flash("error",err.message)
        res.redirect('/admin/profile')
      })
})



module.exports = router
